import * as dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import express from 'express';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import path from 'path';
import { registerRoutes } from './routes';
import { passport } from './routes/oauth.js';

// __dirname is available in CJS build

const app = express();
const httpServer = createServer(app);

// Trust proxy for rate limiting behind nginx/load balancer
app.set('trust proxy', 1);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per 15 minutes (increased for development)
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  })
);

// Initialize Passport for OAuth
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://ec2-13-50-123-3.eu-north-1.compute.amazonaws.com',
  'http://ec2-13-50-123-3.eu-north-1.compute.amazonaws.com:5000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Register API routes
registerRoutes(app);

// Serve uploaded files
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve static files in production
const distPath = path.join(process.cwd(), 'dist/client');
console.log('📁 Serving static files from:', distPath);
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API available at http://localhost:${PORT}/api`);
});

export default app;
