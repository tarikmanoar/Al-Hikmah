
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getFirebaseConfig = () => {
  const stored = localStorage.getItem('firebase_custom_config');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.apiKey) return parsed;
    } catch (e) {
      console.error("Invalid stored firebase config", e);
    }
  }

  return {
    apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "your-app",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "00000000000",
    appId: process.env.FIREBASE_APP_ID || "1:00000000000:web:00000000000000",
  };
};

const app = initializeApp(getFirebaseConfig());
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
