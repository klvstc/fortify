import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { GoogleGenAI, Type } from "@google/genai";
import { Buffer } from "buffer";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();
const purchaseTokensRef = db.collection("purchaseTokens");

// --- IN-CODE GEMINI CLIENT INITIALIZATION ---
let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
    if (ai) {
        return ai;
    }
    // This is NOT a recommended security practice for production.
    // API keys should be stored in a secure secret manager.
    // This is a temporary solution for the specific environment.
    const encodedApiKey = "QUl6YVN5Q3FZR210b0NzRTZ5cmtYRW5LcVA2aG1XZjFoaW5zNjU0";
    try {
        const apiKey = Buffer.from(encodedApiKey, 'base64').toString('ascii');
        ai = new GoogleGenAI({ apiKey });
        logger.info("Successfully initialized Gemini client from in-code encoded key.");
        return ai;
    } catch (error) {
        logger.error("Failed to decode or initialize Gemini client from the encoded key. Is it a valid Base64 string?", error);
        return null;
    }
}


// --- Corrected Platform-specific configurations ---
const apnsConfig: admin.messaging.ApnsConfig = {
    payload: {
        aps: {
            "mutable-content": 1
        }
    },
    fcmOptions: {
        imageUrl: 'https://fortify-final.firebaseapp.com/icons/icon-512x512.png',
    },
};

const webpushConfig: admin.messaging.WebpushConfig = {
    fcmOptions: {
        link: "https://fortify-final.firebaseapp.com",
    },
    headers: {
        Urgency: 'high',
    },
    notification: {
        // This is a fallback, but the data payload will be used by the service worker
        icon: 'https://fortify-final.firebaseapp.com/icons/icon-192x192.png',
        badge: 'https://fortify-final.firebaseapp.com/icons/icon-192x192.png',
    },
};


// Use the Firebase Hosting URL for static assets like notification icons.
const appUrl = "https://fortify-final.firebaseapp.com";

interface CheckInData {
  lastCheckinTimestamp: number | null;
  streak: number;
}

interface JournalEntry {
    content: string;
    date: string; // ISO string
}

interface UserProfile {
  fcmToken: string;
  timezone: string;
  notificationTime: string; // "HH:mm"
  checkInData: CheckInData;
  journalEntries?: JournalEntry[];
  lastShownRankName?: string;
  visionNarrative?: string;
}

const toLocalDateString = (date: Date, timeZone: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  };
  return new Intl.DateTimeFormat("sv-SE", options).format(date);
};


