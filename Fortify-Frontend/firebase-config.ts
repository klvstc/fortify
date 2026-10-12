// This is a mock of the global firebase object provided by the Firebase SDK scripts.
// In a real environment, you would import firebase from 'firebase/app'.
declare const firebase: any;

const firebaseConfig = {
  // IMPORTANT: Replace this with your own Firebase project configuration.
  // You can find this in the Firebase Console: Project Settings > General > Your apps > Firebase SDK snippet > Config
  apiKey: "AIzaSyAYF0WqelG8aW-N75YuUFLe9zIMholc03U",
  authDomain: "fortify-final.firebaseapp.com",
  projectId: "fortify-final",
  storageBucket: "fortify-final.firebasestorage.app",
  messagingSenderId: "1060219683777",
  appId: "1:1060219683777:web:79c6ab42327917646c2540",
};

export const VAPID_PUBLIC_KEY = "BD8puWWYqgveysLwzLxcSGbAOKVOgXUPdYhgCpxP2eqzxCR4DtdvnXXfbgB77YscP-MnGYAqxkd7seW8CnqPCkM";

// Initialize Firebase
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); 
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export let messaging: any = null; // Use `any` type for messaging from CDN

if (firebase.messaging && firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
}

export const getFCMToken = async (): Promise<string | null> => {
    if (!messaging) {
        return null;
    }
    try {
        // getToken will automatically prompt for permission if it's 'default'.
        // A VAPID key is REQUIRED for web push notifications to function correctly.
        const token = await messaging.getToken({ vapidKey: VAPID_PUBLIC_KEY });
        if (token) {
          return token;
        }
        // This part is reached if permission is denied by the user
        return null;
    } catch (err) {
        return null;
    }
};


export default app;