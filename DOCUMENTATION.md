# 📚 PakLoad Platform - Complete Documentation

**Version:** 2.0.0  
**Last Updated:** January 24, 2026  
**Platform:** China-Pakistan Logistics Loadboard

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Accounts](#test-accounts)
4. [API Reference](#api-reference)
5. [Database Architecture](#database-architecture)
6. [Security & Authentication](#security--authentication)
7. [Admin Panel](#admin-panel)
8. [Features Status](#features-status)
9. [Troubleshooting](#troubleshooting)

---

## Overview

PakLoad is a comprehensive logistics loadboard platform connecting shippers and carriers along the China-Pakistan Economic Corridor (CPEC). The platform enables:

- **Shippers** to post loads and find carriers
- **Carriers** to browse loads and manage their fleet
- **Admins** to manage platform configuration, pricing, and users

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Styling | TailwindCSS |
| Auth | JWT + bcrypt |
| State | React Query + Context API |

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Documentation | http://localhost:5173/docs |

---

## Quick Start

### 1. Start the Development Server

```bash
cd pakload
npm run dev
```

This starts both frontend (port 5173) and backend (port 5000) concurrently.

### 2. Access the Platform

1. Open http://localhost:5173
2. Sign up or use a test account
3. Explore the dashboard based on your role

### 3. API Testing

```bash
# Test API health
curl http://localhost:5000/api/stats

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pakload.com","password":"admin123"}'
```

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@pakload.com | admin123 |
| **Shipper** | shipper@pakload.com | shipper123 |
| **Carrier** | demo@pakload.com | carrier123 |

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
```
Authorization: Bearer <token>
```

---

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Register new user |
| POST | `/v1/auth/login` | Login with email/password |
| POST | `/v1/auth/otp/request` | Request OTP for phone login |
| POST | `/v1/auth/otp/verify` | Verify OTP and login |

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "ahmed@example.com",
  "password": "securepass123",
  "phone": "+92 300 1234567",
  "role": "shipper"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "user": { "id": 1, "email": "...", "role": "shipper" },
  "token": "jwt-token-here"
}
```

---

### Loads Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/loads` | Get all loads (with filters) |
| GET | `/loads/:id` | Get load by ID |
| POST | `/loads` | Create new load |
| PUT | `/loads/:id` | Update load |
| DELETE | `/loads/:id` | Delete load |

#### Get Loads with Filters
```http
GET /api/loads?origin=Karachi&destination=Lahore&cargoType=Electronics
```

#### Create Load
```http
POST /api/loads
Content-Type: application/json
Authorization: Bearer <token>

{
  "origin": "Urumqi, China",
  "destination": "Islamabad, Pakistan",
  "cargoType": "Electronics",
  "weight": 15000,
  "pickupDate": "2026-02-01",
  "deliveryDate": "2026-02-10",
  "price": "5000",
  "description": "Consumer electronics shipment"
}
```

---

### Vehicles/Trucks Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trucks` | Get all vehicles |
| GET | `/trucks/:id` | Get vehicle by ID |
| POST | `/trucks` | Register new vehicle |
| PUT | `/trucks/:id` | Update vehicle |
| DELETE | `/trucks/:id` | Remove vehicle |

#### Create Vehicle
```http
POST /api/trucks
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "40ft Container",
  "registrationNumber": "ABC-1234",
  "capacity": "28000",
  "currentLocation": "Kashgar, China",
  "status": "active"
}
```

**Note:** Status must be one of: `active`, `maintenance`, `inactive`

---

### Bookings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | Get user's bookings |
| GET | `/bookings/:trackingNumber` | Get by tracking number |
| POST | `/bookings` | Create booking |

---

### User Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update profile |
| POST | `/users/change-password` | Change password |

---

### Statistics Endpoint

```http
GET /api/stats
```

**Response:**
```json
{
  "activeLoads": 156,
  "availableTrucks": 342,
  "inTransit": 89,
  "completed": 2847,
  "verifiedCarriers": 500,
  "totalLoads": 10000
}
```

---

### Admin API (49 Endpoints)

**Base Path:** `/api/admin`  
**Required:** Admin role authentication

#### Cargo Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/categories/:id` | Get category |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| POST | `/categories/:id/publish` | Publish category |
| POST | `/categories/:id/unpublish` | Unpublish category |
| GET | `/categories/stats` | Get statistics |

#### Pricing Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pricing-rules` | List all rules |
| GET | `/pricing-rules/:id` | Get rule |
| POST | `/pricing-rules` | Create rule |
| PUT | `/pricing-rules/:id` | Update rule |
| DELETE | `/pricing-rules/:id` | Delete rule |
| POST | `/pricing-rules/:id/publish` | Publish rule |
| GET | `/pricing-rules/active/list` | Get active rules |
| POST | `/pricing-rules/applicable` | Find applicable rules |

#### Route Pricing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/route-pricing` | List all pricing |
| POST | `/route-pricing` | Create pricing |
| POST | `/route-pricing/bulk` | Bulk create |
| PUT | `/route-pricing/:id` | Update pricing |
| DELETE | `/route-pricing/:id` | Delete pricing |

#### Platform Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | List all configs |
| GET | `/config/:key` | Get config |
| POST | `/config` | Create config |
| PUT | `/config/:key` | Update config |
| POST | `/config/bulk-update` | Bulk update |

#### Routes Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | List all routes |
| POST | `/routes` | Create route |
| PUT | `/routes/:id` | Update route |
| DELETE | `/routes/:id` | Delete route |
| GET | `/routes/popular/list` | Get popular routes |

#### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | List all logs |
| GET | `/audit-logs/:entity/:entityId` | Get entity logs |
| GET | `/audit-logs/recent/list` | Get recent logs |
| GET | `/audit-logs/stats/summary` | Get statistics |

---

## Database Architecture

### Connection Details

| Property | Value |
|----------|-------|
| Server | AWS EC2 PostgreSQL |
| Host | 13.63.16.242:5432 |
| Database | pakload |
| ORM | Drizzle |

### Tables (14 total)

| Table | Description |
|-------|-------------|
| `users` | User accounts and authentication |
| `loads` | Cargo loads/shipments |
| `vehicles` | Trucks and carrier vehicles |
| `bookings` | Bookings and quotes |
| `routes` | Available shipping routes |
| `payments` | Payment records |
| `reviews` | User reviews and ratings |
| `platform_config` | System configuration |
| `activity_logs` | User activity tracking |
| `notifications` | User notifications |
| `cargo_categories` | Cargo type management |
| `pricing_rules` | Dynamic pricing engine |
| `route_pricing` | Route-specific pricing |
| `audit_logs` | Admin action tracking |

### Data Flow

```
Frontend Request
    ↓
API Route (/api/*)
    ↓
Repository (Business Logic)
    ↓
Drizzle ORM
    ↓
PostgreSQL Database
    ↓
Real Data Response
```

---

## Security & Authentication

### JWT Authentication

All authenticated requests require:
```
Authorization: Bearer <token>
```

Token is returned on successful login and should be stored in localStorage.

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all endpoints including admin panel |
| **Shipper** | Post loads, view carriers, manage bookings |
| **Carrier** | Browse loads, manage vehicles, submit quotes |

### Security Middleware

| Middleware | Purpose |
|------------|---------|
| `requireAuth` | Validates JWT token |
| `requireAdmin` | Ensures admin role |
| `requireRole(...)` | Flexible role checking |
| `optionalAuth` | Extracts user if token present |

### Audit Logging

All admin actions are automatically logged with:
- User ID and action type
- Entity type and ID
- Old and new values (change detection)
- IP address and user agent
- Timestamp and severity level

### Publishing Workflow

| State | Description |
|-------|-------------|
| **Draft** | Created but not visible to users |
| **Published** | Active and visible |
| **Archived** | Soft deleted, data retained |

---

## Admin Panel

Access the admin panel at `/admin/settings` (requires admin role).

### Modules

1. **Cargo Categories** - Manage cargo types and base rates
2. **Pricing Rules** - Configure dynamic pricing rules
3. **Route Pricing** - Set route-specific pricing
4. **Platform Config** - System-wide configuration
5. **Routes Management** - Manage shipping routes
6. **Audit Logs** - View admin action history

---

## Features Status

### ✅ Complete

- User Authentication (Email/Password, OTP)
- JWT Token Management
- Load Management (CRUD)
- Vehicle Management (CRUD)
- Booking System
- Admin Dashboard (49 endpoints)
- Real-time Statistics
- Profile Management
- Password Change
- Toast Notifications
- Form Validation
- Publishing Workflow
- Audit Logging

### 🟡 Partial

- Real-time Tracking (UI exists, needs WebSocket)
- Document Upload (UI exists, needs backend)
- Payment Processing (Schema exists, needs integration)

### 📋 Planned

- Load Matching Algorithm
- Rate Calculator
- Email/SMS Notifications
- Reviews System
- Factoring Integration

---

## Troubleshooting

### Common Issues

#### Cannot login - Invalid credentials
**Solution:** Verify email and password. Use test accounts listed above.

#### API returns 401 Unauthorized
**Solution:** Ensure Authorization header has valid Bearer token.

#### Database connection failed
**Solution:** Check PostgreSQL is running and `.env` has correct `DATABASE_URL`.

#### CORS errors in browser
**Solution:** Backend allows localhost:5173. For other origins, update CORS in `server/index.ts`.

#### Vehicle creation fails
**Solution:** Use status `active`, `maintenance`, or `inactive` (not `available`).

#### Load status mismatch
**Solution:** Use `posted` status for new loads, not `available`.

### Environment Variables

Create `server/.env`:
```env
DATABASE_URL=postgresql://user:pass@host:5432/pakload
JWT_SECRET=your-secret-key
PORT=5000
```

### Logs

Check server console for detailed error messages:
```bash
npm run server:dev
```

---

## Support

For additional help:
- Check the in-app documentation at `/docs`
- Review the QA Audit Report: `QA_AUDIT_REPORT.md`
- Check API routes: `ADMIN_API_ROUTES.md`
- Database status: `DATABASE_STATUS.md`

---

*Documentation generated for PakLoad Platform v2.0.0*
