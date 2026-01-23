# PakLoad - Database Schema Design

## 🗄️ Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                                    │
└─────────────────────────────────────────────────────────────────────────┘

users (1) ──────< (M) vehicles
  │                      │
  │                      │
  │                      └──< (M) vehicle_documents
  │
  ├──< (M) loads
  │      │
  │      ├──< (M) bids
  │      │      │
  │      │      └──> (1) bookings
  │      │
  │      └──< (M) saved_searches
  │
  ├──< (M) bookings
  │      │
  │      ├──< (M) tracking_updates
  │      ├──< (M) documents
  │      └──< (M) payments
  │
  ├──< (M) ratings_given
  ├──< (M) ratings_received
  ├──< (M) notifications
  └──< (M) user_sessions
```

## 📋 Detailed Schema

### 1. Users & Authentication

```sql
-- Users table (Core user data)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication
    phone_number VARCHAR(20) UNIQUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255), -- bcrypt hash
    
    -- OAuth
    google_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,
    
    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image_url TEXT,
    
    -- Role & Status
    role VARCHAR(20) NOT NULL CHECK (role IN ('shipper', 'carrier', 'broker', 'admin')),
    account_status VARCHAR(20) DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended', 'banned')),
    
    -- KYC & Verification
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
    kyc_submitted_at TIMESTAMP,
    kyc_verified_at TIMESTAMP,
    kyc_documents JSONB, -- Store document URLs and metadata
    
    -- Business Info (for carriers/brokers)
    company_name VARCHAR(255),
    company_registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- Contact
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Pakistan',
    postal_code VARCHAR(20),
    
    -- Trust Score
    trust_score DECIMAL(3,2) DEFAULT 0.00 CHECK (trust_score >= 0 AND trust_score <= 5.00),
    total_ratings INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete
    
    -- Indexes
    CONSTRAINT users_phone_email_check CHECK (phone_number IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX idx_users_phone ON users(phone_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- User Sessions (for refresh tokens)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_id VARCHAR(255),
    device_type VARCHAR(50), -- 'ios', 'android', 'web'
    device_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token) WHERE revoked = FALSE;
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at) WHERE revoked = FALSE;

