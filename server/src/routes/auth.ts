import { Router } from 'express';
import { signup, login, getProfile, refreshToken, logout, googleAuth } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';
import { validateSignup, validateLogin } from '../middleware/validation';

const authRouter = Router();

// Public routes
authRouter.post('/signup', validateSignup, signup);
authRouter.post('/login', validateLogin, login);
authRouter.post('/google', googleAuth);
authRouter.post('/refresh-token', refreshToken);

// Protected routes
authRouter.get('/profile', auth, getProfile);
authRouter.post('/logout', auth, logout);

export { authRouter };
