import { initializeApp } from 'firebase/app'
import { auth } from 'firebase/auth'
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
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)(firebaseConfig)
const storage = getStorage(app)

// Initialize Firebase listeners and servicesconst storage = getStorage(app)
// This will be imported and executed when this file is first loaded
if (typeof window !== 'undefined') {
  import('./userInitialization').then(({ setupAuthListener }) => {d when this file is first loaded
    const unsubscribeAuth = setupAuthListener();
    thListener }) => {
    // Clean up listener when the app is unmounted (for hot reloading during development)const unsubscribeAuth = setupAuthListener();
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - Special Next.js hot module replacement APId (for hot reloading during development)
      if (module?.hot) {
        module.hot.dispose(() => {ecial Next.js hot module replacement API
          unsubscribeAuth();
        });) => {
      }nsubscribeAuth();
    } });
  }).catch(err => { }
    console.error('Failed to initialize Firebase auth listeners:', err);
  });
}onsole.error('Failed to initialize Firebase auth listeners:', err);
 });
export { auth, db, storage }export { auth, db, storage }