-- OTP Verification
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    
    purpose VARCHAR(50) NOT NULL, -- 'registration', 'login', 'reset_password'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    
    CONSTRAINT otp_not_expired CHECK (expires_at > created_at)
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number, verified_at);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);
```

### 2. Vehicles & Fleet Management

```sql
-- Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Vehicle Details
    vehicle_type VARCHAR(50) NOT NULL, -- '20ft_container', '40ft_container', 'flatbed', 'refrigerated', 'tanker'
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    vin VARCHAR(50) UNIQUE,
    
    -- Capacity
    max_weight_kg INTEGER NOT NULL,
    max_length_cm INTEGER,
    max_width_cm INTEGER,
    max_height_cm INTEGER,
    max_volume_cbm DECIMAL(10,2),
    
    -- Features
    has_gps BOOLEAN DEFAULT FALSE,
    has_refrigeration BOOLEAN DEFAULT FALSE,
    has_lift_gate BOOLEAN DEFAULT FALSE,
    
    -- Insurance
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_expiry_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'booked', 'in_transit')),
    
    -- Location
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    current_location_address TEXT,
    last_location_update TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_vehicles_user ON vehicles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_status ON vehicles(availability_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_location ON vehicles USING GIST (
    ll_to_earth(current_location_lat, current_location_lng)
) WHERE deleted_at IS NULL AND availability_status = 'available';

-- Vehicle Documents
CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    document_type VARCHAR(50) NOT NULL, -- 'registration', 'insurance', 'inspection', 'permit'
    document_url TEXT NOT NULL,
    document_number VARCHAR(100),
    
    issue_date DATE,
    expiry_date DATE,
    
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_docs_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_docs_expiry ON vehicle_documents(expiry_date) WHERE expiry_date IS NOT NULL;
```

### 3. Loads & Shipments

```sql
-- Loads
CREATE TABLE loads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Route
    origin_address TEXT NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    origin_state VARCHAR(100),
    origin_lat DECIMAL(10,8) NOT NULL,
    origin_lng DECIMAL(11,8) NOT NULL,
    
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    destination_state VARCHAR(100),
    destination_lat DECIMAL(10,8) NOT NULL,
    destination_lng DECIMAL(11,8) NOT NULL,
    
    distance_km DECIMAL(10,2), -- Calculated
    
    -- Cargo Details
    cargo_type VARCHAR(100) NOT NULL,
    cargo_description TEXT,
    
    weight_kg INTEGER NOT NULL,
    length_cm INTEGER,
    width_cm INTEGER,
    height_cm INTEGER,
    volume_cbm DECIMAL(10,2),
    
    -- Requirements
    required_vehicle_type VARCHAR(50) NOT NULL,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    requires_lift_gate BOOLEAN DEFAULT FALSE,
    is_hazardous BOOLEAN DEFAULT FALSE,
    is_oversized BOOLEAN DEFAULT FALSE,
    is_stackable BOOLEAN DEFAULT TRUE,
    
    special_instructions TEXT,
    
    -- Schedule
    pickup_date DATE NOT NULL,
    pickup_time_start TIME,
    pickup_time_end TIME,
    delivery_date DATE NOT NULL,
    delivery_time_start TIME,
    delivery_time_end TIME,
    
    -- Pricing
    rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('flat', 'per_km', 'negotiable')),
    rate_amount_usd DECIMAL(10,2),
    rate_amount_pkr DECIMAL(12,2),
    insured_value_usd DECIMAL(12,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'bidding', 'booked', 'in_transit', 'delivered', 'cancelled')),
    is_urgent BOOLEAN DEFAULT FALSE,
    
    -- Visibility
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invited_only')),
    
    -- Matching Score (for search ranking)
    match_score DECIMAL(5,2),
    
    -- Metadata
    posted_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_loads_user ON loads(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_status ON loads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_pickup_date ON loads(pickup_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_origin_city ON loads(origin_city) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_dest_city ON loads(destination_city) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_vehicle_type ON loads(required_vehicle_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_urgent ON loads(is_urgent) WHERE is_urgent = TRUE AND deleted_at IS NULL;

-- GiST index for geospatial queries (find loads near a location)
CREATE INDEX idx_loads_origin_location ON loads USING GIST (
    ll_to_earth(origin_lat, origin_lng)
) WHERE deleted_at IS NULL AND status IN ('posted', 'bidding');

CREATE INDEX idx_loads_dest_location ON loads USING GIST (
    ll_to_earth(destination_lat, destination_lng)
) WHERE deleted_at IS NULL AND status IN ('posted', 'bidding');
```

### 4. Bids & Bookings

```sql
-- Bids
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    carrier_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    
    -- Bid Details
    bid_amount_usd DECIMAL(10,2) NOT NULL,
    bid_amount_pkr DECIMAL(12,2) NOT NULL,
    estimated_pickup_date DATE,
    estimated_delivery_date DATE,
    
    message TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    responded_at TIMESTAMP,
    
    UNIQUE(load_id, carrier_id)
);

CREATE INDEX idx_bids_load ON bids(load_id);
CREATE INDEX idx_bids_carrier ON bids(carrier_id);
CREATE INDEX idx_bids_status ON bids(status);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    load_id UUID NOT NULL REFERENCES loads(id),
    shipper_id UUID NOT NULL REFERENCES users(id),
    carrier_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    bid_id UUID REFERENCES bids(id),
    
    -- Tracking
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Agreed Terms
    agreed_amount_usd DECIMAL(10,2) NOT NULL,
    agreed_amount_pkr DECIMAL(12,2) NOT NULL,
    
    actual_pickup_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled', 'disputed')),
    
    -- Progress
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    current_location_address TEXT,
    last_location_update TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT
);

CREATE INDEX idx_bookings_load ON bookings(load_id);
CREATE INDEX idx_bookings_shipper ON bookings(shipper_id);
CREATE INDEX idx_bookings_carrier ON bookings(carrier_id);
CREATE INDEX idx_bookings_tracking ON bookings(tracking_number);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Tracking Updates
CREATE TABLE tracking_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    milestone VARCHAR(50) NOT NULL, -- 'pickup', 'border_crossing', 'customs', 'in_transit', 'delivery'
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address TEXT,
    
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracking_booking ON tracking_updates(booking_id);
CREATE INDEX idx_tracking_created ON tracking_updates(created_at);
```

### 5. Ratings & Reviews

```sql
-- Ratings
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    
    -- Ratings (1-5)
    overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    communication_rating DECIMAL(2,1) CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating DECIMAL(2,1) CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    timeliness_rating DECIMAL(2,1) CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    
    -- Review
    review_text TEXT,
    
    -- Response
    response_text TEXT,
    responded_at TIMESTAMP,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(booking_id, reviewer_id, reviewee_id)
);

