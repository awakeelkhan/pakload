# PakLoad Logistics Platform - Complete Workflow Design

## Executive Summary

PakLoad is a comprehensive logistics platform connecting shippers, carriers, and logistics companies across Pakistan and international TIR routes (60+ countries). This document defines the complete workflow, user roles, verification requirements, and compliance framework.

---

## 1. User Roles & Hierarchy

### 1.1 Role Definitions

| Role | Description | Primary Functions |
|------|-------------|-------------------|
| **Admin** | Platform administrators | Full system control, user verification, dispute resolution |
| **Company (Shipper)** | Registered business entities needing freight | Post loads, manage shipments, pay carriers |
| **Individual (Shipper)** | Individual users needing freight | Post loads (limited), personal shipments |
| **Carrier (Company)** | Logistics companies with fleet | Bid on loads, manage drivers/vehicles, TIR operations |
| **Carrier (Individual)** | Owner-operators with single vehicle | Bid on loads, self-drive operations |
| **Driver** | Employed by carrier companies | Execute shipments, update status, collect signatures |

### 1.2 Role Capabilities Matrix

| Capability | Admin | Company Shipper | Individual Shipper | Carrier Company | Carrier Individual | Driver |
|------------|-------|-----------------|-------------------|-----------------|-------------------|--------|
| Post Loads | ✓ | ✓ | ✓ (Limited) | ✗ | ✗ | ✗ |
| Post Reverse Requests | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Bid on Loads | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Manage Vehicles | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Manage Drivers | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Execute Shipments | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Verify Documents | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View All Users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Generate Reports | ✓ | ✓ (Own) | ✓ (Own) | ✓ (Own) | ✓ (Own) | ✗ |
| TIR Operations | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |

---

## 2. Registration & Verification Requirements

### 2.1 Company Shipper Registration

**Step 1: Basic Registration**
```
Required Fields:
- Company Name
- Email (verified via OTP)
- Phone (verified via OTP)
- Password (min 8 chars, 1 uppercase, 1 number)
```

**Step 2: Company Profile**
```
Required Fields:
- Company Registration Number (SECP/SSC)
- NTN Number (National Tax Number)
- Office Address (full address)
- City, Province, Country
- Pin Location (GPS coordinates via map)
- Office Photos (min 2, max 5)
- Contact Person Name
- Contact Person Phone
- Contact Person Email
```

**Step 3: Document Upload**
| Document | Required | Validity Check |
|----------|----------|----------------|
| Company Registration Certificate | ✓ | SECP verification |
| NTN Certificate | ✓ | FBR verification |
| CNIC of Authorized Person | ✓ | NADRA format check |
| Office Utility Bill | ✓ | Address verification |
| Bank Account Details | ✓ | For payments |

**Step 4: Verification**
- Admin reviews all documents
- Physical address verification (optional for premium)
- Account activated upon approval

---

### 2.2 Individual Shipper Registration

**Step 1: Basic Registration**
```
Required Fields:
- Full Name
- Email (verified via OTP)
- Phone (verified via OTP)
- Password
```

**Step 2: Identity Verification**
| Document | Required | Validity Check |
|----------|----------|----------------|
| CNIC (Front & Back) | ✓ | NADRA format check |
| Selfie with CNIC | ✓ | Face match verification |
| Proof of Address | ✓ | Utility bill/bank statement |

**Limitations for Individual Shippers:**
- Maximum 5 active loads at a time
- Maximum load value: PKR 500,000
- No TIR/international shipments
- Must upgrade to Company for higher limits

---

### 2.3 Carrier Company Registration

**Step 1: Basic Registration**
```
Required Fields:
- Company Name
- Email (verified via OTP)
- Phone (verified via OTP)
- Password
- Fleet Size (estimated)
```

**Step 2: Company Profile**
```
Required Fields:
- Company Registration Number
- NTN Number
- Office Address with Pin Location
- Office Photos (min 3)
- Fleet Yard Photos (min 2)
- Contact Person Details
```

**Step 3: Document Upload**
| Document | Required | Validity Check | Renewal |
|----------|----------|----------------|---------|
| Company Registration (SECP/SSC) | ✓ | SECP verification | Annual |
| NTN Certificate | ✓ | FBR verification | Annual |
| HTV License (Company) | ✓ | Transport authority | Annual |
| CNIC of Owner/Director | ✓ | NADRA format | N/A |
| Bank Account Details | ✓ | For payments | N/A |
| Insurance Certificate | ✓ | Valid coverage | Annual |
| Route Permits | ✓ (if applicable) | Provincial authority | Annual |

**Step 4: Vehicle Registration (per vehicle)**
| Document | Required | Validity Check |
|----------|----------|----------------|
| Vehicle Registration Book | ✓ | Excise verification |
| Fitness Certificate | ✓ | Valid & not expired |
| Route Permit | ✓ | Provincial authority |
| Insurance | ✓ | Comprehensive coverage |
| Vehicle Photos (4 angles) | ✓ | Current condition |

**Step 5: TIR Certification (Optional)**
| Document | Required for TIR |
|----------|------------------|
| TIR Carnet | ✓ |
| Customs Bond | ✓ |
| International Insurance | ✓ |
| ATA Carnet (if applicable) | Optional |

---

### 2.4 Carrier Individual (Owner-Operator) Registration

**Step 1: Basic Registration**
```
Required Fields:
- Full Name
- Email (verified via OTP)
- Phone (verified via OTP)
- Password
```

**Step 2: Identity & License Verification**
| Document | Required | Validity Check |
|----------|----------|----------------|
| CNIC (Front & Back) | ✓ | NADRA format |
| HTV Driving License | ✓ | Valid & not expired |
| Selfie with CNIC | ✓ | Face match |
| Address Proof | ✓ | Utility bill |

**Step 3: Vehicle Registration**
| Document | Required |
|----------|----------|
| Vehicle Registration Book | ✓ |
| Fitness Certificate | ✓ |
| Insurance Certificate | ✓ |
| Vehicle Photos (4 angles) | ✓ |

