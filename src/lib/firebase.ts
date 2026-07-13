/// <reference types="vite/client" />

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const isFirebaseConfigured = !!(import.meta.env.VITE_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that configuration parameters exist
const missingVars: string[] = [];
if (!import.meta.env.VITE_FIREBASE_API_KEY) missingVars.push('VITE_FIREBASE_API_KEY');
if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) missingVars.push('VITE_FIREBASE_PROJECT_ID');
if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) missingVars.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!import.meta.env.VITE_FIREBASE_APP_ID) missingVars.push('VITE_FIREBASE_APP_ID');

let app;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase client services initialized successfully.");
  } catch (err: any) {
    console.error("Firebase client initialization error:", err.message || err);
  }
} else {
  console.warn(
    `Firebase client credentials are not fully set up. Using mock/Express backend. Missing variables: ${missingVars.join(', ')}`
  );
}

export { auth, db, googleProvider, isFirebaseConfigured, missingVars };
