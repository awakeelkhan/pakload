import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserRepository } from '../repositories/userRepository.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();
const userRepo = new UserRepository();

// Initialize Google OAuth Strategy (called after env vars are loaded)
let googleStrategyInitialized = false;

function initializeGoogleStrategy() {
  if (googleStrategyInitialized) return;
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback';

  if (clientId && clientSecret) {
    passport.use(new GoogleStrategy({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackUrl,
      scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user exists
        let user = await userRepo.findByEmail(email);
        let isNewUser = false;

        if (!user) {
          // Create new user from Google profile
          isNewUser = true;
          const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
          user = await userRepo.create({
            email,
            password: randomPassword,
            firstName: profile.name?.givenName || 'User',
            lastName: profile.name?.familyName || '',
            phone: '',
            companyName: '',
            role: 'shipper', // Default role, user will select on first login
            status: 'active',
            verified: true, // Google verified email
          });
        }

        // Attach isNewUser flag to user object
        return done(null, { ...user, isNewUser });
      } catch (error) {
        return done(error as Error, undefined);
      }
    }));
    googleStrategyInitialized = true;
    console.log('✅ Google OAuth strategy initialized');
  }
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await userRepo.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Debug: log env vars
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  
  // Initialize strategy on first request (after env vars are loaded)
  initializeGoogleStrategy();
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('📥 Google OAuth callback received');
  initializeGoogleStrategy();
  passport.authenticate('google', (err: any, user: any, info: any) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    console.log('🔐 OAuth authenticate result:', { err: err?.message, user: !!user, info });
    
    if (err) {
      console.error('❌ OAuth authentication error:', err.message);
      console.error('Full error:', err);
      // Check if it's a database error
      if (err.message?.includes('Connection terminated') || err.message?.includes('timeout')) {
        return res.redirect(`${frontendUrl}/signin?error=database_unavailable`);
      }
      return res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
    }
    
    if (!user) {
      console.error('❌ OAuth: No user returned', info);
      return res.redirect(`${frontendUrl}/signin?error=no_user`);
    }

    try {
      // Generate JWT tokens
      const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

      // Redirect to frontend with tokens
      // If new user, redirect to role selection page
      const redirectPath = user.isNewUser ? '/select-role' : '/oauth/callback';
      res.redirect(`${frontendUrl}${redirectPath}?access_token=${accessToken}&refresh_token=${refreshToken}`);
    } catch (error) {
      console.error('OAuth token generation error:', error);
      res.redirect(`${frontendUrl}/signin?error=oauth_error`);
    }
  })(req, res, next);
});

// Simple token-based social login for development/testing
// This allows frontend to send social provider token directly
router.post('/social', async (req, res) => {
  try {
    const { provider, token, email, firstName, lastName, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    let user = await userRepo.findByEmail(email);

    if (!user) {
      // Create new user
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await userRepo.create({
        email,
        password: randomPassword,
        firstName: firstName || 'User',
        lastName: lastName || '',
        phone: '',
        companyName: '',
        role: 'shipper',
        status: 'active',
        verified: true,
      });
    }

    // Generate JWT tokens
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 604800,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Social login failed' });
  }
});

export default router;
export { passport };