---

### 2.5 Driver Registration (Under Carrier Company)

**Registered by Carrier Company Admin**

| Document | Required | Validity Check |
|----------|----------|----------------|
| CNIC (Front & Back) | ✓ | NADRA format |
| HTV Driving License | ✓ | Valid & not expired |
| Medical Fitness Certificate | ✓ | Recent (< 6 months) |
| Police Verification | ✓ | Clean record |
| Passport Photo | ✓ | Recent |
| Emergency Contact | ✓ | Verified phone |

---

## 3. Document Management & Approval Workflow

### 3.1 Document Upload Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Uploads  │────▶│  Auto-Validate  │────▶│  Admin Queue    │
│    Document     │     │   (Format/Size) │     │   for Review    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                        ┌───────────────────────────────┼───────────────────────────────┐
                        │                               │                               │
                        ▼                               ▼                               ▼
                ┌───────────────┐              ┌───────────────┐              ┌───────────────┐
                │   APPROVED    │              │   REJECTED    │              │  MORE INFO    │
                │  (Verified)   │              │ (With Reason) │              │   REQUIRED    │
                └───────────────┘              └───────────────┘              └───────────────┘
```

### 3.2 Document Status States

| Status | Description | User Action |
|--------|-------------|-------------|
| `pending` | Uploaded, awaiting review | Wait |
| `under_review` | Admin is reviewing | Wait |
| `verified` | Approved and valid | None |
| `rejected` | Not approved | Re-upload with corrections |
| `expired` | Was valid, now expired | Upload renewed document |
| `expiring_soon` | Valid but expires in 30 days | Upload renewed document |

### 3.3 Document Visibility Rules

| Document Type | Admin | Owner | Other Users | Public |
|---------------|-------|-------|-------------|--------|
| CNIC | ✓ | ✓ | ✗ | ✗ |
| Company Registration | ✓ | ✓ | ✓ (Verified badge only) | ✗ |
| HTV License | ✓ | ✓ | ✓ (Verified badge only) | ✗ |
| Vehicle Registration | ✓ | ✓ | ✓ (Number only) | ✗ |
| Insurance | ✓ | ✓ | ✓ (Valid/Invalid only) | ✗ |
| TIR Carnet | ✓ | ✓ | ✓ (Countries list) | ✗ |

### 3.4 Automatic Document Expiry Alerts

```
Timeline:
- 60 days before expiry: Email notification
- 30 days before expiry: Email + SMS + In-app alert
- 14 days before expiry: Daily reminders
- 7 days before expiry: Account flagged, warning banner
- On expiry: Account restricted (cannot bid/post)
- 30 days after expiry: Account suspended
```

---

## 4. Load Posting Workflow

### 4.1 Standard Load Posting (Shipper → Carrier)

**"I have goods to ship from A to B"**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Shipper Posts  │────▶│  Load Visible   │────▶│ Carriers Browse │
│     Load        │     │   on Platform   │     │   & Filter      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Shipper Reviews │◀────│   Bid Queue     │◀────│  Carrier Bids   │
│   & Selects     │     │  (Ranked)       │     │   on Load       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Bid Accepted   │────▶│ Booking Created │────▶│ Receipt Generated│
│  (Contract)     │     │ (Both Notified) │     │ (Pickup Scheduled)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Load Posting Form:**
```
Basic Information:
- Title/Description
- Cargo Type (from categories)
- Weight (kg/tons)
- Volume (CBM)
- Number of Packages
- Packaging Type

Pickup Details:
- Pickup City
- Pickup Address
- Pin Location (Map)
- Pickup Date/Time Window
- Contact Person & Phone

Delivery Details:
- Delivery City
- Delivery Address
- Pin Location (Map)
- Expected Delivery Date
- Contact Person & Phone

Pricing:
- Budget Range (Min-Max)
- Payment Terms (Advance %, On Delivery %)
- Payment Method Preference

Special Requirements:
- Vehicle Type Required
- Temperature Control
- Hazmat Classification
- Insurance Requirements
- Special Handling Instructions

Legal Declarations:
☐ Cargo does not contain prohibited items
☐ All customs documentation is complete
☐ I accept responsibility for cargo contents
☐ I agree to Terms of Service
```

### 4.1.1 Container Type Selection

**Available Container Types:**

| Type | Dimensions | Capacity | Use Case |
|------|------------|----------|----------|
| **20ft Standard** | 6.1m × 2.4m × 2.6m | 33 CBM | General cargo, small shipments |
| **40ft Standard** | 12.2m × 2.4m × 2.6m | 67 CBM | Large shipments, bulk cargo |
| **40ft High Cube** | 12.2m × 2.4m × 2.9m | 76 CBM | Voluminous cargo, furniture |
| **45ft High Cube** | 13.7m × 2.4m × 2.9m | 86 CBM | Maximum volume cargo |
| **Flatbed** | Variable | Open | Machinery, construction materials |
| **Lowbed** | Variable | Open | Heavy machinery, oversized cargo |
| **Reefer 20ft** | 6.1m × 2.4m × 2.6m | 28 CBM | Refrigerated goods |
| **Reefer 40ft** | 12.2m × 2.4m × 2.6m | 60 CBM | Large refrigerated shipments |
| **Tanker** | Variable | Liquid | Liquids, chemicals, fuel |
| **Open Top** | 12.2m × 2.4m × Open | Variable | Tall cargo, crane loading |
| **Bulk** | Variable | Bulk | Grains, minerals, loose cargo |

### 4.1.2 PIN-Based Location Selection

**Interactive Map Features:**

```
┌────────────────────────────────────────────────────────────────┐
│  📍 Select Pickup Location                              [×]   │
├────────────────────────────────────────────────────────────────┤
│  🔍 Search: [Industrial Area, Karachi____________] [Search]   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │                    [MAP VIEW]                            │ │
│  │                                                          │ │
│  │              📍 ← Drag to adjust                         │ │
│  │                                                          │ │
│  │    [+] [-]                                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  📍 Selected Location:                                         │
│  Address: Plot 123, Industrial Area, SITE, Karachi            │
│  Coordinates: 24.8607° N, 67.0011° E                          │
│                                                                │
│  [📍 Use Current Location]  [✓ Confirm Location]              │
└────────────────────────────────────────────────────────────────┘
```

**Location Selection Methods:**
1. **Search by Address** - Type address, select from suggestions
2. **Pin Drop** - Tap/click on map to drop pin
3. **Current Location** - Use GPS (mobile)
4. **Saved Locations** - Select from previously saved addresses

### 4.1.3 Product Images & Videos Upload

**Media Upload Guidelines:**

| Media Type | Max Count | Max Size | Formats |
|------------|-----------|----------|---------|
| **Images** | 10 | 5 MB each | JPG, PNG, WEBP |
| **Videos** | 3 | 50 MB each | MP4, MOV |
| **Documents** | 5 | 10 MB each | PDF, DOC, DOCX |

**Upload Interface:**
```
┌────────────────────────────────────────────────────────────────┐
│  📸 Product Images & Videos                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  📷    │ │  📷    │ │  📷    │ │  🎬    │ │   +    │       │
│  │ img1   │ │ img2   │ │ img3   │ │ video1 │ │  Add   │       │
│  │  [×]   │ │  [×]   │ │  [×]   │ │  [×]   │ │        │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                                │
│  💡 Tips:                                                      │
│  • Upload clear photos of your cargo                          │
│  • Include packaging details                                   │
│  • Videos help carriers understand handling requirements       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Market Request System ("I Need Goods From X")

