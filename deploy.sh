#!/bin/bash
# ============================================================================
# PakLoad - Manual Deployment Script
# Run this on the EC2 instance after uploading the code
# ============================================================================

set -e

echo "==> Starting PakLoad deployment..."

cd /opt/pakload

# Install dependencies
echo "==> Installing server dependencies..."
cd server
npm install
cd ..

# Build client
echo "==> Building client..."
cd client
npm install
npm run build
cd ..

# Create systemd service
echo "==> Creating systemd service..."
sudo tee /etc/systemd/system/pakload.service > /dev/null <<'SERVICE'
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

# Start the service
echo "==> Starting PakLoad service..."
sudo systemctl daemon-reload
sudo systemctl enable pakload
sudo systemctl restart pakload

# Check status
sleep 3
sudo systemctl status pakload --no-pager

echo "==> Deployment complete!"
echo "==> App should be available at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
