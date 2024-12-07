import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

// Check if Firebase is already initialized
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    // Initialize Firestore with settings to prevent connection issues
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new Error("Failed to initialize Firebase");
  }
} else {
  app = getApp();
  db = getFirestore(app);
}

// Initialize other Firebase services
const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

// Log initialization status (remove in production)
console.log("Firebase initialized successfully");
console.log("Storage bucket:", firebaseConfig.storageBucket);

export { app, auth, db, storage };