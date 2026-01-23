# 🔧 AWS RDS Public Access Configuration

## ⚠️ Current Issue

Your AWS RDS instance is in a **private subnet** and not publicly accessible. The endpoint resolves to a private IP address (172.31.0.203) which cannot be reached from the internet.

**Error:**
```
Error: connect ETIMEDOUT 172.31.0.203:5432
```

---

## ✅ Solution: Enable Public Accessibility

### **Option 1: Modify RDS Instance for Public Access**

1. **Go to AWS RDS Console:**
   https://console.aws.amazon.com/rds/

2. **Select Your Database:**
   - Click on "Databases"
   - Select `pakload` cluster

3. **Modify Instance:**
   - Click "Modify"
   - Scroll to "Connectivity"
   - Find "Public access"
   - Select **"Yes"** (Publicly accessible)

4. **Apply Changes:**
   - Scroll to bottom
   - Select "Apply immediately"
   - Click "Modify DB instance"

5. **Wait for Changes:**
   - Status will show "Modifying"
   - Wait 5-10 minutes for changes to apply

6. **Verify Security Group:**
   - Go to "Connectivity & security" tab
   - Click on VPC security groups
   - Edit inbound rules:
     - Type: PostgreSQL
     - Port: 5432
     - Source: Your IP or 0.0.0.0/0 (for testing)

---

### **Option 2: Use AWS Systems Manager Session Manager**

If you cannot make the RDS publicly accessible, you can use AWS Systems Manager to create a tunnel:

```powershell
# Install AWS CLI and Session Manager plugin first
aws ssm start-session --target <ec2-instance-id> `
  --document-name AWS-StartPortForwardingSessionToRemoteHost `
  --parameters '{
    "host":["pakload.cluster-chaq2wa0avo5.eu-north-1.rds.amazonaws.com"],
    "portNumber":["5432"],
    "localPortNumber":["5432"]
  }'
```

Then connect to `localhost:5432` instead.

---

### **Option 3: Deploy to EC2 in Same VPC**

Deploy your application to an EC2 instance in the same VPC as the RDS instance. This allows private network access without exposing RDS publicly.

---

## 🔐 Security Considerations

### **For Development (Temporary):**
- Enable public access
- Restrict security group to your IP only
- Disable public access when not in use

### **For Production:**
- Keep RDS in private subnet
- Use VPN or AWS Direct Connect
- Deploy application in same VPC
- Use AWS Systems Manager for admin access

---

## 🧪 Test Connection After Changes

### **PowerShell Test:**
```powershell
Test-NetConnection -ComputerName pakload.cluster-chaq2wa0avo5.eu-north-1.rds.amazonaws.com -Port 5432
```

### **psql Test (if installed):**
```bash
psql -h pakload.cluster-chaq2wa0avo5.eu-north-1.rds.amazonaws.com -U hypercloud -d pakload
```

### **Node.js Test:**
```bash
node -e "require('./server/db/index.js').testConnection()"
```

---

## 📋 Checklist

- [ ] Modify RDS instance for public access
- [ ] Wait for modification to complete (5-10 min)
- [ ] Configure security group inbound rules
- [ ] Test connection with PowerShell
- [ ] Run `npm run db:push`
- [ ] Run `npm run db:seed`
- [ ] Start application with `npm run dev`

---

## 🚨 Alternative: Use Local PostgreSQL for Development

If you cannot configure AWS RDS for public access right now, you can use a local PostgreSQL instance for development:

### **Install PostgreSQL Locally:**

1. **Download:** https://www.postgresql.org/download/windows/
2. **Install** with default settings
3. **Create database:**
   ```sql
   CREATE DATABASE pakload;
   ```

4. **Update `.env`:**
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/pakload
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=pakload
   ```

5. **Deploy schema:**
   ```bash
   npm run db:push
   npm run db:seed
   npm run dev
   ```

---

## 📞 Next Steps

**Choose one option:**

1. **Enable Public Access** (Recommended for development)
   - Modify RDS instance
   - Configure security group
   - Test and deploy

2. **Use Local PostgreSQL** (Quick alternative)
   - Install PostgreSQL
   - Update configuration
   - Deploy locally

3. **Deploy to AWS EC2** (Production approach)
   - Launch EC2 in same VPC
   - Deploy application
   - Access RDS privately

---

**Let me know which option you'd like to proceed with!**
