# 🗄️ AWS RDS PostgreSQL Database Setup Guide

## ⚠️ Connection Timeout Issue

The database connection is timing out because the AWS RDS security group needs to be configured to allow inbound connections from your IP address.

---

## 🔧 Fix AWS RDS Security Group

### **Step 1: Get Your Public IP Address**
```bash
# Visit this URL in your browser:
https://whatismyipaddress.com/

# Or use PowerShell:
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

### **Step 2: Configure RDS Security Group**

1. **Go to AWS Console:** https://console.aws.amazon.com/rds/
2. **Navigate to:** Databases → `pakload` → Connectivity & security
3. **Click on:** VPC security groups (e.g., `sg-xxxxx`)
4. **Edit Inbound Rules:**
   - Click "Edit inbound rules"
   - Click "Add rule"
   - **Type:** PostgreSQL
   - **Protocol:** TCP
   - **Port:** 5432
   - **Source:** My IP (or paste your IP address)
   - **Description:** "Development access"
   - Click "Save rules"

### **Step 3: Test Connection**

After configuring the security group, test the connection:

```bash
# Test with PowerShell
Test-NetConnection -ComputerName pakload.cluster-chaq2wa0avo5.eu-north-1.rds.amazonaws.com -Port 5432

# Or test with psql (if installed)
psql -h pakload.cluster-chaq2wa0avo5.eu-north-1.rds.amazonaws.com -U hypercloud -d pakload
```

---

## 📊 Database Schema Overview

The database includes the following tables following DAT/Loadboard standards:

### **Core Tables:**
1. **users** - User accounts (admin, shipper, carrier)
2. **loads** - Load postings
3. **vehicles** - Carrier fleet management
4. **bookings** - Load bookings and tracking
5. **quotes** - Carrier quotes for loads
6. **routes** - Popular routes and statistics
7. **payments** - Payment transactions
8. **reviews** - User reviews and ratings
9. **platform_config** - Platform configuration
10. **activity_logs** - Audit trail
11. **notifications** - User notifications

### **Database Features:**
- ✅ Role-based access (admin, shipper, carrier)
- ✅ Load lifecycle management
- ✅ Real-time tracking
- ✅ Payment processing
- ✅ Review system
- ✅ Activity logging
- ✅ Notifications
- ✅ Platform configuration

---

## 🚀 Deploy Database Schema

Once the security group is configured, run:

```bash
# Push schema to database
npm run db:push

# This will create all tables, enums, and relationships
```

---

## 📝 Seed Initial Data

After schema is deployed, seed the database with initial data:

```bash
# Run seed script
npm run db:seed
```

---

## 🔐 Environment Variables

Database credentials are stored in `server/.env`:

```env
DATABASE_URL=postgresql://hypercloud:oEQlJGIev7uXJH61ZcJA@pakload.cluster-chaq2wa0avo5.eu-north-1.rds.amazonaws.com:5432/pakload
DB_HOST=pakload.cluster-chaq2wa0avo5.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=hypercloud
DB_PASSWORD=oEQlJGIev7uXJH61ZcJA
DB_NAME=pakload
```

**⚠️ IMPORTANT:** Never commit `.env` files to version control!

---

## 🧪 Test Database Connection

```bash
# Test connection
node -e "require('./server/db/index.js').testConnection()"
```

---

## 📊 View Database

```bash
# Open Drizzle Studio (database GUI)
npm run db:studio

# Opens at: https://local.drizzle.studio
```

---

## 🔄 Migration Workflow

1. **Modify schema:** Edit `server/db/schema.ts`
2. **Generate migration:** `npm run db:push`
3. **Apply changes:** Automatically applied
4. **Verify:** Check Drizzle Studio

---

## 🛠️ Troubleshooting

### **Connection Refused**
- Check security group allows your IP
- Verify RDS instance is running
- Check VPC and subnet configuration

### **Timeout**
- Security group not configured
- RDS instance in private subnet
- Network firewall blocking port 5432

### **Authentication Failed**
- Verify credentials in `.env`
- Check master username/password
- Ensure database name is correct

---

## 📚 Database Schema Details

### **Users Table**
```sql
- id (serial, primary key)
- email (unique)
- password (hashed)
- firstName, lastName
- phone, companyName
- role (admin, shipper, carrier)
- status (active, pending, suspended)
- verified (boolean)
- rating, totalLoads, completedLoads
- timestamps
```

### **Loads Table**
```sql
- id (serial, primary key)
- shipperId (foreign key → users)
- trackingNumber (unique)
- origin, destination
- pickupDate, deliveryDate
- cargoType, cargoWeight, cargoVolume
- price, status
- timestamps
```

### **Bookings Table**
```sql
- id (serial, primary key)
- loadId (foreign key → loads)
- carrierId (foreign key → users)
- vehicleId (foreign key → vehicles)
- status, price, platformFee
- progress, currentLocation
- timestamps
```

---

## 🎯 Next Steps

1. ✅ Configure AWS RDS security group
2. ✅ Test database connection
3. ✅ Push database schema
4. ✅ Seed initial data
5. ✅ Update API routes to use database
6. ✅ Test all features

---

**Built for the China-Pakistan Economic Corridor**  
**Powered by AWS RDS PostgreSQL**
