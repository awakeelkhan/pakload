#!/bin/bash
# ============================================================================
# PakLoad - EC2 User Data Script for Application Deployment
# This script runs on first boot to set up the application
# ============================================================================

set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "==> Starting PakLoad deployment at $(date)"

# ============================================================================
# SYSTEM SETUP
# ============================================================================

echo "==> Updating system packages..."
dnf update -y

echo "==> Installing required packages..."
dnf install -y git nodejs npm nginx

# Install Node.js 20 LTS
echo "==> Installing Node.js 20..."
dnf module reset nodejs -y
dnf module enable nodejs:20 -y
dnf install -y nodejs

# Verify Node.js installation
node --version
npm --version

# ============================================================================
# APPLICATION SETUP
# ============================================================================

echo "==> Creating application directory..."
mkdir -p /opt/pakload
cd /opt/pakload

# Clone or copy application
echo "==> Cloning application from GitHub..."
if [ -n "${github_repo}" ] && [ "${github_repo}" != "https://github.com/yourusername/pakload.git" ]; then
  git clone ${github_repo} .
else
  # Create a minimal app structure if no repo provided
  echo "==> Creating application from embedded code..."
  mkdir -p server client
fi

# ============================================================================
# ENVIRONMENT CONFIGURATION
# ============================================================================

echo "==> Creating environment file..."
cat > /opt/pakload/server/.env <<EOF
# Database Configuration
DATABASE_URL=postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}

# Application Configuration
NODE_ENV=${node_env}
PORT=5000
JWT_SECRET=${jwt_secret}

# CORS
CORS_ORIGIN=*
EOF

chmod 600 /opt/pakload/server/.env

# ============================================================================
# INSTALL DEPENDENCIES & BUILD
# ============================================================================

echo "==> Installing npm dependencies..."
cd /opt/pakload

# Install root dependencies
if [ -f "package.json" ]; then
  npm install --production=false
fi

# Install server dependencies
if [ -f "server/package.json" ]; then
  cd server
  npm install
  cd ..
fi

# Build client if exists
if [ -f "client/package.json" ]; then
  cd client
  npm install
  npm run build
  cd ..
fi

# ============================================================================
# NGINX CONFIGURATION
# ============================================================================

echo "==> Configuring Nginx..."
cat > /etc/nginx/conf.d/pakload.conf <<'NGINX_CONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Frontend static files
    location / {
        root /opt/pakload/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:5000/api/stats;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
}
NGINX_CONF

# Remove default nginx config
rm -f /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# ============================================================================
# SYSTEMD SERVICE FOR NODE.JS APP
# ============================================================================

echo "==> Creating systemd service..."
cat > /etc/systemd/system/pakload.service <<'SERVICE'
[Unit]
Description=PakLoad Node.js Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pakload
ExecStart=/usr/bin/npm run server:start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=pakload
Environment=NODE_ENV=production
EnvironmentFile=/opt/pakload/server/.env

[Install]
WantedBy=multi-user.target
SERVICE

# Create npm start script if not exists
if [ ! -f "/opt/pakload/package.json" ]; then
  cat > /opt/pakload/package.json <<'PACKAGE'
{
  "name": "pakload",
  "version": "2.0.0",
  "scripts": {
    "server:start": "cd server && node index.js"
  }
}
PACKAGE
fi

# ============================================================================
# START SERVICES
# ============================================================================

echo "==> Starting services..."
systemctl daemon-reload
systemctl enable nginx
systemctl enable pakload
systemctl start nginx
systemctl start pakload

# Wait for app to start
sleep 10

# ============================================================================
# HEALTH CHECK
# ============================================================================

echo "==> Running health check..."
for i in {1..30}; do
  if curl -s http://localhost:5000/api/stats > /dev/null; then
    echo "==> Application is healthy!"
    break
  fi
  echo "Waiting for application to start... ($i/30)"
  sleep 5
done

# ============================================================================
# CLOUDWATCH AGENT (Optional)
# ============================================================================

echo "==> Installing CloudWatch agent..."
dnf install -y amazon-cloudwatch-agent

cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'CW_CONFIG'
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/user-data.log",
            "log_group_name": "/pakload/user-data",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/pakload/nginx-access",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/pakload/nginx-error",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "PakLoad",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_user", "cpu_usage_system"],
        "metrics_collection_interval": 60
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["/"]
      }
    }
  }
}
CW_CONFIG

systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent

# ============================================================================
# COMPLETION
# ============================================================================

echo "==> PakLoad deployment completed at $(date)"
echo "==> Application URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):80"
echo "==> API URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):80/api"
