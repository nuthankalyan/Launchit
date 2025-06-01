import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from './config';
import { auth } from './firebase-admin';
import { verifyIdToken } from './firebase-admin';

export const generateToken = (userId: string): string => {
  const payload = { userId };
  const secret = config.jwt.secret as string;
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as StringValue };
  
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const payload = { userId };
  const secret = config.jwt.refreshSecret as string;
  const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as StringValue };
  
  return jwt.sign(payload, secret, options);
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.refreshSecret as string) as { userId: string };
};
// ...existing code...

export const verifyGoogleToken = async (idToken: string): Promise<{
  email: string;
  name: string;
  picture?: string;
  sub: string;
} | null> => {
  try {
    console.log('Verifying Google token. Token length:', idToken ? idToken.length : 'undefined');
    console.log('Token starts with:', idToken ? idToken.substring(0, 50) + '...' : 'undefined');
    
    if (!idToken || idToken.length < 100) {
      console.error('Invalid token format - token is too short or missing');
      return null;
    }
    
    // Use the verification function
    const decodedToken = await verifyIdToken(idToken);
    console.log('Token verified successfully. User ID:', decodedToken.uid);
    console.log('Token email:', decodedToken.email);
    
    return {
      email: decodedToken.email || '',
      name: decodedToken.name || '',
      picture: decodedToken.picture,
      sub: decodedToken.uid
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
};