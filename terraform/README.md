# 🚀 Terraform PostgreSQL EC2 Deployment

Deploy a secure, free-tier eligible PostgreSQL database on AWS EC2 for PakLoad.

---

## 📋 Prerequisites

1. **AWS Account** with free tier eligibility
2. **AWS CLI** configured with credentials
3. **Terraform** installed (v1.0+)
4. **EC2 Key Pair** created in AWS Console

---

## 🔧 Setup Steps

### **1. Install Terraform**

**Windows (PowerShell):**
```powershell
# Using Chocolatey
choco install terraform

# Or download from: https://www.terraform.io/downloads
```

**Verify installation:**
```bash
terraform version
```

### **2. Configure AWS Credentials**

```powershell
# Install AWS CLI if not installed
# Download from: https://aws.amazon.com/cli/

# Configure credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: eu-north-1
# Default output format: json
```

### **3. Create EC2 Key Pair**

1. Go to AWS Console: https://console.aws.amazon.com/ec2/
2. Region: **eu-north-1** (Stockholm)
3. Left sidebar: **Key Pairs**
4. Click **"Create key pair"**
5. Name: `pakload-key`
6. Type: RSA
7. Format: `.pem` (for SSH)
8. Click **"Create key pair"**
9. Save the `.pem` file to `~/.ssh/pakload-key.pem`
10. Set permissions:
   ```powershell
   # Windows (in Git Bash or WSL)
   chmod 400 ~/.ssh/pakload-key.pem
   ```

### **4. Get Your Public IP**

```powershell
# PowerShell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Or visit: https://whatismyipaddress.com/
```

### **5. Configure Terraform Variables**

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
my_ip = "YOUR_IP/32"  # Example: "203.0.113.45/32"
db_password = "YourStrongPassword123!"
key_name = "pakload-key"
```

---

## 🚀 Deployment

### **Initialize Terraform**

```bash
cd terraform
terraform init
```

### **Review Deployment Plan**

```bash
terraform plan
```

This shows what will be created:
- ✅ Security Group (SSH + PostgreSQL access)
- ✅ EC2 Instance (t3.micro, free tier)
- ✅ Elastic IP (stable public IP)
- ✅ PostgreSQL 16 installation
- ✅ Automated backups

### **Deploy Infrastructure**

```bash
terraform apply
```

- Review the plan
- Type `yes` to confirm
- Wait 3-5 minutes for deployment

### **Save Outputs**

```bash
# View connection details
terraform output

# Save to file
terraform output -json > outputs.json
```

---

## 🔐 Security Features

### **Implemented Security:**
- ✅ Security group restricts access to your IP only
- ✅ IMDSv2 required (prevents SSRF attacks)
- ✅ Encrypted EBS volume
- ✅ Strong password authentication (scram-sha-256)
- ✅ Firewall configured (firewalld)
- ✅ No root login
- ✅ Automatic security updates

### **Best Practices:**
- ✅ Minimal attack surface
- ✅ Principle of least privilege
- ✅ Encrypted data at rest
- ✅ Secure password storage
- ✅ Audit logging enabled

---

## 📊 Post-Deployment

### **1. Verify PostgreSQL Installation**

```bash
# SSH into instance
ssh -i ~/.ssh/pakload-key.pem ec2-user@<PUBLIC_IP>

# Check PostgreSQL status
/usr/local/bin/postgres-status.sh

# Test database connection
psql -h localhost -U pakload -d pakload
```

### **2. Update Application Configuration**

Edit `server/.env`:
```env
DB_HOST=<PUBLIC_IP_FROM_TERRAFORM_OUTPUT>
DB_PORT=5432
DB_USER=pakload
DB_PASSWORD=<YOUR_PASSWORD>
DB_NAME=pakload
USE_IAM_AUTH=false
```

### **3. Deploy Database Schema**

```bash
# Test connection
npm run db:test

# Deploy schema
npm run db:push

# Seed initial data
npm run db:seed

