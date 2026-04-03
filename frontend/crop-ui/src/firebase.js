import { initializeApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required Firebase config
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingKeys.join(', ')}`);
}

// Initialize Firebase app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (typeof window === "undefined") return null;

  // Clear any existing recaptcha verifier
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
      size: "invisible",
      callback: (response) => {
        console.log("Recaptcha solved");
      },
      "expired-callback": () => {
        console.log("Recaptcha expired");
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      },
    }, auth);

    return window.recaptchaVerifier;
  } catch (error) {
    console.error("Error setting up recaptcha:", error);
    return null;
  }
};

export { auth, setupRecaptcha, signInWithPhoneNumber };
