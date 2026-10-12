"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSimpleTestNotification = exports.dailyPurchaseRestore = exports.restoreAndVerifyPurchases = exports.verifyPlayPurchase = exports.sendTestNotification = exports.sendCheckInRemindersV3 = void 0;
const firebase_functions_1 = require("firebase-functions");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const googleapis_1 = require("googleapis");
const genai_1 = require("@google/genai");
const buffer_1 = require("buffer");
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
const purchaseTokensRef = db.collection("purchaseTokens");
// --- IN-CODE GEMINI CLIENT INITIALIZATION ---
let ai = null;
function getGeminiClient() {
    if (ai) {
        return ai;
    }
    // This is NOT a recommended security practice for production.
    // API keys should be stored in a secure secret manager.
    // This is a temporary solution for the specific environment.
    const encodedApiKey = "QUl6YVN5Q3FZR210b0NzRTZ5cmtYRW5LcVA2aG1XZjFoaW5zNjU0";
    try {
        const apiKey = buffer_1.Buffer.from(encodedApiKey, 'base64').toString('ascii');
        ai = new genai_1.GoogleGenAI({ apiKey });
        firebase_functions_1.logger.info("Successfully initialized Gemini client from in-code encoded key.");
        return ai;
    }
    catch (error) {
        firebase_functions_1.logger.error("Failed to decode or initialize Gemini client from the encoded key. Is it a valid Base64 string?", error);
        return null;
    }
}
// --- Corrected Platform-specific configurations ---
const apnsConfig = {
    payload: {
        aps: {
            "mutable-content": 1
        }
    },
    fcmOptions: {
        imageUrl: 'https://fortify-final.firebaseapp.com/icons/icon-512x512.png',
    },
};
const webpushConfig = {
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
const toLocalDateString = (date, timeZone) => {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone,
    };
    return new Intl.DateTimeFormat("sv-SE", options).format(date);
};
exports.sendCheckInRemindersV3 = (0, scheduler_1.onSchedule)(
// Run every 15 minutes to catch specific user notification times more accurately.
{ schedule: "*/15 * * * *", timeZone: "UTC" }, async (event) => {
    const now = new Date();
    const scheduleInterval = 15; // Must match the schedule's minute interval.
    firebase_functions_1.logger.log(`Reminder job triggered at ${now.toUTCString()}, checking for notifications in the last ${scheduleInterval} minutes.`);
    const usersSnapshot = await db
        .collection("users")
        .where("fcmToken", "!=", null)
        .get();
    if (usersSnapshot.empty) {
        firebase_functions_1.logger.log("No users with an FCM token found.");
        return;
    }
    const notificationsToSend = [];
    usersSnapshot.forEach((doc) => {
        var _a, _b, _c;
        const user = doc.data();
        const uid = doc.id;
        if (!user.fcmToken)
            return;
        const userTimezone = user.timezone;
        const userNotificationTime = user.notificationTime;
        if (!userTimezone || !userNotificationTime) {
            firebase_functions_1.logger.warn(`User ${uid} has an FCM token but is missing timezone or notificationTime. Skipping.`);
            return;
        }
        // --- REFINED TIME-CHECKING LOGIC ---
        // 1. Get user's target time in minutes from midnight (e.g., "21:30" -> 1290)
        const [targetHour, targetMinute] = userNotificationTime.split(':').map(Number);
        const targetTimeInMinutes = targetHour * 60 + targetMinute;
        // 2. Get the current time in minutes from midnight *in the user's timezone*
        let currentHourInUserTz;
        let currentMinuteInUserTz;
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: userTimezone,
                hour: 'numeric',
                minute: 'numeric',
                hourCycle: 'h23',
            });
            const parts = formatter.formatToParts(now);
            currentHourInUserTz = parseInt(((_a = parts.find(p => p.type === 'hour')) === null || _a === void 0 ? void 0 : _a.value) || '0');
            currentMinuteInUserTz = parseInt(((_b = parts.find(p => p.type === 'minute')) === null || _b === void 0 ? void 0 : _b.value) || '0');
        }
        catch (error) {
            firebase_functions_1.logger.error(`Invalid timezone for user ${uid}: '${userTimezone}'. Skipping.`, error);
            return;
        }
        const currentTimeInMinutes = currentHourInUserTz * 60 + currentMinuteInUserTz;
        // 3. Check if the target time falls within the last execution window.
        const shouldNotify = currentTimeInMinutes >= targetTimeInMinutes && currentTimeInMinutes < targetTimeInMinutes + scheduleInterval;
        if (!shouldNotify) {
            return; // Not the right time for this user.
        }
        // --- END of REFINED TIME-CHECKING LOGIC ---
        const lastCheckinTimestamp = (_c = user.checkInData) === null || _c === void 0 ? void 0 : _c.lastCheckinTimestamp;
        if (lastCheckinTimestamp) {
            const lastCheckinDate = new Date(lastCheckinTimestamp);
            const lastCheckinLocalDateStr = toLocalDateString(lastCheckinDate, userTimezone);
            const nowLocalDateStr = toLocalDateString(now, userTimezone);
            if (lastCheckinLocalDateStr === nowLocalDateStr) {
                firebase_functions_1.logger.log(`User ${uid} is due for a notification, but already checked in today. Skipping.`);
                return;
            }
        }
        firebase_functions_1.logger.log(`User ${uid} is due for a notification. Target: ${userNotificationTime}, Current: ${String(currentHourInUserTz).padStart(2, '0')}:${String(currentMinuteInUserTz).padStart(2, '0')} in ${userTimezone}. Adding to queue.`);
        notificationsToSend.push({ uid, user });
    });
    if (notificationsToSend.length === 0) {
        firebase_functions_1.logger.log(`Notification job finished. No users to notify in this ${scheduleInterval}-minute window.`);
        return;
    }
    const geminiClient = getGeminiClient();
    const sendPromises = notificationsToSend.map(async (notif) => {
        var _a, _b;
        const { uid, user } = notif;
        let title = "Fortify Check-in Reminder";
        let body = "It's time for your daily check-in. Keep your streak going!";
        if (geminiClient) {
            try {
                const sortedJournals = (_a = user.journalEntries) === null || _a === void 0 ? void 0 : _a.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const journalSummary = (sortedJournals === null || sortedJournals === void 0 ? void 0 : sortedJournals.slice(0, 2).map(e => e.content).join("\n")) || "No recent journal entries.";
                const prompt = `You are an encouraging AI life coach for the app 'Fortify'. Your task is to generate a personalized, short push notification reminder for a user to do their daily check-in.

                    User Context:
                    - Current Streak: ${((_b = user.checkInData) === null || _b === void 0 ? void 0 : _b.streak) || 0} days
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
                            type: genai_1.Type.OBJECT,
                            properties: {
                                title: { type: genai_1.Type.STRING },
                                body: { type: genai_1.Type.STRING }
                            },
                            required: ["title", "body"]
                        }
                    }
                });
                if (response.text) {
                    const parsed = JSON.parse(response.text);
                    title = parsed.title || title;
                    body = parsed.body || body;
                    firebase_functions_1.logger.log(`Generated custom notification for ${uid}: "${title}" - "${body}"`);
                }
                else {
                    firebase_functions_1.logger.warn(`Gemini response was empty for user ${uid}, falling back to default message.`);
                }
            }
            catch (e) {
                firebase_functions_1.logger.error(`Gemini generation failed for user ${uid}, falling back to default message.`, e);
            }
        }
        const message = {
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
    const cleanupPromises = [];
    results.forEach((result, index) => {
        const { uid } = notificationsToSend[index];
        if (result.status === 'fulfilled') {
            successCount++;
        }
        else {
            failureCount++;
            firebase_functions_1.logger.error(`Failed to send notification to user ${uid}:`, result.reason);
            if (result.reason.code === 'messaging/registration-token-not-registered') {
                firebase_functions_1.logger.log(`Token for user ${uid} is invalid. Removing it from Firestore.`);
                cleanupPromises.push(db.collection('users').doc(uid).update({ fcmToken: null }));
            }
        }
    });
    if (cleanupPromises.length > 0) {
        await Promise.all(cleanupPromises);
    }
    firebase_functions_1.logger.log(`Notification job finished. Sent: ${successCount}, Failed: ${failureCount}. Cleaned up ${cleanupPromises.length} invalid tokens.`);
});
// New function to send a test notification
exports.sendTestNotification = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in to send a test notification.");
    }
    const uid = request.auth.uid;
    firebase_functions_1.logger.log(`Sending test notification for user: ${uid}`);
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError("not-found", "User document not found.");
        }
        const userData = userDoc.data();
        const token = userData.fcmToken;
        if (!token) {
            throw new https_1.HttpsError("failed-precondition", "No notification token found for this user. Please enable notifications first.");
        }
        // Using a 'data' payload to match what the service worker expects for custom data.
        // This makes it a more accurate test of the service worker logic.
        const message = {
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
        firebase_functions_1.logger.log(`Successfully sent test notification to user ${uid} with message ID: ${response} and ${token}`);
        return { success: true, message: "Test notification sent successfully." };
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error sending test notification to user ${uid}:`, error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError("internal", "An unexpected error occurred while sending the test notification.");
    }
});
// --- PLAY BILLING VERIFICATION ---
const packageName = "app.fortify.twa";
const authClient = new googleapis_1.google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});
const androidpublisher = googleapis_1.google.androidpublisher({
    version: "v3",
    auth: authClient,
});
exports.verifyPlayPurchase = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { productId, token } = request.data;
    const uid = request.auth.uid;
    firebase_functions_1.logger.log(`Verifying purchase for user: ${uid}, product: ${productId}`);
    const tokenRef = purchaseTokensRef.doc(token);
    const tokenDoc = await tokenRef.get();
    if (tokenDoc.exists && ((_a = tokenDoc.data()) === null || _a === void 0 ? void 0 : _a.uid) !== uid) {
        throw new https_1.HttpsError("permission-denied", "This subscription is already linked to another Fortify account.");
    }
    try {
        const result = await androidpublisher.purchases.subscriptions.get({
            packageName: packageName,
            subscriptionId: productId,
            token: token,
        });
        firebase_functions_1.logger.log(`Google Play API Response for user ${uid}:`, result.data);
        if (result.status !== 200) {
            throw new https_1.HttpsError("internal", "Google Play API request failed.");
        }
        const sub = result.data;
        // paymentState can be: 0 (pending), 1 (received), 2 (free trial)
        // We should allow acknowledgement for any non-pending state.
        const isPaid = sub.paymentState === 1 || sub.paymentState === 2 || typeof sub.paymentState === 'undefined';
        if (!isPaid) {
            throw new https_1.HttpsError("failed-precondition", "Subscription payment is not complete or is pending.");
        }
        if (!sub.expiryTimeMillis) {
            throw new https_1.HttpsError("internal", "Subscription details from Google are incomplete.");
        }
        // acknowledgementState can be: 0 (not acknowledged), 1 (acknowledged)
        if (sub.acknowledgementState === 0) {
            try {
                firebase_functions_1.logger.log(`Acknowledging purchase for user: ${uid}, product: ${productId}`);
                await androidpublisher.purchases.subscriptions.acknowledge({
                    packageName: packageName,
                    subscriptionId: productId,
                    token: token,
                    requestBody: {},
                });
                firebase_functions_1.logger.log(`Successfully acknowledged purchase for user: ${uid}`);
            }
            catch (ackError) {
                firebase_functions_1.logger.error(`FATAL: Failed to acknowledge purchase for user ${uid}.`, ackError);
                throw new https_1.HttpsError("internal", "Failed to confirm your purchase with Google.");
            }
        }
        const expiryDate = new Date(parseInt(sub.expiryTimeMillis, 10));
        const playBillingState = {
            hasActiveSubscription: true,
            subscriptionExpiryDate: expiryDate.toISOString(),
            subscriptionId: productId,
            lastPurchaseToken: token,
        };
        await db.collection("users").doc(uid).set({ playBilling: playBillingState }, { merge: true });
        if (!tokenDoc.exists) {
            await tokenRef.set({
                uid: uid,
                productId: productId,
                purchaseTime: sub.startTimeMillis,
            });
            firebase_functions_1.logger.log(`Purchase token ${token} claimed by user ${uid}.`);
        }
        return {
            success: true,
            subscriptionEndDate: expiryDate.toISOString(),
        };
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error verifying Play Purchase for user ${uid}:`, error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        if (error.code && (error.code === 404 || error.code === 410)) {
            throw new https_1.HttpsError("not-found", "The purchase could not be found or is no longer valid.");
        }
        if ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) {
            const gapiError = error.response.data.error;
            throw new https_1.HttpsError("internal", `Google Play verification failed: ${gapiError.message}`);
        }
        throw new https_1.HttpsError("unknown", "An unknown error occurred during purchase verification.");
    }
});
exports.restoreAndVerifyPurchases = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const uid = request.auth.uid;
    try {
        const { purchases } = request.data;
        let activeSubscription = null;
        let latestExpiryTime = 0;
        if (Array.isArray(purchases) && purchases.length > 0) {
            firebase_functions_1.logger.log(`Restoring purchases for user: ${uid}. Found ${purchases.length} potential subscriptions.`);
            for (const purchase of purchases) {
                try {
                    const tokenRef = purchaseTokensRef.doc(purchase.token);
                    const tokenDoc = await tokenRef.get();
                    if (tokenDoc.exists && ((_a = tokenDoc.data()) === null || _a === void 0 ? void 0 : _a.uid) !== uid) {
                        firebase_functions_1.logger.warn(`User ${uid} attempted to restore token owned by ${(_b = tokenDoc.data()) === null || _b === void 0 ? void 0 : _b.uid}. Skipping.`);
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
                            activeSubscription = Object.assign(Object.assign({}, purchase), { result: sub });
                        }
                    }
                }
                catch (error) {
                    firebase_functions_1.logger.warn(`Could not verify token for productId ${purchase.productId}. Skipping.`);
                }
            }
        }
        if (activeSubscription) {
            const sub = activeSubscription.result;
            if (!sub.expiryTimeMillis) {
                throw new https_1.HttpsError("internal", "We found an active subscription, but its details are incomplete.");
            }
            const googleProductId = activeSubscription.productId;
            const expiryTime = sub.expiryTimeMillis;
            if (sub.acknowledgementState === 0) { // 0 means not acknowledged
                try {
                    firebase_functions_1.logger.log(`Acknowledging restored purchase for user: ${uid}, product: ${googleProductId}`);
                    await androidpublisher.purchases.subscriptions.acknowledge({
                        packageName: packageName,
                        subscriptionId: googleProductId,
                        token: activeSubscription.token,
                        requestBody: {},
                    });
                }
                catch (ackError) {
                    firebase_functions_1.logger.error(`FATAL: Failed to acknowledge restored purchase for user ${uid}.`, ackError);
                    throw new https_1.HttpsError("internal", "We found your active subscription, but failed to confirm it.");
                }
            }
            const expiryDate = new Date(parseInt(expiryTime, 10));
            const playBillingState = {
                hasActiveSubscription: true,
                subscriptionExpiryDate: expiryDate.toISOString(),
                subscriptionId: googleProductId,
                lastPurchaseToken: activeSubscription.token,
            };
            await db.collection("users").doc(uid).set({ playBilling: playBillingState }, { merge: true });
            const tokenRef = purchaseTokensRef.doc(activeSubscription.token);
            const tokenDoc = await tokenRef.get();
            if (!tokenDoc.exists) {
                await tokenRef.set({ uid: uid, productId: googleProductId, purchaseTime: sub.startTimeMillis });
            }
            return {
                success: true,
                subscriptionEndDate: expiryDate.toISOString(),
            };
        }
        else {
            // Handle logic for when no active subscription is found after checking all tokens.
            const userDoc = await db.collection("users").doc(uid).get();
            const wasSubscribed = ((_d = (_c = userDoc.data()) === null || _c === void 0 ? void 0 : _c.playBilling) === null || _d === void 0 ? void 0 : _d.hasActiveSubscription) === true;
            if (wasSubscribed) {
                // If they were previously subscribed, grant a grace period.
                const gracePeriodEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
                await db.collection("users").doc(uid).set({
                    playBilling: { hasActiveSubscription: false, gracePeriodEndDate: gracePeriodEndDate.toISOString() },
                }, { merge: true });
                return {
                    success: true, status: "grace_period_activated", gracePeriodEndDate: gracePeriodEndDate.toISOString(),
                };
            }
            else {
                // If they were not previously subscribed, just mark as inactive.
                await db.collection("users").doc(uid).set({
                    playBilling: { hasActiveSubscription: false },
                }, { merge: true });
                throw new https_1.HttpsError("not-found", "No active subscription found for your Google account.");
            }
        }
    }
    catch (error) {
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError("internal", "An internal error occurred while trying to restore your purchases.");
    }
});
exports.dailyPurchaseRestore = (0, scheduler_1.onSchedule)({ schedule: "every 24 hours", timeoutSeconds: 540 }, async (event) => {
    firebase_functions_1.logger.log("Starting daily purchase restore job.");
    const usersSnapshot = await db
        .collection("users")
        .where("playBilling.hasActiveSubscription", "==", true)
        .where("playBilling.lastPurchaseToken", "!=", null)
        .get();
    if (usersSnapshot.empty) {
        firebase_functions_1.logger.log("No active subscribers found to check.");
        return;
    }
    const promises = [];
    usersSnapshot.forEach((doc) => {
        const uid = doc.id;
        const userData = doc.data();
        const token = userData.playBilling.lastPurchaseToken;
        const productId = userData.playBilling.subscriptionId;
        if (!token || !productId) {
            firebase_functions_1.logger.warn(`User ${uid} is missing token or productId for daily check. Skipping.`);
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
                    firebase_functions_1.logger.error(`Google API check failed for user ${uid} with status ${result.status}`);
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
                }
                else {
                    // Subscription is no longer active according to Google.
                    await doc.ref.update({ 'playBilling.hasActiveSubscription': false });
                }
            }
            catch (error) {
                if (error.code && (error.code === 404 || error.code === 410)) {
                    // Subscription is not found or has expired. Mark as inactive.
                    await doc.ref.update({ 'playBilling.hasActiveSubscription': false });
                }
                else {
                    firebase_functions_1.logger.error(`Error processing daily restore for user ${uid}:`, error);
                }
            }
        };
        promises.push(job());
    });
    await Promise.all(promises);
    firebase_functions_1.logger.log(`Daily purchase restore job finished. Processed ${promises.length} users.`);
});
exports.sendSimpleTestNotification = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in.");
    }
    const uid = request.auth.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    const token = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
    if (!token) {
        throw new https_1.HttpsError("failed-precondition", "No token found for this user.");
    }
    // This message uses the 'notification' payload, which is simpler
    const message = {
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
        firebase_functions_1.logger.log(`Successfully sent simple test to ${uid}.`);
        return { success: true };
    }
    catch (error) {
        firebase_functions_1.logger.error(`Simple test failed for user ${uid}:`, error);
        throw new https_1.HttpsError("internal", "Failed to send simple notification.");
    }
});
//# sourceMappingURL=functions.js.map