export const sendCheckInRemindersV3 = onSchedule(
    // Run every 15 minutes to catch specific user notification times more accurately.
    { schedule: "*/15 * * * *", timeZone: "UTC" },
    async (event) => {
        const now = new Date();
        const scheduleInterval = 15; // Must match the schedule's minute interval.
        logger.log(`Reminder job triggered at ${now.toUTCString()}, checking for notifications in the last ${scheduleInterval} minutes.`);

        const usersSnapshot = await db
            .collection("users")
            .where("fcmToken", "!=", null)
            .get();

        if (usersSnapshot.empty) {
            logger.log("No users with an FCM token found.");
            return;
        }

        const notificationsToSend: { uid: string; user: UserProfile }[] = [];

        usersSnapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
            const user = doc.data() as UserProfile;
            const uid = doc.id;
            
            if (!user.fcmToken) return;

            const userTimezone = user.timezone;
            const userNotificationTime = user.notificationTime;

            if (!userTimezone || !userNotificationTime) {
                logger.warn(`User ${uid} has an FCM token but is missing timezone or notificationTime. Skipping.`);
                return;
            }

            // --- REFINED TIME-CHECKING LOGIC ---

            // 1. Get user's target time in minutes from midnight (e.g., "21:30" -> 1290)
            const [targetHour, targetMinute] = userNotificationTime.split(':').map(Number);
            const targetTimeInMinutes = targetHour * 60 + targetMinute;
            
            // 2. Get the current time in minutes from midnight *in the user's timezone*
            let currentHourInUserTz: number;
            let currentMinuteInUserTz: number;

            try {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: userTimezone,
                    hour: 'numeric',
                    minute: 'numeric',
                    hourCycle: 'h23',
                });
                const parts = formatter.formatToParts(now);
                currentHourInUserTz = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
                currentMinuteInUserTz = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
            } catch (error) {
                logger.error(`Invalid timezone for user ${uid}: '${userTimezone}'. Skipping.`, error);
                return;
            }

            const currentTimeInMinutes = currentHourInUserTz * 60 + currentMinuteInUserTz;

            // 3. Check if the target time falls within the last execution window.
            const shouldNotify = currentTimeInMinutes >= targetTimeInMinutes && currentTimeInMinutes < targetTimeInMinutes + scheduleInterval;

            if (!shouldNotify) {
                return; // Not the right time for this user.
            }

            // --- END of REFINED TIME-CHECKING LOGIC ---

            const lastCheckinTimestamp = user.checkInData?.lastCheckinTimestamp;
            if (lastCheckinTimestamp) {
                const lastCheckinDate = new Date(lastCheckinTimestamp);
                const lastCheckinLocalDateStr = toLocalDateString(lastCheckinDate, userTimezone);
                const nowLocalDateStr = toLocalDateString(now, userTimezone);

                if (lastCheckinLocalDateStr === nowLocalDateStr) {
                    logger.log(`User ${uid} is due for a notification, but already checked in today. Skipping.`);
                    return;
                }
            }
            
            logger.log(`User ${uid} is due for a notification. Target: ${userNotificationTime}, Current: ${String(currentHourInUserTz).padStart(2, '0')}:${String(currentMinuteInUserTz).padStart(2, '0')} in ${userTimezone}. Adding to queue.`);
            notificationsToSend.push({ uid, user });
        });

        if (notificationsToSend.length === 0) {
            logger.log(`Notification job finished. No users to notify in this ${scheduleInterval}-minute window.`);
            return;
        }

        const geminiClient = getGeminiClient();

        const sendPromises = notificationsToSend.map(async (notif) => {
            const { uid, user } = notif;
            let title = "Fortify Check-in Reminder";
            let body = "It's time for your daily check-in. Keep your streak going!";

            if (geminiClient) {
                 try {
                    const sortedJournals = user.journalEntries?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const journalSummary = sortedJournals?.slice(0, 2).map(e => e.content).join("\n") || "No recent journal entries.";

                    const prompt = `You are an encouraging AI life coach for the app 'Fortify'. Your task is to generate a personalized, short push notification reminder for a user to do their daily check-in.

                    User Context:
                    - Current Streak: ${user.checkInData?.streak || 0} days
                    - Current Rank: ${user.lastShownRankName || "Novice"}
                    - Recent thoughts from their journal: "${journalSummary}"
                    - Their personal vision: "${user.visionNarrative || "To become a better version of themselves."}"

                    Based on this context, generate a notification. The tone should be inspiring and directly related to their journey. Reference their streak, rank, or recent thoughts if possible.

                    Your response MUST be a JSON object with two keys: "title" and "body".
                    - The "title" should be short and catchy (max 40 characters).
                    - The "body" should be a concise, encouraging message (max 100 characters).

                    Do not be generic. Make it feel personal.`;

                    const response = await geminiClient.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    body: { type: Type.STRING }
                                },
                                required: ["title", "body"]
                            }
                        }
                    });
                    
                    if (response.text) {
                        const parsed = JSON.parse(response.text);
                        title = parsed.title || title;
                        body = parsed.body || body;
                        logger.log(`Generated custom notification for ${uid}: "${title}" - "${body}"`);
                    } else {
                        logger.warn(`Gemini response was empty for user ${uid}, falling back to default message.`);
                    }
                } catch (e) {
                    logger.error(`Gemini generation failed for user ${uid}, falling back to default message.`, e);
                }
            }

            const message: admin.messaging.Message = {
                token: user.fcmToken,
                data: {
                    title,
                    body,
                    icon: `${appUrl}/icons/icon-192x192.png`,
                    badge: `${appUrl}/icons/icon-192x192.png`,
                    url: appUrl,
                },
                webpush: webpushConfig,
                apns: apnsConfig,
            };
            return messaging.send(message);
        });
        
        const results = await Promise.allSettled(sendPromises);

        let successCount = 0;
        let failureCount = 0;
        const cleanupPromises: Promise<any>[] = [];

        results.forEach((result, index) => {
            const { uid } = notificationsToSend[index];
            if (result.status === 'fulfilled') {
                successCount++;
            } else {
                failureCount++;
                logger.error(`Failed to send notification to user ${uid}:`, result.reason);
                
                if (result.reason.code === 'messaging/registration-token-not-registered') {
                    logger.log(`Token for user ${uid} is invalid. Removing it from Firestore.`);
                    cleanupPromises.push(
                        db.collection('users').doc(uid).update({ fcmToken: null })
                    );
                }
            }
        });

        if (cleanupPromises.length > 0) {
            await Promise.all(cleanupPromises);
        }

        logger.log(`Notification job finished. Sent: ${successCount}, Failed: ${failureCount}. Cleaned up ${cleanupPromises.length} invalid tokens.`);
    });