CREATE INDEX idx_ratings_reviewee ON ratings(reviewee_id);
CREATE INDEX idx_ratings_booking ON ratings(booking_id);
CREATE INDEX idx_ratings_status ON ratings(moderation_status);
```

### 6. Payments & Transactions

```sql
-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    
    payer_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES users(id),
    
    -- Amount
    amount_usd DECIMAL(10,2) NOT NULL,
    amount_pkr DECIMAL(12,2) NOT NULL,
    
    -- Payment Details
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('booking_deposit', 'full_payment', 'refund', 'commission')),
    payment_method VARCHAR(50), -- 'card', 'bank_transfer', 'wallet', 'cash'
    
    -- External Payment Gateway
    gateway VARCHAR(50), -- 'stripe', 'jazzcash', 'easypaisa'
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_payee ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 7. Notifications

```sql
-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    type VARCHAR(50) NOT NULL, -- 'new_load', 'bid_received', 'booking_confirmed', 'status_update', 'payment_received'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Entity
    related_entity_type VARCHAR(50), -- 'load', 'bid', 'booking', 'payment'
    related_entity_id UUID,
    
    -- Deep Link
    action_url TEXT,
    
    -- Delivery
    is_read BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_sms_sent BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    push_sent_at TIMESTAMP,
    email_sent_at TIMESTAMP,
    sms_sent_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 8. Saved Searches & Alerts

```sql
-- Saved Searches
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    
    -- Search Criteria (stored as JSON)
    criteria JSONB NOT NULL,
    
    -- Alert Settings
    enable_alerts BOOLEAN DEFAULT TRUE,
    alert_frequency VARCHAR(20) DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
    
    last_alerted_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_alerts ON saved_searches(enable_alerts, alert_frequency);
```

### 9. Admin & Moderation

```sql
-- Admin Actions Log
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    
    action_type VARCHAR(50) NOT NULL, -- 'verify_user', 'suspend_user', 'approve_document', 'reject_load'
    target_entity_type VARCHAR(50) NOT NULL,
    target_entity_id UUID NOT NULL,
    
    reason TEXT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_entity_type, target_entity_id);
CREATE INDEX idx_admin_actions_created ON admin_actions(created_at);

-- Reported Content
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    
    reported_entity_type VARCHAR(50) NOT NULL, -- 'user', 'load', 'rating'
    reported_entity_id UUID NOT NULL,
    
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_entity ON reports(reported_entity_type, reported_entity_id);
```

## 🔍 Elasticsearch Schema (for Advanced Search)

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "origin": {
        "properties": {
          "city": { "type": "keyword" },
          "state": { "type": "keyword" },
          "location": { "type": "geo_point" }
        }
      },
      "destination": {
        "properties": {
          "city": { "type": "keyword" },
          "state": { "type": "keyword" },
          "location": { "type": "geo_point" }
        }
      },
      "cargo_type": { "type": "keyword" },
      "weight_kg": { "type": "integer" },
      "required_vehicle_type": { "type": "keyword" },
      "pickup_date": { "type": "date" },
      "delivery_date": { "type": "date" },
      "rate_amount_usd": { "type": "float" },
      "is_urgent": { "type": "boolean" },
      "requires_refrigeration": { "type": "boolean" },
      "is_hazardous": { "type": "boolean" },
      "status": { "type": "keyword" },
      "match_score": { "type": "float" },
      "posted_at": { "type": "date" },
      "distance_km": { "type": "float" }
    }
  }
}
```

## 📊 Database Performance Optimizations

### Partitioning Strategy
```sql
-- Partition bookings by year for better performance
CREATE TABLE bookings_2024 PARTITION OF bookings
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE bookings_2025 PARTITION OF bookings
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Materialized Views for Analytics
```sql
-- Carrier Performance Dashboard
CREATE MATERIALIZED VIEW carrier_performance AS
SELECT 
    u.id as carrier_id,
    u.first_name || ' ' || u.last_name as carrier_name,
    COUNT(DISTINCT b.id) as total_bookings,
    AVG(r.overall_rating) as avg_rating,
    SUM(CASE WHEN b.status = 'delivered' THEN 1 ELSE 0 END) as completed_bookings,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
    AVG(EXTRACT(EPOCH FROM (b.actual_delivery_date - b.actual_pickup_date))/3600) as avg_delivery_time_hours
FROM users u
LEFT JOIN bookings b ON u.id = b.carrier_id
LEFT JOIN ratings r ON u.id = r.reviewee_id
WHERE u.role = 'carrier'
GROUP BY u.id, u.first_name, u.last_name;

CREATE UNIQUE INDEX ON carrier_performance(carrier_id);
```

## 🔐 Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_select_own ON users
FOR SELECT
USING (id = current_setting('app.current_user_id')::UUID OR 
       current_setting('app.current_user_role') = 'admin');

-- Carriers can see loads that match their criteria
CREATE POLICY loads_select_carriers ON loads
FOR SELECT
USING (status IN ('posted', 'bidding') OR 
       user_id = current_setting('app.current_user_id')::UUID);
```
