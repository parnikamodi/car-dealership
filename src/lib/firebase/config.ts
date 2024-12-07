import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Environment variable validation
const validateEnvVariables = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Missing environment variable: ${envVar}`);
    }
  }
};

// Only run validation in development
if (process.env.NODE_ENV === 'development') {
  validateEnvVariables();
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase with type safety
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } else {
      app = getApp();
      db = getFirestore(app);
    }

    auth = getAuth(app);
    storage = getStorage(app);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Firebase services initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Don't throw error, just log it
  }
} else {
  // Server-side initialization (minimal setup)
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    app = getApp();
    db = getFirestore(app);
  }
  auth = getAuth(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
export type { 
  FirebaseApp,
  Auth,
  Firestore,
  FirebaseStorage
};