// New function to send a test notification
export const sendTestNotification = onCall(async (request: CallableRequest) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to send a test notification.");
    }
    
    const uid = request.auth.uid;
    logger.log(`Sending test notification for user: ${uid}`);

    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            throw new HttpsError("not-found", "User document not found.");
        }
        
        const userData = userDoc.data() as UserProfile;
        const token = userData.fcmToken;

        if (!token) {
            throw new HttpsError("failed-precondition", "No notification token found for this user. Please enable notifications first.");
        }
        
        // Using a 'data' payload to match what the service worker expects for custom data.
        // This makes it a more accurate test of the service worker logic.
        const message: admin.messaging.Message = {
            token: token,
            data: {
                title: "Test Notification",
                body: "If you receive this then everything is working fine.",
                url: appUrl,
            },
            webpush: webpushConfig,
            apns: apnsConfig,
        };

        const response = await messaging.send(message);
        logger.log(`Successfully sent test notification to user ${uid} with message ID: ${response} and ${token}`);
        return { success: true, message: "Test notification sent successfully." };

    } catch (error) {
        logger.error(`Error sending test notification to user ${uid}:`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "An unexpected error occurred while sending the test notification.");
    }
});

// --- PLAY BILLING VERIFICATION ---

const packageName = "app.fortify.twa";

const authClient = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});

const androidpublisher = google.androidpublisher({
    version: "v3",
    auth: authClient,
});

export const verifyPlayPurchase = onCall(async (request: CallableRequest<{ productId: string; token: string; }>) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { productId, token } = request.data;
  const uid = request.auth.uid;

  logger.log(`Verifying purchase for user: ${uid}, product: ${productId}`);

  const tokenRef = purchaseTokensRef.doc(token);
  const tokenDoc = await tokenRef.get();
  if (tokenDoc.exists && tokenDoc.data()?.uid !== uid) {
    throw new HttpsError(
      "permission-denied",
      "This subscription is already linked to another Fortify account."
    );
  }

  try {
    const result = await androidpublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: productId,
      token: token,
    });


    logger.log(`Google Play API Response for user ${uid}:`, result.data);

    if (result.status !== 200) {
      throw new HttpsError("internal", "Google Play API request failed.");
    }
    
    const sub = result.data;

    // paymentState can be: 0 (pending), 1 (received), 2 (free trial)
    // We should allow acknowledgement for any non-pending state.
    const isPaid = sub.paymentState === 1 || sub.paymentState === 2 || typeof sub.paymentState === 'undefined';
    if (!isPaid) {
        throw new HttpsError("failed-precondition", "Subscription payment is not complete or is pending.");
    }
    
    if (!sub.expiryTimeMillis) {
        throw new HttpsError("internal", "Subscription details from Google are incomplete.");
    }
    
    // acknowledgementState can be: 0 (not acknowledged), 1 (acknowledged)
    if (sub.acknowledgementState === 0) {
      try {
        logger.log(`Acknowledging purchase for user: ${uid}, product: ${productId}`);
        await androidpublisher.purchases.subscriptions.acknowledge({
          packageName: packageName,
          subscriptionId: productId,
          token: token,
          requestBody: {},
        });
        logger.log(`Successfully acknowledged purchase for user: ${uid}`);
      } catch (ackError: any) {
        logger.error(`FATAL: Failed to acknowledge purchase for user ${uid}.`, ackError);
        throw new HttpsError("internal", "Failed to confirm your purchase with Google.");
      }
    }

    const expiryDate = new Date(parseInt(sub.expiryTimeMillis, 10));
    const playBillingState = {
        hasActiveSubscription: true,
        subscriptionExpiryDate: expiryDate.toISOString(),
        subscriptionId: productId,
        lastPurchaseToken: token,
    };

    await db.collection("users").doc(uid).set(
        { playBilling: playBillingState },
        { merge: true }
    );
    
    if (!tokenDoc.exists) {
        await tokenRef.set({
            uid: uid,
            productId: productId,
            purchaseTime: sub.startTimeMillis,
        });
        logger.log(`Purchase token ${token} claimed by user ${uid}.`);
    }

    return {
      success: true,
      subscriptionEndDate: expiryDate.toISOString(),
    };
  } catch (error: any) {
    logger.error(`Error verifying Play Purchase for user ${uid}:`, error);
     if (error instanceof HttpsError) {
        throw error;
    }
    if (error.code && (error.code === 404 || error.code === 410)) {
      throw new HttpsError("not-found", "The purchase could not be found or is no longer valid.");
    }
    if (error.response?.data?.error) {
      const gapiError = error.response.data.error;
      throw new HttpsError("internal", `Google Play verification failed: ${gapiError.message}`);
    }
    throw new HttpsError("unknown", "An unknown error occurred during purchase verification.");
  }
});

