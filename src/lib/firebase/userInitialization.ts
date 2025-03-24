import { auth, db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

/**
 * Initialize a new user's data in Firestore
 */
export async function initializeNewUser(user: User): Promise<void> {
  try {
    // Check if user document already exists to prevent overwriting existing data
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // User document doesn't exist, create initial data
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        createdAt: new Date().toISOString(),
        preferences: {
          notifications: true,
          marketingEmails: false
        },
        role: 'user', // Default role
        isActive: true,
        lastLogin: new Date().toISOString()
      };
      
      // Create user document in Firestore
      await setDoc(userDocRef, userData);
      console.log(`Initialized new user: ${user.uid}`);
    } else {
      // User exists, just update the last login time
      await setDoc(userDocRef, { lastLogin: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
}

/**
 * Setup listener for auth state changes to handle user initialization
 */
export function setupAuthListener(): () => void {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        await initializeNewUser(user);
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    }
  });
  
  return unsubscribe;
}