**Request-Based Flow with Internal Fulfillment**

This system allows individual users to submit requests like "I need these goods from this location". The platform treats this as a **Market Request** and the internal team manages fulfillment.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Submits   │────▶│ Request Logged  │────▶│ Assigned to     │
│ Market Request  │     │ (MR-2026-XXXXX) │     │ Internal Team   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                        ┌───────────────────────────────┤
                        │                               │
                        ▼                               ▼
                ┌───────────────┐              ┌───────────────┐
                │ Search Loads  │              │ Contact       │
                │ & Carriers    │              │ Suppliers     │
                └───────────────┘              └───────────────┘
                        │                               │
                        └───────────────┬───────────────┘
                                        ▼
                                ┌───────────────┐
                                │ Match Found   │
                                │ (Negotiate)   │
                                └───────────────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │ User Notified │
                                │ (Accept/Reject)│
                                └───────────────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │ Booking &     │
                                │ Fulfillment   │
                                └───────────────┘
```

**Market Request Form:**
```
Request Details:
- Title (e.g., "Need 500 bags of cement from Karachi")
- Description of Goods Needed
- Goods Type/Category
- Quantity & Unit
- Quality Requirements

Pickup Location (with PIN):
- City/Country
- Full Address
- PIN on Map (interactive)
- Contact Person & Phone

Delivery Location (with PIN):
- City/Country
- Full Address
- PIN on Map (interactive)
- Contact Person & Phone

Container Preference:
- Container Type (20ft, 40ft, 40ft HC, Flatbed, etc.)
- Special Requirements

Timeline:
- Required By Date
- Flexibility on Date (+/- days)

Budget:
- Budget Range (Min-Max)
- Currency (PKR/USD)

Media Attachments:
- Product Images (up to 10)
- Product Videos (up to 3)
- Reference Documents

Additional:
- Special Instructions
- Preferred Carrier Rating (min)
```

**Internal Fulfillment Workflow:**

| Status | Description | Internal Action |
|--------|-------------|-----------------|
| `pending` | New request received | Assign to team member |
| `searching` | Team searching for matches | Search loads, contact carriers |
| `found` | Potential match identified | Verify availability & pricing |
| `negotiating` | Negotiating with carrier/supplier | Get best price |
| `fulfilled` | Match confirmed, booking created | Notify user |
| `cancelled` | No match found or user cancelled | Close request |

**Fulfillment Log Entry:**
```json
{
  "requestId": "MR-2026-00001",
  "actionType": "contact_carrier",
  "actionBy": "admin@pakload.com",
  "carrierContacted": "XYZ Logistics",
  "quotedPrice": 125000,
  "notes": "Carrier available, negotiating 5% discount",
  "outcome": "pending"
}
```

### 4.3 Reverse Load Posting (Public Goods Request)

**"I need these goods transported from X to Y"**

This is for shippers who want to publicly post their requirement for carriers to bid on.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Shipper Posts   │────▶│ Request Visible │────▶│ Carriers See    │
│ Goods Request   │     │  to Carriers    │     │ Matching Routes │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Shipper Reviews │◀────│  Response Queue │◀────│ Carrier Responds│
│  & Negotiates   │     │                 │     │ with Quote      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 5. Bidding & Booking Workflow

### 5.1 Carrier Bidding Process

```
Carrier Views Load → Checks Requirements → Submits Bid
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   Bid Details   │
                                    ├─────────────────┤
                                    │ - Quoted Price  │
                                    │ - Vehicle Type  │
                                    │ - Pickup Date   │
                                    │ - Delivery Est. │
                                    │ - Message       │
                                    │ - Valid Until   │
                                    └─────────────────┘
```

**Bid Ranking Factors:**
1. Price (40%)
2. Carrier Rating (25%)
3. Completed Loads (15%)
4. Response Time (10%)
5. Vehicle Match (10%)

### 5.2 Booking Confirmation

When shipper accepts a bid:

1. **Booking Created** - Unique booking ID generated
2. **Both Parties Notified** - Email + SMS + Push
3. **Contract Generated** - Digital agreement
4. **Payment Terms Set** - Advance payment if required
5. **Pickup Scheduled** - Driver assigned (if carrier company)

---

## 6. Shipment Execution & Tracking

### 6.1 Shipment Lifecycle

```
BOOKED → PICKUP_SCHEDULED → PICKED_UP → IN_TRANSIT → AT_CHECKPOINT → DELIVERED → COMPLETED
   │            │               │            │              │             │           │
   │            │               │            │              │             │           │
   ▼            ▼               ▼            ▼              ▼             ▼           ▼
