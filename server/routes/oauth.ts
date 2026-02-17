import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { UserRepository } from '../repositories/userRepository.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();
const userRepo = new UserRepository();

// Initialize OAuth Strategies (called after env vars are loaded)
let googleStrategyInitialized = false;
let facebookStrategyInitialized = false;

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

function initializeFacebookStrategy() {
  if (facebookStrategyInitialized) return;
  
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const callbackUrl = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/facebook/callback';

  if (appId && appSecret) {
    passport.use(new FacebookStrategy({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: callbackUrl,
      profileFields: ['id', 'emails', 'name', 'displayName'],
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Facebook profile. Please ensure your Facebook account has a verified email.'), undefined);
        }

        // Check if user exists
        let user = await userRepo.findByEmail(email);
        let isNewUser = false;

        if (!user) {
          // Create new user from Facebook profile
          isNewUser = true;
          const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
          user = await userRepo.create({
            email,
            password: randomPassword,
            firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
            lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
            phone: '',
            companyName: '',
            role: 'shipper',
            status: 'active',
            verified: true,
          });
        }

        return done(null, { ...user, isNewUser });
      } catch (error) {
        return done(error as Error, undefined);
      }
    }));
    facebookStrategyInitialized = true;
    console.log('✅ Facebook OAuth strategy initialized');
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

// Facebook OAuth routes
router.get('/facebook', (req, res, next) => {
  console.log('FACEBOOK_APP_ID exists:', !!process.env.FACEBOOK_APP_ID);
  console.log('FACEBOOK_APP_SECRET exists:', !!process.env.FACEBOOK_APP_SECRET);
  
  initializeFacebookStrategy();
  
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(503).json({ 
      error: 'Facebook OAuth not configured',
      message: 'Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables'
    });
  }
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })(req, res, next);
});

router.get('/facebook/callback', (req, res, next) => {
  console.log('📥 Facebook OAuth callback received');
  initializeFacebookStrategy();
  passport.authenticate('facebook', (err: any, user: any, info: any) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    console.log('🔐 Facebook OAuth result:', { err: err?.message, user: !!user, info });
    
    if (err) {
      console.error('❌ Facebook OAuth error:', err.message);
      if (err.message?.includes('No email found')) {
        return res.redirect(`${frontendUrl}/signin?error=facebook_no_email`);
      }
      return res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
    }
    
    if (!user) {
      console.error('❌ Facebook OAuth: No user returned', info);
      return res.redirect(`${frontendUrl}/signin?error=no_user`);
    }

    try {
      const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id, email: user.email });
      const redirectPath = user.isNewUser ? '/select-role' : '/oauth/callback';
      res.redirect(`${frontendUrl}${redirectPath}?access_token=${accessToken}&refresh_token=${refreshToken}`);
    } catch (error) {
      console.error('Facebook OAuth token generation error:', error);
      res.redirect(`${frontendUrl}/signin?error=oauth_error`);
    }
  })(req, res, next);
});

// Facebook token verification for mobile apps
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Verify Facebook token and get user info
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name,name&access_token=${accessToken}`
    );

    if (!fbResponse.ok) {
      return res.status(401).json({ error: 'Invalid Facebook token' });
    }

    const fbUser = await fbResponse.json();
    const email = fbUser.email;

    if (!email) {
      return res.status(400).json({ error: 'No email found in Facebook profile' });
    }

    let user = await userRepo.findByEmail(email);

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await userRepo.create({
        email,
        password: randomPassword,
        firstName: fbUser.first_name || 'User',
        lastName: fbUser.last_name || '',
        phone: '',
        companyName: '',
        role: 'carrier',
        status: 'active',
        verified: true,
      });
    }

    const jwtAccessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const jwtRefreshToken = generateRefreshToken({ id: user.id, email: user.email });

    res.json({
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Facebook mobile login error:', error);
    res.status(500).json({ error: 'Facebook login failed' });
  }
});

// Google token verification for mobile apps
// Mobile app sends Google access token, we verify and create/login user
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Verify Google token and get user info
    const googleResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    if (!googleResponse.ok) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const googleUser = await googleResponse.json();
    const email = googleUser.email;

    if (!email) {
      return res.status(400).json({ error: 'No email found in Google profile' });
    }

    // Check if user exists
    let user = await userRepo.findByEmail(email);

    if (!user) {
      // Create new user from Google profile
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await userRepo.create({
        email,
        password: randomPassword,
        firstName: googleUser.given_name || 'User',
        lastName: googleUser.family_name || '',
        phone: '',
        companyName: '',
        role: 'carrier', // Default role for mobile app
        status: 'active',
        verified: true,
      });
    }

    // Generate JWT tokens
    const jwtAccessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const jwtRefreshToken = generateRefreshToken({ id: user.id, email: user.email });

    res.json({
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Google mobile login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
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
