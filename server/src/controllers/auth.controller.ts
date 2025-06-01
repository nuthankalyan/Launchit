import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateToken, generateRefreshToken, verifyGoogleToken } from '../utils/auth';
import { AuthRequest } from '../middleware/auth';

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    const existingUserByUsername = await User.findByUsername(username);

    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password || '');

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving profile'
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const { verifyRefreshToken } = await import('../utils/auth');
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // In a more advanced implementation, you would blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  console.log('🚀 Google Auth endpoint called');
  
  try {
    const { idToken, email, username, avatar } = req.body;
    
    console.log('Request body keys:', Object.keys(req.body));
    console.log('ID Token present:', !!idToken);
    console.log('ID Token length:', idToken?.length);
    console.log('Email:', email);
    console.log('Username:', username);

    if (!idToken) {
      console.log('❌ No ID token provided');
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    console.log('📝 Starting token verification...');
    const googleUser = await verifyGoogleToken(idToken);
    
    if (!googleUser) {
      console.log('❌ Token verification returned null');
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    console.log('✅ Token verified, user data:', {
      uid: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name
    });

    // Check if user exists using the correct method
    console.log('🔍 Checking if user exists in database...');
    let user = await User.findByEmail(googleUser.email);

    if (!user) {
      console.log('👤 Creating new user...');
      // Create new user with only the fields that exist in your User model
      user = await User.create({
        username: username || googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        avatar: avatar || googleUser.picture,
        googleId: googleUser.sub // Use googleId instead of providerId
        // Remove isVerified and provider as they don't exist in your model
      });
      console.log('✅ New user created with ID:', user.id);
    } else {
      console.log('✅ Existing user found with ID:', user.id);
    }

    // Generate tokens
    console.log('🔐 Generating JWT tokens...');
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    console.log('✅ Tokens generated successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        },
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('❌ Google auth error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};