Receipt    Driver         Pickup        Location      Customs/       Delivery    Payment
Generated  Assigned       Receipt       Updates       Border         Receipt     Released
                          + Photos      (GPS)         Clearance      + Photos
```

### 6.2 Builty System (Pakistani Transport Receipt)

**Builty** is the traditional Pakistani transport receipt/consignment note. PakLoad generates computer-generated Builty receipts with the following key features:

**Key Principle: Platform Fee is HIDDEN from users - only the final total amount is shown.**

```
┌────────────────────────────────────────────────────────────────┐
│                         بلٹی                                   │
│                    PAKLOAD BUILTY                              │
│              Transport Consignment Note                        │
│────────────────────────────────────────────────────────────────│
│ Builty No: BLT-2026-00001234          Date: 27-Jan-2026       │
│ Booking ID: BK-2026-00005678                                   │
│────────────────────────────────────────────────────────────────│
│ CONSIGNOR (Sender)                                             │
│ Name: ABC Trading Company                                      │
│ Address: 123 Industrial Area, SITE, Karachi                    │
│ Phone: +92-300-1234567                                         │
│ NTN: 1234567-8                                                 │
│────────────────────────────────────────────────────────────────│
│ CONSIGNEE (Receiver)                                           │
│ Name: DEF Distributors                                         │
│ Address: 456 Blue Area, Islamabad                              │
│ Phone: +92-300-9876543                                         │
│────────────────────────────────────────────────────────────────│
│ CARRIER                                                        │
│ Company: XYZ Logistics (NTN: 8765432-1)                        │
│ Vehicle No: LHR-1234                                           │
│ Vehicle Type: 40ft Container                                   │
│ Driver: Muhammad Ali                                           │
│ License: 35201-XXXXXXX-X                                       │
│────────────────────────────────────────────────────────────────│
│ ROUTE                                                          │
│ From: Karachi, Sindh                    📍 24.8607, 67.0011    │
│ To: Islamabad, Federal                  📍 33.6844, 73.0479    │
│ Distance: 1,211 km                                             │
│────────────────────────────────────────────────────────────────│
│ CARGO DETAILS                                                  │
│ Description: Electronics - Consumer Goods                      │
│ No. of Packages: 250 cartons                                   │
│ Packaging: Cardboard boxes, palletized                         │
│ Declared Weight: 15,000 kg                                     │
│ Declared Value: PKR 2,500,000                                  │
│ Condition: GOOD                                                │
│────────────────────────────────────────────────────────────────│
│ CHARGES                                                        │
│                                                                │
│ Freight Charges                              PKR 120,000.00    │
│ Loading Charges                              PKR   2,500.00    │
│ Unloading Charges                            PKR   2,500.00    │
│                                              ──────────────    │
│ TOTAL AMOUNT                                 PKR 125,000.00    │
│                                                                │
│ (Platform fee included - not shown separately)                 │
│────────────────────────────────────────────────────────────────│
│ PAYMENT                                                        │
│ Mode: TO PAY                                                   │
│ Advance Paid: PKR 0.00                                         │
│ Balance Due: PKR 125,000.00                                    │
│────────────────────────────────────────────────────────────────│
│ DATES                                                          │
│ Booking Date: 27-Jan-2026                                      │
│ Dispatch Date: 27-Jan-2026 10:30 AM                            │
│ Expected Delivery: 29-Jan-2026                                 │
│────────────────────────────────────────────────────────────────│
│ SIGNATURES                                                     │
│                                                                │
│ Consignor: ____________    Driver: ____________                │
│                                                                │
│────────────────────────────────────────────────────────────────│
│ TERMS & CONDITIONS                                             │
│ 1. Goods accepted subject to standard terms                    │
│ 2. Carrier not liable for concealed damage                     │
│ 3. Claims must be filed within 24 hours of delivery            │
│ 4. Consignor responsible for proper packaging                  │
│────────────────────────────────────────────────────────────────│
│ [QR CODE]                     Verified by PakLoad Platform     │
│ Scan to verify                support@pakload.com              │
└────────────────────────────────────────────────────────────────┘
```

**Admin-Configurable Platform Fee:**

The platform fee is configured by admin and automatically calculated but NEVER shown to users:

| Setting | Default | Description |
|---------|---------|-------------|
| `platform_fee_percent` | 5% | Percentage of freight charges |
| `min_platform_fee` | PKR 500 | Minimum fee per transaction |
| `max_platform_fee` | PKR 50,000 | Maximum fee cap |

**Example Calculation (Hidden from User):**
```
Freight Charges:     PKR 120,000
Platform Fee (5%):   PKR   6,000  ← HIDDEN
Loading:             PKR   2,500
Unloading:           PKR   2,500
─────────────────────────────────
Total Shown:         PKR 125,000  ← User sees this
Actual Revenue:      PKR 131,000  ← Platform receives this
```

### 6.3 Receipt Generation (Computer Generated)

**Pickup Receipt:**
```
┌────────────────────────────────────────────────────────┐
│                    PAKLOAD                             │
│              PICKUP RECEIPT                            │
│────────────────────────────────────────────────────────│
│ Receipt No: PL-PU-2026-00001234                        │
│ Date/Time: 27-Jan-2026 10:30 AM                        │
│────────────────────────────────────────────────────────│
│ BOOKING DETAILS                                        │
│ Booking ID: BK-2026-00005678                           │
│ Tracking No: LP-2026-00009012                          │
│────────────────────────────────────────────────────────│
│ SHIPPER                                                │
│ Name: ABC Trading Company                              │
│ Address: 123 Industrial Area, Karachi                  │
│ Contact: +92-300-1234567                               │
│────────────────────────────────────────────────────────│
│ CARRIER                                                │
│ Name: XYZ Logistics                                    │
│ Vehicle: LHR-1234 (40ft Container)                     │
│ Driver: Muhammad Ali (CNIC: 35201-XXXXXXX-X)           │
│────────────────────────────────────────────────────────│
│ CARGO DETAILS                                          │
│ Description: Electronics - Consumer Goods              │
│ Weight: 15,000 kg                                      │
│ Volume: 45 CBM                                         │
│ Packages: 250 cartons                                  │
│ Condition at Pickup: GOOD                              │
│────────────────────────────────────────────────────────│
│ ROUTE                                                  │
│ From: Karachi, Pakistan                                │
│ To: Islamabad, Pakistan                                │
│ Est. Delivery: 29-Jan-2026                             │
│────────────────────────────────────────────────────────│
│ SIGNATURES                                             │
│                                                        │
│ Shipper: ____________    Driver: ____________          │
│                                                        │
│────────────────────────────────────────────────────────│
│ [QR CODE]                                              │
│ Scan to verify receipt authenticity                    │
│────────────────────────────────────────────────────────│
│ This is a computer-generated receipt.                  │
│ For disputes, contact: support@pakload.com             │
└────────────────────────────────────────────────────────┘
```

**Delivery Receipt:**
```
┌────────────────────────────────────────────────────────┐
│                    PAKLOAD                             │
│              DELIVERY RECEIPT                          │
│────────────────────────────────────────────────────────│
│ Receipt No: PL-DL-2026-00001234                        │
│ Date/Time: 29-Jan-2026 02:45 PM                        │
│────────────────────────────────────────────────────────│
│ BOOKING DETAILS                                        │
│ Booking ID: BK-2026-00005678                           │
│ Tracking No: LP-2026-00009012                          │
│ Pickup Receipt: PL-PU-2026-00001234                    │
│────────────────────────────────────────────────────────│
│ RECEIVER                                               │
│ Name: DEF Distributors                                 │
│ Address: 456 Blue Area, Islamabad                      │
│ Received By: Ahmad Khan                                │
│ Contact: +92-300-9876543                               │
│────────────────────────────────────────────────────────│
│ CARGO CONDITION AT DELIVERY                            │
│ ☑ Good - No damage                                     │
│ ☐ Minor damage (documented)                            │
│ ☐ Major damage (documented)                            │
│ ☐ Partial delivery                                     │
│                                                        │
│ Packages Received: 250 / 250                           │
│ Weight Verified: 15,000 kg                             │
│────────────────────────────────────────────────────────│
│ DELIVERY PHOTOS ATTACHED: 4                            │
│────────────────────────────────────────────────────────│
│ SIGNATURES                                             │
│                                                        │
│ Receiver: ____________    Driver: ____________         │
│                                                        │
│────────────────────────────────────────────────────────│
│ [QR CODE]                                              │
│ Scan to verify receipt authenticity                    │
│────────────────────────────────────────────────────────│
│ PAYMENT STATUS: PENDING                                │
│ Amount Due: PKR 125,000                                │
│ Payment Terms: 100% on delivery                        │
└────────────────────────────────────────────────────────┘
```

---

## 7. Compliance & Legal Framework

### 7.1 Prohibited Items Policy

**Category A - Absolutely Prohibited (Criminal Offense)**
- Narcotics and controlled substances
- Weapons and ammunition
- Explosives and fireworks
- Counterfeit goods
- Human trafficking related items
- Stolen property

**Category B - Restricted (Requires Special Permit)**
- Hazardous chemicals
- Radioactive materials
- Pharmaceutical products
- Alcohol (where legal)
- Tobacco products
- Currency and precious metals

**Category C - Conditional (Documentation Required)**
- Perishable goods (cold chain certificate)
- Live animals (veterinary certificate)
- Plants (phytosanitary certificate)
- Antiques (export permit)

### 7.2 Shipper Declarations & Responsibilities

**Mandatory Declaration at Load Posting:**
```
☐ I declare that the cargo does not contain any prohibited items
☐ I confirm all cargo contents are accurately described
☐ I have all necessary permits and documentation
☐ I accept full responsibility for cargo contents
☐ I understand that false declaration is a criminal offense
☐ I agree to indemnify PakLoad against any claims arising from cargo contents
```

**Shipper Responsibilities:**
1. Accurate cargo description
2. Proper packaging
3. All required documentation
4. Customs duties and taxes
5. Insurance (if not covered by carrier)
6. Notification of hazardous materials

### 7.3 Carrier Responsibilities

**Mandatory Acknowledgment:**
```
☐ I will verify cargo against documentation before pickup
☐ I will not transport visibly suspicious items
☐ I will report any discrepancies immediately
☐ I will maintain cargo security throughout transit
☐ I will comply with all traffic and transport regulations
☐ I will cooperate with customs and law enforcement
```

### 7.4 Customs & Police Detention Handling

**Incident Reporting Workflow:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Driver Reports  │────▶│ Incident Logged │────▶│ All Parties     │
│   Detention     │     │  in System      │     │   Notified      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                        ┌───────────────────────────────┤
                        │                               │
                        ▼                               ▼
                ┌───────────────┐              ┌───────────────┐
                │   Shipper     │              │   PakLoad     │
                │  Responsible  │              │   Support     │
                │  (if cargo)   │              │  (Mediation)  │
                └───────────────┘              └───────────────┘
```

