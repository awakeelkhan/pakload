#!/bin/bash
# User Data Script for PostgreSQL Installation on Amazon Linux 2023
# This script runs on first boot to set up PostgreSQL

set -e  # Exit on any error

# Update system packages
echo "==> Updating system packages..."
dnf update -y

# Install PostgreSQL 16
echo "==> Installing PostgreSQL 16..."
dnf install -y postgresql16 postgresql16-server postgresql16-contrib

# Initialize PostgreSQL database
echo "==> Initializing PostgreSQL database..."
postgresql-setup --initdb

# Configure PostgreSQL to listen on all interfaces
echo "==> Configuring PostgreSQL..."
cat > /var/lib/pgsql/data/postgresql.conf <<EOF
# PostgreSQL Configuration for PakLoad
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 512MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%a.log'
log_truncate_on_rotation = on
log_rotation_age = 1d
log_rotation_size = 0
log_line_prefix = '%m [%p] %u@%d '
log_timezone = 'UTC'

# Security
ssl = off
password_encryption = scram-sha-256

# Locale
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'en_US.UTF-8'
lc_monetary = 'en_US.UTF-8'
lc_numeric = 'en_US.UTF-8'
lc_time = 'en_US.UTF-8'
default_text_search_config = 'pg_catalog.english'
EOF

# Configure PostgreSQL authentication
echo "==> Configuring PostgreSQL authentication..."
cat > /var/lib/pgsql/data/pg_hba.conf <<EOF
# PostgreSQL Client Authentication Configuration
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             all                                     peer
local   all             postgres                                peer

# IPv4 connections from anywhere (secured by security group)
host    all             all             0.0.0.0/0               scram-sha-256

# IPv6 connections from anywhere (secured by security group)
host    all             all             ::0/0                   scram-sha-256

# Replication connections
local   replication     all                                     peer
host    replication     all             0.0.0.0/0               scram-sha-256
host    replication     all             ::0/0                   scram-sha-256
EOF

# Set proper permissions
chown -R postgres:postgres /var/lib/pgsql/data
chmod 700 /var/lib/pgsql/data
chmod 600 /var/lib/pgsql/data/postgresql.conf
chmod 600 /var/lib/pgsql/data/pg_hba.conf

# Start and enable PostgreSQL service
echo "==> Starting PostgreSQL service..."
systemctl enable postgresql
systemctl start postgresql

# Wait for PostgreSQL to start
sleep 5

# Set postgres user password and create pakload database
echo "==> Setting up database and user..."
sudo -u postgres psql <<EOSQL
-- Set postgres user password
ALTER USER postgres WITH PASSWORD '${db_password}';

-- Create pakload database
CREATE DATABASE pakload;

-- Create pakload user
CREATE USER pakload WITH PASSWORD '${db_password}';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pakload TO pakload;

-- Connect to pakload database and grant schema privileges
\c pakload
GRANT ALL ON SCHEMA public TO pakload;
ALTER DATABASE pakload OWNER TO pakload;

-- Show databases
\l
EOSQL

# Configure firewall (Amazon Linux 2023 uses firewalld)
echo "==> Configuring firewall..."
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --add-service=postgresql
firewall-cmd --reload

# Create backup directory
echo "==> Creating backup directory..."
mkdir -p /var/backups/postgresql
chown postgres:postgres /var/backups/postgresql

# Create daily backup script
cat > /usr/local/bin/backup-postgres.sh <<'BACKUP_SCRIPT'
#!/bin/bash
# Daily PostgreSQL backup script
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dumpall | gzip > "$BACKUP_DIR/pakload_backup_$DATE.sql.gz"
# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "pakload_backup_*.sql.gz" -mtime +7 -delete
BACKUP_SCRIPT

chmod +x /usr/local/bin/backup-postgres.sh

# Add cron job for daily backups at 2 AM
echo "0 2 * * * /usr/local/bin/backup-postgres.sh" | crontab -

# Install monitoring tools
echo "==> Installing monitoring tools..."
dnf install -y htop iotop sysstat

# Create status check script
cat > /usr/local/bin/postgres-status.sh <<'STATUS_SCRIPT'
#!/bin/bash
echo "=== PostgreSQL Status ==="
systemctl status postgresql --no-pager
echo ""
echo "=== PostgreSQL Connections ==="
sudo -u postgres psql -c "SELECT count(*) as active_connections FROM pg_stat_activity;"
echo ""
echo "=== Database Size ==="
sudo -u postgres psql -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database;"
STATUS_SCRIPT

chmod +x /usr/local/bin/postgres-status.sh

# Print completion message
echo "==> PostgreSQL installation complete!"
echo "==> Database: pakload"
echo "==> User: pakload"
echo "==> Port: 5432"
echo "==> Run '/usr/local/bin/postgres-status.sh' to check status"

# Log installation completion
echo "PostgreSQL installation completed at $(date)" >> /var/log/postgres-setup.log
