import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Firebase listeners and services
// This will be imported and executed when this file is first loaded
if (typeof window !== 'undefined') {
  import('./userInitialization').then(({ setupAuthListener }) => {
    const unsubscribeAuth = setupAuthListener();
    
    // Clean up listener when the app is unmounted (for hot reloading during development)
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - Special Next.js hot module replacement API
      if (module?.hot) {
        module.hot.dispose(() => {
          unsubscribeAuth();
        });
      }
    }
  }).catch(err => {
    console.error('Failed to initialize Firebase auth listeners:', err);
  });
}

export { auth, db, storage }