**Incident Record Fields:**
- Incident Type (detention, inspection, seizure, fine)
- Location (GPS + address)
- Authority (Customs, Police, Highway Patrol)
- Officer Details (name, badge number)
- Reason for detention
- Documents requested/seized
- Detention start/end time
- Resolution status
- Fine amount (if any)
- Photos of incident

**Responsibility Matrix for Detention:**

| Cause | Shipper | Carrier | PakLoad |
|-------|---------|---------|---------|
| Prohibited items in cargo | 100% | 0% | 0% |
| Incorrect documentation | 100% | 0% | 0% |
| Vehicle violation | 0% | 100% | 0% |
| Driver license issue | 0% | 100% | 0% |
| Random inspection (no issue found) | 50% | 50% | 0% |
| Platform data error | 0% | 0% | 100% |

### 7.5 Hidden Documents Policy

**Definition:** Documents concealed within cargo without declaration.

**Platform Policy:**
1. All documents in cargo must be declared
2. Undeclared documents discovered = immediate load cancellation
3. Shipper bears full legal responsibility
4. Carrier must report immediately
5. PakLoad cooperates fully with authorities

**Declaration Requirement:**
```
☐ This shipment contains documents: YES / NO

If YES:
- Document type: ____________
- Quantity: ____________
- Purpose: ____________
- Recipient: ____________
```

