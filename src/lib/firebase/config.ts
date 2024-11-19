import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD_MIpljMYX0Xeyf6_zDXIB7xPoqGNUvsg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "car-dealership-6be75.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "car-dealership-6be75",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "car-dealership-6be75.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "732978297608",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:732978297608:web:dc465de26b0d28c41ecabd",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-N5DR5SCXJG"
};

// Initialize Firebase
let app;
let db;

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
  }
} else {
  app = getApp();
  db = getFirestore(app);
}

// Initialize other Firebase services
const auth = getAuth(app);
const storage = getStorage(app);

// Log initialization status (remove in production)
console.log("Firebase initialized successfully");
console.log("Storage bucket:", firebaseConfig.storageBucket);

export { app, auth, db, storage };