export const restoreAndVerifyPurchases = onCall(async (request: CallableRequest<{ purchases: { productId: string; token: string; }[] }>) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }
    const uid = request.auth.uid;
  
    try {
      const { purchases } = request.data; 
      let activeSubscription: any = null;
      let latestExpiryTime = 0;
  
      if (Array.isArray(purchases) && purchases.length > 0) {
          logger.log(`Restoring purchases for user: ${uid}. Found ${purchases.length} potential subscriptions.`);
  
          for (const purchase of purchases) {
            try {
              const tokenRef = purchaseTokensRef.doc(purchase.token);
              const tokenDoc = await tokenRef.get();
              if (tokenDoc.exists && tokenDoc.data()?.uid !== uid) {
                logger.warn(`User ${uid} attempted to restore token owned by ${tokenDoc.data()?.uid}. Skipping.`);
                continue; 
              }
  
              const result = await androidpublisher.purchases.subscriptions.get({
                packageName: packageName,
                subscriptionId: purchase.productId,
                token: purchase.token,
              });
  
              const sub = result.data;
              const isPaid = sub.paymentState === 1 || sub.paymentState === 2 || typeof sub.paymentState === 'undefined';
              
              if (result.status === 200 && isPaid && sub.expiryTimeMillis) {
                const expiryTime = parseInt(sub.expiryTimeMillis, 10);
                
                if (expiryTime > latestExpiryTime) {
                    latestExpiryTime = expiryTime;
                    activeSubscription = { ...purchase, result: sub };
                }
              }
            } catch (error) {
              logger.warn(`Could not verify token for productId ${purchase.productId}. Skipping.`);
            }
          }
      }
  
      if (activeSubscription) {
        const sub = activeSubscription.result;
        
        if (!sub.expiryTimeMillis) {
          throw new HttpsError("internal", "We found an active subscription, but its details are incomplete.");
        }

        const googleProductId = activeSubscription.productId;
        const expiryTime = sub.expiryTimeMillis;
        
        if (sub.acknowledgementState === 0) { // 0 means not acknowledged
            try {
              logger.log(`Acknowledging restored purchase for user: ${uid}, product: ${googleProductId}`);
              await androidpublisher.purchases.subscriptions.acknowledge({
                  packageName: packageName,
                  subscriptionId: googleProductId,
                  token: activeSubscription.token,
                  requestBody: {},
              });
            } catch (ackError: any) {
                logger.error(`FATAL: Failed to acknowledge restored purchase for user ${uid}.`, ackError);
                throw new HttpsError("internal", "We found your active subscription, but failed to confirm it.");
            }
        }
  
        const expiryDate = new Date(parseInt(expiryTime, 10));
        const playBillingState = {
          hasActiveSubscription: true,
          subscriptionExpiryDate: expiryDate.toISOString(),
          subscriptionId: googleProductId,
          lastPurchaseToken: activeSubscription.token,
        };
  
        await db.collection("users").doc(uid).set(
          { playBilling: playBillingState },
          { merge: true }
        );
        
        const tokenRef = purchaseTokensRef.doc(activeSubscription.token);
        const tokenDoc = await tokenRef.get();
        if (!tokenDoc.exists) {
            await tokenRef.set({ uid: uid, productId: googleProductId, purchaseTime: sub.startTimeMillis });
        }
  
        return {
          success: true,
          subscriptionEndDate: expiryDate.toISOString(),
        };
      } else {
        // Handle logic for when no active subscription is found after checking all tokens.
        const userDoc = await db.collection("users").doc(uid).get();
        const wasSubscribed = userDoc.data()?.playBilling?.hasActiveSubscription === true;
        
        if (wasSubscribed) {
            // If they were previously subscribed, grant a grace period.
            const gracePeriodEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            await db.collection("users").doc(uid).set({
                playBilling: { hasActiveSubscription: false, gracePeriodEndDate: gracePeriodEndDate.toISOString() },
            }, { merge: true });
            return {
                success: true, status: "grace_period_activated", gracePeriodEndDate: gracePeriodEndDate.toISOString(),
            };
        } else {
            // If they were not previously subscribed, just mark as inactive.
            await db.collection("users").doc(uid).set({
                playBilling: { hasActiveSubscription: false },
            }, { merge: true });
            throw new HttpsError("not-found", "No active subscription found for your Google account.");
        }
      }
    } catch (error: any) {
      if (error instanceof HttpsError) {
          throw error;
      }
      throw new HttpsError("internal", "An internal error occurred while trying to restore your purchases.");
    }
});
  