---

## 8. Route Management

### 8.1 Pakistan Domestic Routes

**Major Route Categories:**

**A. Motorway Routes (M-Series)**
- M-1: Peshawar - Islamabad (155 km)
- M-2: Islamabad - Lahore (375 km)
- M-3: Lahore - Abdul Hakeem (230 km)
- M-4: Faisalabad - Multan (242 km)
- M-5: Multan - Sukkur (392 km)
- M-9: Karachi - Hyderabad (136 km)

**B. National Highway Routes (N-Series)**
- N-5: Karachi - Peshawar (1,819 km) - Main artery
- N-25: Karachi - Quetta (697 km)
- N-35: Islamabad - Khunjerab (887 km) - CPEC route
- N-55: Peshawar - Karachi (Indus Highway)

**C. Provincial Routes**
- Punjab internal routes
- Sindh internal routes
- KPK internal routes
- Balochistan internal routes

**Route Data Structure:**
```json
{
  "routeCode": "PKR-001",
  "from": {
    "city": "Karachi",
    "province": "Sindh",
    "coordinates": [24.8607, 67.0011]
  },
  "to": {
    "city": "Lahore",
    "province": "Punjab",
    "coordinates": [31.5204, 74.3587]
  },
  "distance": 1211,
  "estimatedHours": 18,
  "routeType": "motorway",
  "tollPlazas": 12,
  "majorCities": ["Hyderabad", "Sukkur", "Multan", "Sahiwal"],
  "restrictions": "No oversize vehicles after 10 PM",
  "avgFreightRate": 45000
}
```

### 8.2 International TIR Routes

**TIR Convention Countries (60+):**

**Europe (42 countries):**
Albania, Austria, Belarus, Belgium, Bosnia, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Moldova, Montenegro, Netherlands, North Macedonia, Norway, Poland, Portugal, Romania, Russia, Serbia, Slovakia, Slovenia, Spain, Sweden, Switzerland, Turkey, Ukraine, United Kingdom

**Asia (12 countries):**
Afghanistan, Azerbaijan, China, Georgia, Iran, Kazakhstan, Kyrgyzstan, Mongolia, Pakistan, Tajikistan, Turkmenistan, Uzbekistan

**Middle East (6 countries):**
Iraq, Israel, Jordan, Lebanon, Syria, UAE

**Africa (2 countries):**
Morocco, Tunisia

**Key International Routes from Pakistan:**

**1. Pakistan - China (CPEC)**
```
Route: Karachi → Islamabad → Khunjerab Pass → Kashgar
Distance: ~1,300 km (Pakistan side)
Border: Khunjerab Pass (4,693m elevation)
Documents: TIR Carnet, Customs Declaration, Phytosanitary (if applicable)
Transit Time: 5-7 days
```

**2. Pakistan - Iran - Turkey - Europe**
```
Route: Karachi → Quetta → Taftan → Iran → Turkey → Europe
Distance: ~6,000 km to Istanbul
Borders: Taftan (Pak-Iran), Bazargan (Iran-Turkey)
Documents: TIR Carnet, Transit Visa, CMR
Transit Time: 12-18 days
```

**3. Pakistan - Afghanistan - Central Asia**
```
Route: Peshawar → Torkham → Kabul → Uzbekistan
Distance: ~1,500 km to Tashkent
Borders: Torkham (Pak-Afghan), Hairatan (Afghan-Uzbek)
Documents: TIR Carnet, Transit Permits
Transit Time: 7-10 days
```

### 8.3 Map Integration Features

**Pickup/Delivery Location Selection:**
```
1. Search by address
2. Search by city/area
3. Pin drop on map
4. Current location (GPS)
5. Saved locations
```

**Route Visualization:**
```
- Show route on map
- Display waypoints
- Show border crossings
- Estimated time per segment
- Toll plaza locations
- Rest stops
- Fuel stations
```

**Live Tracking:**
```
- Real-time GPS location
- ETA updates
- Route deviation alerts
- Geofence notifications (pickup/delivery zones)
```

---

## 9. Payment & Transaction System

### 9.1 Payment Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Booking Created │────▶│ Advance Payment │────▶│ Pickup Confirmed│
│                 │     │ (if required)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Payment Released│◀────│ Delivery        │◀────│ In Transit      │
│ to Carrier      │     │ Confirmed       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 9.2 Payment Terms Options

| Term | Advance | On Delivery | After Delivery |
|------|---------|-------------|----------------|
| Standard | 0% | 100% | 0% |
| Advance Required | 30% | 70% | 0% |
| Credit (Verified) | 0% | 0% | 100% (7 days) |
| Escrow | 100% (held) | Released | N/A |

### 9.3 Platform Fees

| Transaction Type | Platform Fee |
|------------------|--------------|
| Domestic Load | 5% |
| International Load | 7% |
| Goods Request Match | 5% |
| Premium Listing | PKR 500/load |
| Featured Carrier | PKR 2,000/month |

### 9.4 Transaction Records

