#!/bin/bash
# PostgreSQL Database Setup Script
# Run this on the EC2 instance

echo "Setting up PostgreSQL database..."

sudo su - postgres <<'PSQL_SETUP'
psql <<EOF
CREATE DATABASE pakload;
CREATE USER pakload WITH PASSWORD 'PakLoad2024!SecureDB#';
GRANT ALL PRIVILEGES ON DATABASE pakload TO pakload;
\c pakload
GRANT ALL ON SCHEMA public TO pakload;
ALTER DATABASE pakload OWNER TO pakload;
\q
EOF
PSQL_SETUP

echo "Database setup complete!"
echo "Testing connection..."

psql -h localhost -U pakload -d pakload -c "SELECT version();"

echo "Done!"
