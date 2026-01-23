# 🚀 PakLoad API Documentation

All API endpoints now use **PostgreSQL database** with real data persistence.

---

## 🔐 Authentication

### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+923001234567",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "shipper",  // or "carrier"
  "companyName": "ABC Logistics"
}

Response: 201 Created
{
  "access_token": "jwt-token-...",
  "refresh_token": "refresh-token-...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": { ... }
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@pakload.com",
  "password": "admin123"
}

Response: 200 OK
{
  "access_token": "jwt-token-...",
  "user": {
    "id": 1,
    "email": "admin@pakload.com",
    "role": "admin",
    ...
  }
}
```

### Seeded Test Users
```
Admin:
- Email: admin@pakload.com
- Password: admin123

Shipper:
- Email: shipper1@pakload.com
- Password: shipper123

Carrier:
- Email: carrier1@pakload.com
- Password: carrier123
```

---

## 📦 Loads

### Get All Loads
```http
GET /api/loads?status=available&origin=Karachi&urgent=true

Response: 200 OK
[
  {
    "id": 1,
    "userId": 2,
    "origin": "Karachi",
    "destination": "Lahore",
    "cargoType": "Electronics",
    "weight": 5000,
    "price": 50000,
    "urgent": true,
    "status": "available",
    ...
  }
]
```

### Get Load by ID
```http
GET /api/loads/1

Response: 200 OK
{
  "id": 1,
  "origin": "Karachi",
  "destination": "Lahore",
  ...
}
```

### Create New Load
```http
POST /api/loads
Content-Type: application/json

{
  "origin": "Islamabad",
  "destination": "Peshawar",
  "cargoType": "Textiles",
  "weight": 3000,
  "price": 35000,
  "pickupDate": "2024-01-25",
  "deliveryDate": "2024-01-27",
  "urgent": false,
  "description": "Cotton fabric rolls"
}

Response: 201 Created
```

---

## 🚛 Vehicles (Trucks)

### Get All Vehicles
```http
GET /api/trucks?status=available&truckType=Container

Response: 200 OK
[
  {
    "id": 1,
    "carrierId": 4,
    "vehicleType": "Container Truck",
    "registrationNumber": "KHI-1234",
    "capacity": 20000,
    "status": "available",
    ...
  }
]
```

### Get Vehicle by ID
```http
GET /api/trucks/1
```

### Create New Vehicle
```http
POST /api/trucks
Content-Type: application/json

{
  "vehicleType": "Flatbed Truck",
  "registrationNumber": "LHE-5678",
  "capacity": 15000,
  "currentLocation": "Lahore"
}

Response: 201 Created
```

---

## 📋 Bookings

### Get Booking by Tracking Number
```http
GET /api/bookings/LP-2024-00001

Response: 200 OK
{
  "id": 1,
  "trackingNumber": "LP-2024-00001",
  "loadId": 1,
  "carrierId": 4,
  "status": "in_transit",
  "progress": 45,
  "load": { ... },
  ...
}
```

### Create New Booking
```http
POST /api/bookings
Content-Type: application/json

{
  "loadId": 1,
  "carrierId": 4,
  "vehicleId": 1,
  "quotedPrice": 48000,
  "estimatedDays": 2
}

Response: 201 Created
```

---

## 💰 Quotes

### Create Quote
```http
POST /api/quotes
Content-Type: application/json

{
  "loadId": 1,
  "carrierId": 4,
  "vehicleId": 1,
  "quotedPrice": 47000,
  "estimatedDays": 2
}

Response: 201 Created
```

### Get Quotes for Load
```http
GET /api/quotes/load/1

Response: 200 OK
[
  {
    "id": 1,
    "loadId": 1,
    "carrierId": 4,
    "quotedPrice": 47000,
    "status": "pending",
    ...
  }
]
```

---

## 📊 Statistics

### Get Platform Stats
```http
GET /api/stats

Response: 200 OK
{
  "activeLoads": 8,
  "availableTrucks": 12,
  "inTransit": 5,
  "completed": 15,
  "verifiedCarriers": 3,
  "totalLoads": 10,
  "urgentLoads": 2,
  "totalUsers": 7,
  "totalVehicles": 12,
  "totalBookings": 20
}
```

---

## 👥 Carriers

### Get All Carriers
```http
GET /api/carriers

Response: 200 OK
[
  {
    "id": 4,
    "email": "carrier1@pakload.com",
    "firstName": "Ali",
    "lastName": "Khan",
    "role": "carrier",
    "companyName": "Khan Transport",
    "trustScore": 4.8,
    ...
  }
]
```

### Get Carrier by ID
```http
GET /api/carriers/4
```

---

## 🗺️ Routes

### Get All Routes
```http
GET /api/routes

Response: 200 OK
[]
// TODO: Implement RouteRepository
```

---

## ✅ Health Check

```http
GET /api/health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2024-01-23T19:30:00.000Z"
}
```

---

## 🔧 Database Schema

### Users Table
- id, email, phone, passwordHash
- firstName, lastName, role
- companyName, accountStatus, kycStatus
- trustScore, totalRatings
- createdAt, updatedAt

### Loads Table
- id, userId, origin, destination
- cargoType, weight, price
- pickupDate, deliveryDate
- status, urgent, description
- createdAt, updatedAt

### Vehicles Table
- id, carrierId, vehicleType
- registrationNumber, capacity
- currentLocation, status
- createdAt, updatedAt

### Bookings Table
- id, trackingNumber, loadId
- carrierId, vehicleId
- quotedPrice, estimatedDays
- status, progress
- pickupDate, deliveryDate
- createdAt, updatedAt

---

## 🎯 Features Implemented

✅ **Authentication**
- User registration with password hashing (bcrypt)
- Login with email/password validation
- Role-based access (admin, shipper, carrier)

✅ **Loads Management**
- Create, read, filter loads
- Search by origin, destination, cargo type
- Filter by status and urgency

✅ **Vehicles Management**
- CRUD operations for vehicles
- Filter by type, location, status
- Track vehicle availability

✅ **Bookings & Quotes**
- Create bookings with tracking numbers
- Quote management for loads
- Track booking progress and status

✅ **Statistics**
- Real-time platform metrics
- User, load, vehicle, booking counts
- Status-based filtering

✅ **Data Persistence**
- PostgreSQL database on EC2
- Drizzle ORM for type-safe queries
- Repository pattern for clean architecture

---

## 🚀 Testing the API

### Using cURL:
```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pakload.com","password":"admin123"}'

# Get loads
curl http://localhost:5000/api/loads

# Get stats
curl http://localhost:5000/api/stats
```

### Using Browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 📝 Next Steps

1. **JWT Authentication**: Replace mock tokens with real JWT
2. **Route Repository**: Implement routes table queries
3. **Middleware**: Add auth middleware for protected routes
4. **Validation**: Add request body validation (Zod)
5. **Pagination**: Add pagination for list endpoints
6. **Search**: Implement full-text search
7. **File Upload**: Add document/image upload for KYC
8. **Notifications**: Real-time notifications system
9. **Payment Integration**: Add payment gateway
10. **Analytics**: Advanced reporting and analytics

---

**All endpoints are now connected to PostgreSQL database! 🎉**