**Computer-Generated Invoice:**
```
┌────────────────────────────────────────────────────────┐
│                    PAKLOAD                             │
│                   INVOICE                              │
│────────────────────────────────────────────────────────│
│ Invoice No: INV-2026-00001234                          │
│ Date: 29-Jan-2026                                      │
│ Booking ID: BK-2026-00005678                           │
│────────────────────────────────────────────────────────│
│ BILLED TO:                                             │
│ ABC Trading Company                                    │
│ NTN: 1234567-8                                         │
│ 123 Industrial Area, Karachi                           │
│────────────────────────────────────────────────────────│
│ SERVICE PROVIDER:                                      │
│ XYZ Logistics                                          │
│ NTN: 8765432-1                                         │
│────────────────────────────────────────────────────────│
│ DESCRIPTION                          AMOUNT (PKR)      │
│────────────────────────────────────────────────────────│
│ Freight Charges                                        │
│ Karachi → Islamabad                                    │
│ 15,000 kg × PKR 8/kg                    120,000.00     │
│                                                        │
│ Platform Service Fee (5%)                 6,000.00     │
│                                         ──────────     │
│ SUBTOTAL                                126,000.00     │
│ GST (16%)                                20,160.00     │
│                                         ══════════     │
│ TOTAL                                   146,160.00     │
│────────────────────────────────────────────────────────│
│ PAYMENT STATUS: PAID                                   │
│ Payment Date: 29-Jan-2026                              │
│ Payment Method: Bank Transfer                          │
│ Transaction ID: TXN-2026-00009876                      │
│────────────────────────────────────────────────────────│
│ This is a computer-generated invoice.                  │
│ No signature required.                                 │
└────────────────────────────────────────────────────────┘
```

---

## 10. Admin Dashboard & Operations

### 10.1 Admin Capabilities

**User Management:**
- View all users by role
- Verify/reject documents
- Suspend/activate accounts
- Reset passwords
- View user activity logs

**Document Verification Queue:**
- Pending documents list
- Document preview
- Approve/Reject with reason
- Request additional documents
- Bulk actions

**Load & Booking Management:**
- View all loads
- View all bookings
- Resolve disputes
- Cancel bookings (with reason)
- Adjust pricing (exceptional cases)

**Route Management:**
- Add/edit domestic routes
- Add/edit international routes
- Set route pricing
- Enable/disable routes
- Update border crossing info

**Compliance:**
- View incident reports
- Generate compliance reports
- Update prohibited items list
- Manage legal terms
- Audit trail access

**Analytics:**
- Platform statistics
- Revenue reports
- User growth metrics
- Route popularity
- Carrier performance

### 10.2 Verification SLA

| Document Type | Target SLA | Priority |
|---------------|------------|----------|
| CNIC | 24 hours | High |
| Company Registration | 48 hours | High |
| HTV License | 24 hours | High |
| Vehicle Documents | 48 hours | Medium |
| TIR Documents | 72 hours | Medium |

---

## 11. Mobile App Features

### 11.1 Shipper App

**Home Screen:**
- Post new load (quick action)
- Active shipments
- Recent activity
- Notifications

**Load Management:**
- Create load
- View my loads
- View bids
- Accept/reject bids
- Track shipments

**Goods Requests:**
- Post request
- View responses
- Negotiate

**Payments:**
- Payment history
- Pending payments
- Make payment

**Profile:**
- Company details
- Documents
- Settings

### 11.2 Carrier App

**Home Screen:**
- Available loads (filtered)
- My bids
- Active shipments
- Earnings summary

**Load Board:**
- Browse loads
- Filter by route/type/price
- Place bid
- Quick bid

**Fleet Management:**
- My vehicles
- Add vehicle
- Vehicle documents
- Assign drivers

**Shipment Execution:**
- View assigned loads
- Update status
- Generate receipts
- Upload photos
- Collect signatures

**Earnings:**
- Earnings history
- Pending payments
- Withdraw funds

### 11.3 Driver App (Simplified)

**Home Screen:**
- Assigned shipment
- Navigation
- Status update buttons

**Shipment Actions:**
- Start pickup
- Confirm pickup (photos + signature)
- Update location
- Report incident
- Complete delivery (photos + signature)

**Documents:**
- View my documents
- Document expiry alerts

---

## 12. API Endpoints Summary

### 12.1 Enhanced Loads API (`/api/v2/loads`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create load with container type, PIN locations, media |
| GET | `/` | Get all loads with enhanced filters |
| GET | `/:id` | Get load details with media |
| GET | `/my/loads` | Get shipper's loads |
| PUT | `/:id` | Update load |
| POST | `/:id/post` | Post load (make visible) |
| POST | `/:id/cancel` | Cancel load |
| POST | `/:id/media` | Add media to load |
| GET | `/:id/media` | Get load media |
| DELETE | `/:id/media/:mediaId` | Delete media |
| GET | `/reference/container-types` | Get container types |
| GET | `/admin/all` | Admin: Get all loads with fees |
| GET | `/admin/stats` | Admin: Get statistics |

### 12.2 Market Requests API (`/api/market-requests`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create market request |
| GET | `/my-requests` | Get user's requests |
| GET | `/:id` | Get request details |
| PUT | `/:id` | Update request |
| POST | `/:id/cancel` | Cancel request |
| GET | `/admin/all` | Admin: Get all requests |
| GET | `/admin/pending` | Admin: Get pending requests |
| GET | `/admin/my-assigned` | Admin: Get assigned requests |
| POST | `/admin/:id/assign` | Admin: Assign to team |
| POST | `/admin/:id/log-action` | Admin: Log fulfillment action |
| POST | `/admin/:id/fulfill` | Admin: Mark fulfilled |
| PUT | `/admin/:id/notes` | Admin: Update notes |
| GET | `/admin/:id/history` | Admin: Get history |
| GET | `/admin/stats` | Admin: Get statistics |