# Start application
npm run dev
```

---

## 💾 Backup & Maintenance

### **Automatic Backups:**
- Daily backups at 2 AM UTC
- Stored in `/var/backups/postgresql`
- Last 7 days retained
- Compressed with gzip

### **Manual Backup:**
```bash
ssh -i ~/.ssh/pakload-key.pem ec2-user@<PUBLIC_IP>
sudo -u postgres pg_dump pakload | gzip > pakload_backup.sql.gz
```

### **Restore from Backup:**
```bash
gunzip < pakload_backup.sql.gz | psql -U pakload -d pakload
```

---

## 📈 Monitoring

### **Check Instance Status:**
```bash
# SSH into instance
ssh -i ~/.ssh/pakload-key.pem ec2-user@<PUBLIC_IP>

# PostgreSQL status
/usr/local/bin/postgres-status.sh

# System resources
htop

# Disk usage
df -h

# PostgreSQL logs
sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log
```

### **AWS CloudWatch:**
- Basic monitoring included (free tier)
- CPU, Network, Disk metrics
- View in AWS Console → EC2 → Monitoring

---

## 💰 Cost Estimation

### **Free Tier (First 12 Months):**
- ✅ t3.micro instance: 750 hours/month FREE
- ✅ 20 GB EBS storage: FREE (up to 30 GB)
- ✅ Elastic IP: FREE (when attached)
- ✅ Data transfer: 15 GB/month FREE

### **After Free Tier:**
- t3.micro: ~$7.50/month
- 20 GB EBS: ~$2/month
- **Total: ~$10/month**

---

## 🔄 Updating Infrastructure

### **Modify Configuration:**
```bash
# Edit variables
nano terraform.tfvars

# Apply changes
terraform apply
```

### **Upgrade PostgreSQL:**
```bash
# SSH into instance
ssh -i ~/.ssh/pakload-key.pem ec2-user@<PUBLIC_IP>

# Update packages
sudo dnf update -y postgresql16*
sudo systemctl restart postgresql
```

---

## 🗑️ Cleanup

### **Destroy Infrastructure:**
```bash
terraform destroy
```
ALTER USER pakload WITH PASSWORD 'Khan123@#';

- Type `yes` to confirm
- All resources will be deleted
- **Warning:** This deletes the database and all data!

### **Before Destroying:**
```bash
# Backup database
ssh -i ~/.ssh/pakload-key.pem ec2-user@<PUBLIC_IP>
sudo -u postgres pg_dumpall | gzip > pakload_final_backup.sql.gz

# Download backup
scp -i ~/.ssh/pakload-key.pem ec2-user@<PUBLIC_IP>:pakload_final_backup.sql.gz .
```

---

## 🆘 Troubleshooting

### **Cannot Connect to PostgreSQL:**
```bash
# Check security group allows your IP
# Check PostgreSQL is running
ssh -i ~/.ssh/pakload-key.pem ec2-user@<PUBLIC_IP>
sudo systemctl status postgresql

# Check firewall
sudo firewall-cmd --list-all
```

### **SSH Connection Refused:**
```bash
# Verify key permissions
chmod 400 ~/.ssh/pakload-key.pem

# Verify security group allows your IP on port 22
# Check instance is running in AWS Console
```

### **Terraform Errors:**
```bash
# Re-initialize
terraform init -upgrade

# Validate configuration
terraform validate

# Check AWS credentials
aws sts get-caller-identity
```

---

## 📚 Resources

- **Terraform AWS Provider:** https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/16/
- **AWS EC2 Free Tier:** https://aws.amazon.com/free/
- **AWS Security Best Practices:** https://docs.aws.amazon.com/security/

---

## ✅ Checklist

- [ ] Terraform installed
- [ ] AWS CLI configured
- [ ] EC2 key pair created
- [ ] `terraform.tfvars` configured
- [ ] `terraform init` completed
- [ ] `terraform apply` successful
- [ ] PostgreSQL accessible
- [ ] Application connected
- [ ] Schema deployed
- [ ] Data seeded
- [ ] Backups verified

---

**Your PostgreSQL database is now ready for development!** 🎉
