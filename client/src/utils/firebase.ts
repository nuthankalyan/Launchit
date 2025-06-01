// Firebase configuration and authentication utilities
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx6Dh8bqP0AnA3nO7XcpBFf5pS5xN5CIU",
  authDomain: "testapp-de470.firebaseapp.com",
  projectId: "testapp-de470",
  storageBucket: "testapp-de470.firebasestorage.app",
  messagingSenderId: "93207605897",
  appId: "1:93207605897:web:f25143b641e0daceb50c58",
  measurementId: "G-WVTWC8D5JQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign In function (using redirect)
export const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);

// Google Sign In function (using popup - more reliable for development)
export const signInWithGooglePopup = async () => {
  try {
    console.log('Starting Google popup sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful, getting ID token...');
    
    // Force refresh to get a fresh token
    const idToken = await result.user.getIdToken(true);
    console.log('Got ID token, length:', idToken.length);
    
    return {
      idToken: idToken,
      email: result.user.email,
      username: result.user.displayName,
      avatar: result.user.photoURL
    };
  } catch (error) {
    console.error('Google popup sign-in error:', error);
    throw error;
  }
};

export const getGoogleRedirectResult = async () => {
  try {
    console.log('Checking for Google redirect result...');
    const result = await getRedirectResult(auth);
    console.log('Got redirect result:', result ? 'success' : 'no result');
    
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log('Got credential:', credential ? 'success' : 'no credential');
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      console.log('Got ID token:', idToken ? '[PRESENT]' : '[MISSING]');
      
      const data = {
        idToken: idToken,
        email: result.user.email,
        username: result.user.displayName,
        avatar: result.user.photoURL
      };
      console.log('Returning auth data:', { 
        ...data, 
        idToken: data.idToken ? '[PRESENT]' : '[MISSING]',
        email: data.email,
        username: data.username 
      });
      return data;
    }
    return null;
  } catch (error) {
    console.error('Google redirect result error:', error);
    throw error;
  }
};

// Sign out function
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export { analytics };
