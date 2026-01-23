#!/bin/bash
# ============================================================================
# PakLoad - EC2 User Data Script (Simple Deployment)
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
dnf install -y git nginx

# Install Node.js 20 LTS
echo "==> Installing Node.js 20..."
dnf module reset nodejs -y || true
dnf module enable nodejs:20 -y || true
dnf install -y nodejs npm

# Verify installation
node --version
npm --version

# ============================================================================
# APPLICATION SETUP
# ============================================================================

echo "==> Creating application directory..."
mkdir -p /opt/pakload
cd /opt/pakload

# Create environment file
echo "==> Creating environment file..."
cat > /opt/pakload/.env <<EOF
DATABASE_URL=postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
NODE_ENV=${node_env}
PORT=5000
JWT_SECRET=${jwt_secret}
CORS_ORIGIN=*
EOF

chmod 600 /opt/pakload/.env

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

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:5000/api/stats;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
NGINX_CONF

rm -f /etc/nginx/conf.d/default.conf
nginx -t

# ============================================================================
# SYSTEMD SERVICE
# ============================================================================

echo "==> Creating systemd service..."
cat > /etc/systemd/system/pakload.service <<'SERVICE'
[Unit]
Description=PakLoad Node.js Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pakload/server
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pakload
Environment=NODE_ENV=production
EnvironmentFile=/opt/pakload/.env

[Install]
WantedBy=multi-user.target
SERVICE

# ============================================================================
# START SERVICES
# ============================================================================

echo "==> Starting Nginx..."
systemctl daemon-reload
systemctl enable nginx
systemctl start nginx

echo "==> Deployment script complete at $(date)"
echo "==> Note: Application code needs to be deployed separately"
echo "==> Upload your code to /opt/pakload and run: systemctl start pakload"