### 12.3 Builty API (`/api/builty`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create builty receipt |
| GET | `/my-builties` | Get shipper's builties |
| GET | `/carrier-builties` | Get carrier's builties |
| GET | `/:id` | Get builty details |
| GET | `/print/:builtyNumber` | Get builty for printing |
| GET | `/verify/:builtyNumber` | Verify builty (QR scan) |
| POST | `/:id/dispatch` | Mark dispatched |
| POST | `/:id/deliver` | Mark delivered |
| POST | `/:id/sign-consignor` | Add consignor signature |
| GET | `/admin/all` | Admin: Get all builties |
| GET | `/admin/stats` | Admin: Get statistics |

### 12.4 Admin Settings API (`/api/admin/settings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initialize` | Initialize default configs |
| GET | `/` | Get all configurations |
| GET | `/by-category` | Get configs by category |
| GET | `/public` | Get public configs (no auth) |
| GET | `/value/:key` | Get config value |
| GET | `/:key` | Get config details |
| POST | `/` | Create new config |
| PUT | `/:key` | Update config |
| PUT | `/bulk/update` | Bulk update configs |
| POST | `/:key/publish` | Publish config |
| POST | `/:key/unpublish` | Unpublish config |
| DELETE | `/:key` | Delete config |
| GET | `/category/fees` | Get fee settings |
| PUT | `/category/fees` | Update fee settings |
| GET | `/category/taxes` | Get tax settings |
| PUT | `/category/taxes` | Update tax settings |

### 12.5 Admin-Configurable Settings

| Category | Settings |
|----------|----------|
| **Fees** | `platform_fee_percent`, `min_platform_fee`, `max_platform_fee` |
| **Taxes** | `gst_enabled`, `gst_percent`, `gst_registration_number`, `withholding_tax_enabled`, `withholding_tax_percent` |
| **Limits** | `individual_max_active_loads`, `company_max_active_loads`, `max_load_value`, `min_load_value` |
| **Bidding** | `bid_validity_hours`, `max_bids_per_load`, `auto_expire_bids` |
| **Payments** | `advance_payment_percent`, `payment_hold_days`, `escrow_enabled` |
| **Verification** | `auto_approve_documents`, `document_expiry_warning_days`, `require_all_documents` |
| **Notifications** | `email_notifications_enabled`, `sms_notifications_enabled`, `push_notifications_enabled` |
| **Builty** | `builty_terms_version`, `builty_claim_period_hours`, `builty_auto_generate` |
| **Market Requests** | `market_request_expiry_days`, `market_request_auto_assign` |
| **Currency** | `default_currency`, `supported_currencies`, `usd_to_pkr_rate` |
| **TIR** | `tir_enabled`, `tir_premium_percent` |
| **System** | `maintenance_mode`, `maintenance_message` |

---

## 13. Implementation Phases

### Phase 1: Core Platform (Weeks 1-4)
- [ ] User registration (all roles)
- [ ] Document upload & verification
- [ ] Basic load posting
- [ ] Bidding system
- [ ] Booking creation

### Phase 2: Execution & Tracking (Weeks 5-8)
- [ ] Shipment lifecycle management
- [ ] Receipt generation
- [ ] GPS tracking integration
- [ ] Status updates
- [ ] Photo capture

### Phase 3: Compliance & Legal (Weeks 9-10)
- [ ] Prohibited items database
- [ ] Legal declarations
- [ ] Incident reporting
- [ ] Audit logging

### Phase 4: Routes & Maps (Weeks 11-12)
- [ ] Pakistan domestic routes
- [ ] Map integration
- [ ] Route visualization
- [ ] Location picker

### Phase 5: International (Weeks 13-16)
- [ ] TIR countries database
- [ ] International routes
- [ ] TIR vehicle management
- [ ] Border crossing info

### Phase 6: Payments & Analytics (Weeks 17-20)
- [ ] Payment gateway integration
- [ ] Invoice generation
- [ ] Analytics dashboard
- [ ] Reports

---

## 13. API Endpoints Summary

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-otp
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
```

### Users & Profiles
```
GET  /api/v1/users/profile
PUT  /api/v1/users/profile
POST /api/v1/users/company-profile
GET  /api/v1/users/documents
POST /api/v1/users/documents
```

### Loads
```
GET  /api/v1/loads
POST /api/v1/loads
GET  /api/v1/loads/:id
PUT  /api/v1/loads/:id
DELETE /api/v1/loads/:id
GET  /api/v1/loads/:id/bids
```

### Goods Requests
```
GET  /api/v1/goods-requests
POST /api/v1/goods-requests
GET  /api/v1/goods-requests/:id
POST /api/v1/goods-requests/:id/respond
```

### Bids
```
POST /api/v1/bids
GET  /api/v1/bids/my-bids
PUT  /api/v1/bids/:id
POST /api/v1/bids/:id/accept
POST /api/v1/bids/:id/reject
```

### Bookings
```
GET  /api/v1/bookings
GET  /api/v1/bookings/:id
PUT  /api/v1/bookings/:id/status
POST /api/v1/bookings/:id/receipt
GET  /api/v1/bookings/:id/track
```

### Vehicles
```
GET  /api/v1/vehicles
POST /api/v1/vehicles
GET  /api/v1/vehicles/:id
PUT  /api/v1/vehicles/:id
POST /api/v1/vehicles/:id/documents
```

### Routes
```
GET  /api/v1/routes/domestic
GET  /api/v1/routes/international
GET  /api/v1/routes/tir-countries
GET  /api/v1/routes/calculate
```

### Admin
```
GET  /api/admin/users
GET  /api/admin/documents/pending
POST /api/admin/documents/:id/verify
POST /api/admin/documents/:id/reject
GET  /api/admin/incidents
GET  /api/admin/analytics
```

---

## 14. Success Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| Registered Shippers | 5,000 |
| Registered Carriers | 2,000 |
| Monthly Active Loads | 10,000 |
| Booking Completion Rate | 85% |
| Average Rating | 4.2+ |
| Document Verification SLA | 95% within SLA |
| Dispute Resolution | < 5% of bookings |
| Platform Uptime | 99.5% |

---

*Document Version: 1.0*
*Last Updated: January 27, 2026*
*Author: PakLoad Product Team*
