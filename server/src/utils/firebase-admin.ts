import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Initialize with the same project ID as your client-side Firebase config
    admin.initializeApp({
      projectId: 'testapp-de470',
      // You can add credential: admin.credential.applicationDefault() in production
      // For now, minimal config should work for token verification
    });
    console.log('Firebase Admin SDK initialized successfully for project: testapp-de470');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

export const auth = admin.auth();

// Verify Firebase ID token using the Firebase Admin SDK
export const verifyIdToken = async (idToken: string) => {
  console.log('🔍 FIREBASE ADMIN SDK VERIFICATION - Token length:', idToken.length);
  
  try {
    // First, try to use Firebase Admin SDK directly (preferred method)
    console.log('Attempting to verify token with Firebase Admin SDK...');
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log('✅ Firebase Admin SDK verification successful');
      return decodedToken;
    } catch (firebaseError) {
  
      console.log('Attempting alternative verification method...');
    }

    // Fallback to Google's tokeninfo endpoint if Firebase Admin failed
    console.log('Using fallback: Google tokeninfo endpoint');
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
    });
    
    console.log('✅ Tokeninfo response status:', response.status);
    const payload = response.data;
    
    // Log what we received
    console.log('Payload received:', {
      keys: Object.keys(payload),
      email: payload.email,
      name: payload.name || '',
      sub: payload.sub
    });
    
    if (!payload.sub) {
      throw new Error('Invalid token: No user ID in payload');
    }
    
    // Return simplified format matching Firebase Admin SDK format
    return {
      uid: payload.sub,
      email: payload.email || '',
      email_verified: payload.email_verified === 'true',
      name: payload.name || payload.email?.split('@')[0] || '',
      picture: payload.picture || '',
      firebase: {
        sign_in_provider: 'google.com'
      }
    };
    
  } catch (error: any) {
    console.error('❌ Token verification failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    } else if (error.code) {
      console.error('Error code:', error.code);
    }
    
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
