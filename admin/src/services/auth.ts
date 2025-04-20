import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  initializeAuth,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { app } from './firebase';

// Initialize auth with persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});

export const signIn = async (email: string, password: string) => {
  try {
    // Set persistence to LOCAL (user stays signed in)
    await setPersistence(auth, browserLocalPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    
    // Handle specific error cases
    switch (error.code) {
      case 'auth/operation-not-allowed':
        throw new Error('Email/password sign-in is not enabled. Please contact the administrator.');
      case 'auth/invalid-credential':
        throw new Error('Invalid email or password.');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      default:
        throw new Error('An error occurred during sign in. Please try again.');
    }
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}; 