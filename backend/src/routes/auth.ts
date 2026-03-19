import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Sign Up
router.post('/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, captchaToken } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
    });

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Sign up error:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Sign In
router.post('/signin', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    let user = null;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (dbError) {
      console.warn('Database error, checking for mock credentials...');
    }

    // Mock Login Bypass for development
    if (!user && email.toLowerCase() === 'test@beartron.com' && password === 'password123') {
      const mockUser = {
        _id: 'mock-user-123',
        name: 'Test User',
        email: 'test@beartron.com'
      };
      
      const token = jwt.sign(
        { userId: mockUser._id, email: mockUser.email, name: mockUser.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Mock sign in successful',
        token,
        user: mockUser
      });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user signed up with Google (no password)
    if (user.authProvider === 'google' || !user.password) {
      return res.status(401).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Google OAuth Sign In/Sign Up
router.post('/google', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, googleId, image } = req.body;

    // Validation
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and Google ID are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (image) user.image = image;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        image,
        authProvider: 'google',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Google sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error: any) {
    console.error('Google sign in error:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already registered with different method' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