export const dailyPurchaseRestore = onSchedule(
    { schedule: "every 24 hours", timeoutSeconds: 540 },
    async (event) => {
      logger.log("Starting daily purchase restore job.");
  
      const usersSnapshot = await db
        .collection("users")
        .where("playBilling.hasActiveSubscription", "==", true)
        .where("playBilling.lastPurchaseToken", "!=", null)
        .get();
  
      if (usersSnapshot.empty) {
        logger.log("No active subscribers found to check.");
        return;
      }
      
      const promises: Promise<any>[] = [];
  
      usersSnapshot.forEach((doc) => {
          const uid = doc.id;
          const userData = doc.data();
          const token = userData.playBilling.lastPurchaseToken;
          const productId = userData.playBilling.subscriptionId;

          if (!token || !productId) {
            logger.warn(`User ${uid} is missing token or productId for daily check. Skipping.`);
            return;
          }
  
          const job = async () => {
              try {
                  const result = await androidpublisher.purchases.subscriptions.get({
                      packageName: packageName,
                      subscriptionId: productId,
                      token: token,
                  });
  
                  if (result.status !== 200) {
                      logger.error(`Google API check failed for user ${uid} with status ${result.status}`);
                      return;
                  }
  
                  const sub = result.data;
                  // paymentState can be: 0 (pending), 1 (received), 2 (free trial)
                  const isPaid = sub.paymentState === 1 || sub.paymentState === 2;

                  if (isPaid && sub.expiryTimeMillis) {
                      const expiryDate = new Date(parseInt(sub.expiryTimeMillis, 10));
                      // Only update if the date is different to avoid unnecessary writes
                      if (userData.playBilling.subscriptionExpiryDate !== expiryDate.toISOString()) {
                          await doc.ref.update({ 'playBilling.subscriptionExpiryDate': expiryDate.toISOString() });
                      }
                      // If the subscription is somehow marked inactive but Google says it's paid, correct it.
                      if (!userData.playBilling.hasActiveSubscription) {
                        await doc.ref.update({ 'playBilling.hasActiveSubscription': true });
                      }
                  } else {
                      // Subscription is no longer active according to Google.
                      await doc.ref.update({'playBilling.hasActiveSubscription': false});
                  }
              } catch (error: any) {
                  if (error.code && (error.code === 404 || error.code === 410)) {
                       // Subscription is not found or has expired. Mark as inactive.
                       await doc.ref.update({'playBilling.hasActiveSubscription': false});
                  } else {
                      logger.error(`Error processing daily restore for user ${uid}:`, error);
                  }
              }
          };
          promises.push(job());
      });
      
      await Promise.all(promises);
      logger.log(`Daily purchase restore job finished. Processed ${promises.length} users.`);
    }
);

export const sendSimpleTestNotification = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
    }
    const uid = request.auth.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    const token = userDoc.data()?.fcmToken;

    if (!token) {
        throw new HttpsError("failed-precondition", "No token found for this user.");
    }

    // This message uses the 'notification' payload, which is simpler
    const message: admin.messaging.Message = {
        token: token,
        notification: {
            title: 'Simple Test ✨',
            body: 'This message came directly from a simple backend function.',
        },
        webpush: {
            fcmOptions: {
                link: "https://fortify-final.firebaseapp.com"
            }
        }
    };

    try {
        await messaging.send(message);
        logger.log(`Successfully sent simple test to ${uid}.`);
        return { success: true };
    } catch (error) {
        logger.error(`Simple test failed for user ${uid}:`, error);
        throw new HttpsError("internal", "Failed to send simple notification.");
    }
});
