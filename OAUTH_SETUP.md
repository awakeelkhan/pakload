# 🔐 OAuth Setup Guide (Google & Facebook Login)

Google and Facebook login are **not yet implemented** but can be added easily.

---

## 📋 **Current Status**

✅ **Email/Password Login** - Fully functional
❌ **Google OAuth** - Not implemented
❌ **Facebook OAuth** - Not implemented

---

## 🚀 **How to Add Google OAuth**

### **1. Install Dependencies**
```bash
npm install passport passport-google-oauth20 express-session
npm install --save-dev @types/passport @types/passport-google-oauth20
```

### **2. Get Google OAuth Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret

### **3. Add to .env**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### **4. Create Passport Config**
```typescript
// server/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserRepository } from '../repositories/userRepository';

const userRepo = new UserRepository();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await userRepo.findByEmail(profile.emails![0].value);
      
      if (!user) {
        // Create new user
        user = await userRepo.create({
          email: profile.emails![0].value,
          firstName: profile.name!.givenName,
          lastName: profile.name!.familyName,
          password: '', // No password for OAuth users
          role: 'shipper',
          status: 'active',
          verified: true,
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));
```

### **5. Add Routes**
```typescript
// In server/routes.ts
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    // Generate JWT token
    const token = 'jwt-token-' + req.user.id + '-' + Date.now();
    res.redirect(`http://localhost:5174/?token=${token}`);
  }
);
```

---

## 🔵 **How to Add Facebook OAuth**

### **1. Install Dependencies**
```bash
npm install passport-facebook
npm install --save-dev @types/passport-facebook
```

### **2. Get Facebook App Credentials**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Set redirect URI: `http://localhost:5000/api/auth/facebook/callback`
5. Copy App ID and App Secret

### **3. Add to .env**
```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

### **4. Add Facebook Strategy**
```typescript
import { Strategy as FacebookStrategy } from 'passport-facebook';

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
    profileFields: ['id', 'emails', 'name']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await userRepo.findByEmail(profile.emails![0].value);
      
      if (!user) {
        user = await userRepo.create({
          email: profile.emails![0].value,
          firstName: profile.name!.givenName,
          lastName: profile.name!.familyName,
          password: '',
          role: 'shipper',
          status: 'active',
          verified: true,
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));
```

### **5. Add Routes**
```typescript
app.get('/api/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

app.get('/api/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/signin' }),
  (req, res) => {
    const token = 'jwt-token-' + req.user.id + '-' + Date.now();
    res.redirect(`http://localhost:5174/?token=${token}`);
  }
);
```

---

## 🎯 **Frontend Integration**

Update the SignIn page buttons:

```typescript
// For Google
<button onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}>
  Continue with Google
</button>

// For Facebook
<button onClick={() => window.location.href = 'http://localhost:5000/api/auth/facebook'}>
  Continue with Facebook
</button>
```

---

## ⚠️ **Important Notes**

1. **Production URLs**: Update callback URLs for production
2. **HTTPS Required**: OAuth providers require HTTPS in production
3. **Session Management**: Add express-session for passport
4. **JWT Tokens**: Replace mock tokens with real JWT
5. **Error Handling**: Add proper error handling for OAuth failures

---

## 📝 **Current Workaround**

For now, use **email/password login**:
- Email: `admin@pakload.com`
- Password: `admin123`

OAuth can be added later when needed.
