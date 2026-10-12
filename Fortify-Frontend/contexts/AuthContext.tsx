import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth, firestore } from '../firebase-config';
import { MENTOR_PERSONAS } from '../constants';
import { type AppState, type PlayBillingState } from '../types';

// This is a mock of the global firebase object provided by the Firebase SDK scripts.
declare const firebase: any;

// Define the shape of the context value
interface AuthContextType {
  user: any | null; // Firebase user object
  loading: boolean;
  appState: AppState;
  setAppState: (newState: Partial<AppState>) => void;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The initial state for a new user, now including all syncable fields
const initialAppState: AppState = {
  streakStartDate: null,
  lastShownRankName: null,
  earnedBadges: [],
  checkInData: { lastCheckinTimestamp: null, streak: 0 },
  aether: 25,
  activeWager: null,
  selectedMentorId: MENTOR_PERSONAS[0].id,
  customMentor: { name: "Custom Mentor", description: "A mentor defined by you." },
  appTheme: 'default',
  legacyLog: [],
  hasWrittenProverb: false,
  falseCheckInCounter: 0,
  visionNarrative: null,
  lastReviewDate: null,
  streakOffsetMillis: 0,
  // Fields moved from device to cloud
  journalEntries: [],
  checkInHistory: [],
  legendAchieved: false,
  ratingState: { lastPromptDate: null, promptCount: 0, hasRated: false },
  v2_migration_complete: false,
  mentorChatHistory: [],
  sanctuaryChatHistory: [],
  // Notification settings
  fcmToken: null,
  timezone: null,
  notificationTime: '21:00', // Default to 9:00 PM
  // Subscription fields
  trialStartDate: null,
  hasClaimedRatingReward: false,
  playBilling: null,
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppStateInternal] = useState<AppState>(initialAppState);

  // This function now ONLY writes to Firestore. The local state is updated
  // exclusively by the onSnapshot listener, ensuring a single source of truth.
  const setAppState = useCallback((newState: Partial<AppState>) => {
    if (auth.currentUser) {
        const userDocRef = firestore.collection('users').doc(auth.currentUser.uid);
        // Use set with merge:true to perform a partial update, which is crucial
        // for preventing race conditions between different clients.
        userDocRef.set(newState, { merge: true })
            .catch(error => {
                console.error("Error writing app state to Firestore:", error);
            });
    }
  }, []);

  const login = (email: string, password: string) => {
    return auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        return auth.signInWithEmailAndPassword(email, password);
      });
  };

  const signup = async (email: string, password: string) => {
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    return auth.createUserWithEmailAndPassword(email, password);
  };
  
  const sendPasswordReset = (email: string) => {
    return auth.sendPasswordResetEmail(email);
  };

  const logout = () => {
    return auth.signOut();
  };
  
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser: any) => {
      setUser(currentUser);
      if (!currentUser) {
        setAppStateInternal(initialAppState);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      return; // No user, no Firestore listener needed.
    }

    // ADDED LOGIC: Check for and process pending FCM token from TWA.
    const pendingToken = localStorage.getItem('pendingFCMToken');
    if (pendingToken) {
      const userDocRef = firestore.collection('users').doc(user.uid);
      // Set the token and then remove it from localStorage to prevent re-processing.
      userDocRef.set({ fcmToken: pendingToken }, { merge: true })
        .then(() => {
          localStorage.removeItem('pendingFCMToken');
          console.log('Pending FCM token from localStorage saved for user.');
        })
        .catch((error) => {
          console.error('Error saving pending FCM token:', error);
        });
    }

    setLoading(true);

    const userDocRef = firestore.collection('users').doc(user.uid);

    // Attach a real-time listener to the user's document.
    const unsubscribeFirestore = userDocRef.onSnapshot(async (doc) => {
        if (doc.exists) {
            let data = doc.data() as AppState;
            
            // Perform v2 migration check from localStorage if it hasn't been done.
            if (!data.v2_migration_complete) {
              const uid = user.uid;
              const migratedData: Partial<AppState> = { v2_migration_complete: true };
              
              try {
                const storedJournal = localStorage.getItem(`fortify_journal_${uid}`);
                const storedHistory = localStorage.getItem(`fortify_checkin_history_${uid}`);
                if (storedJournal) migratedData.journalEntries = JSON.parse(storedJournal);
                if (storedHistory) migratedData.checkInHistory = JSON.parse(storedHistory);
              } catch (e) {
                  console.error("Failed to parse migration data from localStorage", e);
              }

              // Non-JSON data
              if (localStorage.getItem('legendAchieved') === 'true') migratedData.legendAchieved = true;
              if (localStorage.getItem('hasShownRatingModal') === 'true') {
                  migratedData.ratingState = { ...initialAppState.ratingState, hasRated: true };
              }
              
              await userDocRef.set(migratedData, { merge: true });

              // Clean up old localStorage keys
              localStorage.removeItem(`fortify_journal_${uid}`);
              localStorage.removeItem(`fortify_checkin_history_${uid}`);
              localStorage.removeItem('legendAchieved');
              localStorage.removeItem('hasShownRatingModal');
              
              // The listener will fire again with the merged data, so we can just return.
              return;
            }

            // Ensure new users get a trial start date.
            if (!data.trialStartDate) {
                await userDocRef.set({ trialStartDate: new Date().toISOString() }, { merge: true });
                return; // Listener will re-fire with the new data.
            }

            const userData = { ...initialAppState, ...data };
            setAppStateInternal(userData);

        } else {
            // New user: create their document. The listener will fire again once it's created.
            const newUserState = { ...initialAppState, v2_migration_complete: true, trialStartDate: new Date().toISOString() };
            await userDocRef.set(newUserState);
        }
        setLoading(false);
    }, (error) => {
        console.error("Firestore snapshot error:", error);
        setLoading(false);
    });

    // Cleanup listener on user change or component unmount
    return () => unsubscribeFirestore();
  }, [user]);

  const value = {
    user,
    loading,
    appState,
    setAppState,
    login,
    signup,
    logout,
    sendPasswordReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};