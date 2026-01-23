# 🔍 Check PostgreSQL Installation Status

The EC2 instance is running, but PostgreSQL might still be installing. The user data script takes 3-5 minutes to complete.

---

## 📊 Check Installation Status via SSH

```bash
# SSH into the instance
ssh -i ~/.ssh/pakload.pem ec2-user@13.63.16.242

# Check if PostgreSQL installation is complete
tail -f /var/log/cloud-init-output.log

# Look for this line at the end:
# "PostgreSQL installation completed at [timestamp]"

# Check PostgreSQL service status
sudo systemctl status postgresql

# Check if pakload database exists
sudo -u postgres psql -l

# Check if pakload user exists
sudo -u postgres psql -c "\du"
```

---

## ⏱️ Wait for Installation

The user data script is still running. You can either:

1. **Wait 2-3 more minutes** and try `npm run db:test` again
2. **SSH in and monitor** the installation progress
3. **Check cloud-init logs** to see what's happening

---

## 🔧 Manual Database Setup (If Needed)

If the automated setup failed, you can set it up manually via SSH:

```bash
# SSH into instance
ssh -i ~/.ssh/pakload.pem ec2-user@13.63.16.242

# Switch to postgres user
sudo su - postgres

# Create database and user
psql <<EOF
CREATE DATABASE pakload;
CREATE USER pakload WITH PASSWORD 'PakLoad2024!SecureDB#';
GRANT ALL PRIVILEGES ON DATABASE pakload TO pakload;
\c pakload
GRANT ALL ON SCHEMA public TO pakload;
ALTER DATABASE pakload OWNER TO pakload;
EOF

# Exit postgres user
exit

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 🧪 Test Connection After Setup

```bash
# From your local machine
npm run db:test

# Should show:
# ✅ Connected successfully!
# ✅ Database connection test PASSED!
```

---

**The installation is likely still in progress. Wait 2-3 more minutes and try again.**
