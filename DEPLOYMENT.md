# 🚀 PakLoad Deployment Guide

## World-Class Logistics Platform - Production Deployment

This guide covers deploying the PakLoad platform to production with full tri-lingual support (English, Urdu, Chinese).

---

## 📋 Pre-Deployment Checklist

### 1. **Environment Setup**

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/pakload

# Session
SESSION_SECRET=your-super-secret-key-min-32-chars

# Server
PORT=5000
NODE_ENV=production

# Optional: External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateway (Future)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Maps API (Future)
GOOGLE_MAPS_API_KEY=your-api-key
```

### 2. **Database Setup**

#### PostgreSQL Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE pakload;
CREATE USER pakload_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE pakload TO pakload_user;
\q
```

#### Run Migrations

```bash
npm run db:push
```

This will create all necessary tables:
- users
- loads
- trucks
- carriers
- quotes
- bookings
- tracking_milestones

---

## 🏗️ Build for Production

### 1. **Install Dependencies**

```bash
npm install --production
```

### 2. **Build Client**

```bash
npm run build:client
```

This creates optimized production build in `dist/client/`

### 3. **Build Server**

```bash
npm run build:server
```

This creates server bundle in `dist/server.js`

---

## 🌐 Deployment Options

### Option 1: VPS Deployment (DigitalOcean, AWS EC2, etc.)

#### 1. **Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

#### 2. **Upload Code**

```bash
# On your local machine
rsync -avz --exclude node_modules --exclude .git . user@your-server:/var/www/pakload/

# On server
cd /var/www/pakload
npm install
npm run build
```

#### 3. **Configure PM2**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pakload',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. **Configure Nginx**

Create `/etc/nginx/sites-available/pakload`:

```nginx
server {
    listen 80;
    server_name loadpak.com www.loadpak.com;

    # Client files
    location / {
        root /var/www/pakload/dist/client;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/pakload /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. **SSL Certificate (Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d loadpak.com -d www.loadpak.com
```

---

### Option 2: Docker Deployment

#### 1. **Create Dockerfile**

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production

EXPOSE 5000
CMD ["node", "dist/server.js"]
```

#### 2. **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: pakload
      POSTGRES_USER: pakload_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://pakload_user:${DB_PASSWORD}@postgres:5432/pakload
      SESSION_SECRET: ${SESSION_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./dist/client:/usr/share/nginx/html
    depends_on:
      - app

volumes:
  postgres_data:
```

#### 3. **Deploy**

```bash
docker-compose up -d
```

---

### Option 3: Cloud Platform Deployment

#### **Vercel (Frontend Only)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **Railway (Full Stack)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### **Render (Full Stack)**

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

---

## 🔒 Security Best Practices

### 1. **Environment Variables**

- Never commit `.env` files
- Use strong SESSION_SECRET (min 32 characters)
- Rotate secrets regularly

### 2. **Database Security**

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure-password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Enable SSL connections
ALTER SYSTEM SET ssl = on;
```

### 3. **Rate Limiting**

Install and configure:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. **CORS Configuration**

```javascript
app.use(cors({
  origin: ['https://loadpak.com', 'https://www.loadpak.com'],
  credentials: true
}));
```

---

## 📊 Monitoring & Analytics

### 1. **Application Monitoring**

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs pakload

# Check status
pm2 status
```

### 2. **Database Monitoring**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. **Error Tracking**

Install Sentry:

```bash
npm install @sentry/node
```

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

---

## 🚀 Performance Optimization

### 1. **Enable Gzip Compression**

```javascript
import compression from 'compression';
app.use(compression());
```

### 2. **Cache Static Assets**

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. **Database Indexing**

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_origin ON loads(origin);
CREATE INDEX idx_loads_destination ON loads(destination);
CREATE INDEX idx_trucks_status ON trucks(status);
CREATE INDEX idx_bookings_tracking ON bookings(tracking_number);
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/pakload
            git pull
            npm install
            npm run build
            pm2 restart pakload
```

---

## 📱 Mobile App Deployment (Future)

### React Native Setup

```bash
# Initialize React Native project
npx react-native init PakLoadMobile

# Share code with web
# Use shared/ directory for business logic
# Reuse API hooks and i18n translations
```

---

## 🌍 Multi-Region Deployment

### CDN Configuration

Use Cloudflare or AWS CloudFront for:
- Static asset delivery
- DDoS protection
- SSL/TLS termination
- Geographic load balancing

### Database Replication

```sql
-- Set up read replicas for different regions
-- China region: Aliyun RDS
-- Pakistan region: Local PostgreSQL
-- Use connection pooling: PgBouncer
```

---

## 📞 Support & Maintenance

### Backup Strategy

```bash
# Daily database backups
0 2 * * * pg_dump pakload > /backups/pakload_$(date +\%Y\%m\%d).sql

# Weekly full backups
0 3 * * 0 tar -czf /backups/full_$(date +\%Y\%m\%d).tar.gz /var/www/pakload
```

### Update Strategy

```bash
# Zero-downtime deployment
pm2 reload pakload

# Rollback if needed
git checkout previous-version
npm run build
pm2 restart pakload
```

---

## ✅ Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Monitoring tools active
- [ ] Backup system running
- [ ] Error tracking configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## 🎯 Scaling Recommendations

### When to Scale

- **Horizontal Scaling**: Add more server instances when CPU > 70%
- **Database Scaling**: Add read replicas when queries > 1000/sec
- **CDN**: Enable when traffic > 10,000 users/day

### Cost Optimization

- Use reserved instances for predictable workloads
- Implement auto-scaling for variable traffic
- Cache frequently accessed data with Redis
- Optimize database queries and add indexes

---

**For support, contact: tech@loadpak.com**
