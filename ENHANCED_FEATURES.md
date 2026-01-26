# PakLoad Enhanced Features

## New Features Implemented

### 1. User Types (5 Roles)
- **Admin** - Platform administrators
- **Shipper** - Companies/individuals posting loads
- **Carrier** - Transport companies with vehicles
- **Driver** - Individual drivers (can be linked to carriers)
- **Broker** - Freight brokers connecting shippers and carriers

### 2. Document Management System

#### Required Documents by Role

**Carrier:**
- Company Registration / SSC Certificate
- Owner NIC (CNIC) Copy
- NTN Tax Certificate
- Insurance Certificate

**Driver:**
- NIC (CNIC) Copy
- HTV Driving License

**Shipper:**
- Company Registration
- Owner NIC Copy
- NTN Certificate (optional)

**Broker:**
- Company/Brokerage Registration
- NIC Copy
- NTN Certificate

#### Document Types Supported
- `nic_copy` - National ID Card
- `driving_license_htv` - HTV Driving License
- `company_registration` - Company/SSC Registration
- `vehicle_registration` - Vehicle Registration
- `insurance_certificate` - Insurance
- `tir_carnet` - TIR Carnet
- `customs_clearance` - Customs Clearance Certificate
- `route_permit` - Route Permit
- `fitness_certificate` - Vehicle Fitness
- `tax_certificate` - Tax Certificate

### 3. Company Profiles
- Company name and registration number
- NTN (National Tax Number)
- Full address with city, province, country
- **GPS coordinates (latitude/longitude)** for pin location
- Office picture and multiple photos
- Contact person details
- Website

### 4. Goods Requests (New Post Type)
Shippers can now post "I need these goods" requests:
- Title and description
- Goods type and quantity
- Origin and destination (city/country)
- Budget range (min/max)
- Required by date
- Status: open, matched, closed, expired

### 5. Legal Terms & Disclaimers

#### Prohibited Items Policy
- Narcotics and controlled substances
- Weapons and explosives
- Hazardous materials (without permits)
- Contraband and smuggled goods
- Restricted items (alcohol, wildlife products)

#### Client Responsibilities
- Shipper and carrier obligations
- Liability limitations
- Customs and police detention procedures
- Dispute resolution

#### Computer Generated Receipts
- Pickup, delivery, customs, transit receipts
- Unique receipt numbers with QR codes
- Cargo details and condition
- Digital signatures
- Photo documentation

### 6. Pakistan Domestic Routes

#### Motorway Routes
- M1: Islamabad ↔ Peshawar (155 km)
- M2: Islamabad ↔ Lahore (375 km)
- M3: Lahore ↔ Multan (342 km)
- M4: Faisalabad ↔ Multan (242 km)
- M5: Multan ↔ Sukkur (392 km)
- M9: Hyderabad ↔ Karachi (136 km)

#### National Highway Routes
- N5: Karachi ↔ Peshawar (1,819 km)
- N25: Karachi ↔ Quetta (687 km)
- N35: Islamabad ↔ Sost/Khunjerab (887 km) - Karakoram Highway
- N50: Quetta ↔ D.G. Khan (350 km)
- N55: Peshawar ↔ Karachi (1,264 km) - Indus Highway

#### CPEC Corridors
- Gwadar ↔ Kashgar (2,442 km)
- Karachi ↔ Kashgar (2,700 km)

#### Border Crossings
- Torkham (Pakistan-Afghanistan)
- Chaman (Pakistan-Afghanistan)
- Wagah (Pakistan-India)
- Taftan (Pakistan-Iran)
- Khunjerab (Pakistan-China)

### 7. TIR Convention Countries (60+)

#### Regions Covered
- **Europe** (40+ countries) - EU, EFTA, Eastern Europe
- **Middle East** (13 countries) - Turkey, Iran, GCC states
- **Central Asia** (6 countries) - Kazakhstan, Uzbekistan, etc.
- **South Asia** - Pakistan, India
- **East Asia** - China, Mongolia, South Korea
- **Caucasus** - Armenia, Azerbaijan, Georgia
- **Africa** (5 countries) - North African states

#### TIR Vehicle Features
- TIR Carnet number and expiry
- Approved countries list
- Customs seal number
- Inspection dates
- TIR certification status

### 8. Map Integration
- Location picker with search
- Current location detection
- Click-to-select on map
- Coordinates display
- OpenStreetMap integration

---

## API Endpoints

### Documents API (`/api/documents`)
```
GET  /my-documents          - Get user's documents
POST /upload                - Upload a document
PATCH /:id/verify           - Admin: Verify document
GET  /company-profile       - Get company profile
POST /company-profile       - Create/update company profile
GET  /driver-profile        - Get driver profile
POST /driver-profile        - Create/update driver profile
GET  /required-documents/:role - Get required docs by role
```

### Goods Requests API (`/api/goods-requests`)
```
GET  /                      - List all goods requests
GET  /:id                   - Get single request
POST /                      - Create goods request
PUT  /:id                   - Update goods request
POST /:id/close             - Close goods request
GET  /my/requests           - Get user's requests
```

### Reference Data API (`/api/reference`)
```
GET  /tir-countries         - List TIR countries
GET  /tir-countries/:code   - Get country by code
GET  /pakistan-routes       - List Pakistan routes
GET  /pakistan-routes/:code - Get route by code
GET  /pakistan-routes/map/all - Routes with coordinates
GET  /legal-terms           - Get legal terms
GET  /legal-terms/:type     - Get specific term
GET  /prohibited-items      - List prohibited items
GET  /pakistan-cities       - City autocomplete
```

---

## Database Tables Added

1. `company_profiles` - Company details with GPS location
2. `user_documents` - Uploaded documents with verification status
3. `driver_profiles` - Driver-specific information
4. `goods_requests` - Shipper goods/service requests
5. `tir_countries` - TIR Convention member countries
6. `pakistan_routes` - Domestic routes with coordinates
7. `legal_terms` - Terms, disclaimers, policies
8. `user_legal_acceptances` - User acceptance records
9. `shipment_receipts` - Computer-generated receipts
10. `prohibited_items` - Illegal/restricted items list
11. `customs_incidents` - Detention/inspection records
12. `tir_vehicles` - TIR-certified vehicle details

---

## Frontend Components

1. `LocationPicker.tsx` - Map-based location selection
2. `DocumentUpload.tsx` - Document upload with verification status
3. `RequiredDocuments.tsx` - Role-based document checklist

---

## Usage

### Seed Reference Data
```bash
npx tsx server/db/seed-reference-data.ts
```

### Push Schema Changes
```bash
npm run db:push
```

---

## Security Notes

- Documents are encrypted and stored securely
- NIC/CNIC copies are NOT visible to other users
- Only verification status is shown publicly
- Admin verification required for document approval
- All legal acceptances are logged with IP and timestamp
