import { pgTable, serial, varchar, text, integer, decimal, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'shipper', 'carrier', 'driver', 'broker']);
export const userTypeEnum = pgEnum('user_type', ['company', 'individual']); // Company or Individual shipper/carrier
export const documentTypeEnum = pgEnum('document_type', [
  'nic_copy',           // National ID Card
  'driving_license_htv', // HTV Driving License
  'company_registration', // Company/SSC Registration
  'vehicle_registration', // Vehicle Registration
  'insurance_certificate', // Insurance
  'tir_carnet',          // TIR Carnet
  'customs_clearance',   // Customs Clearance Certificate
  'route_permit',        // Route Permit
  'fitness_certificate', // Vehicle Fitness
  'tax_certificate',     // Tax Certificate
  'other'
]);
export const documentStatusEnum = pgEnum('document_status', ['pending', 'verified', 'rejected', 'expired']);
export const goodsRequestStatusEnum = pgEnum('goods_request_status', ['open', 'matched', 'closed', 'expired']);
export const userStatusEnum = pgEnum('user_status', ['active', 'pending', 'suspended', 'deleted']);
export const loadStatusEnum = pgEnum('load_status', ['pending', 'posted', 'in_transit', 'delivered', 'cancelled']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'in_transit', 'completed', 'cancelled']);
export const vehicleStatusEnum = pgEnum('vehicle_status', ['active', 'maintenance', 'inactive']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const publishStatusEnum = pgEnum('publish_status', ['draft', 'published', 'archived']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'publish', 'unpublish', 'login', 'logout']);

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  companyName: varchar('company_name', { length: 255 }),
  role: userRoleEnum('role').notNull().default('shipper'),
  userType: userTypeEnum('user_type').notNull().default('individual'), // company or individual
  status: userStatusEnum('status').notNull().default('pending'),
  verified: boolean('verified').notNull().default(false),
  emailVerified: boolean('email_verified').notNull().default(false),
  phoneVerified: boolean('phone_verified').notNull().default(false),
  documentsVerified: boolean('documents_verified').notNull().default(false),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalLoads: integer('total_loads').default(0),
  completedLoads: integer('completed_loads').default(0),
  maxActiveLoads: integer('max_active_loads').default(5), // Limit for individual shippers
  profilePicture: varchar('profile_picture', { length: 500 }),
  termsAcceptedAt: timestamp('terms_accepted_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Company Profiles Table
export const companyProfiles = pgTable('company_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 100 }),
  ntnNumber: varchar('ntn_number', { length: 50 }), // National Tax Number
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull().default('Pakistan'),
  postalCode: varchar('postal_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  officePicture: varchar('office_picture', { length: 500 }),
  officePhotos: jsonb('office_photos'), // Array of photo URLs
  contactPerson: varchar('contact_person', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Documents Table
export const userDocuments = pgTable('user_documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  documentType: documentTypeEnum('document_type').notNull(),
  documentNumber: varchar('document_number', { length: 100 }),
  documentUrl: varchar('document_url', { length: 500 }).notNull(),
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  issuingAuthority: varchar('issuing_authority', { length: 255 }),
  status: documentStatusEnum('status').notNull().default('pending'),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  metadata: jsonb('metadata'), // Additional document-specific data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Driver Profiles Table (for carrier's drivers)
export const driverProfiles = pgTable('driver_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id), // Driver user account
  carrierId: integer('carrier_id').references(() => users.id), // Parent carrier company
  licenseNumber: varchar('license_number', { length: 50 }).notNull(),
  licenseType: varchar('license_type', { length: 20 }).notNull(), // HTV, LTV, etc.
  licenseExpiry: timestamp('license_expiry').notNull(),
  nicNumber: varchar('nic_number', { length: 20 }).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  bloodGroup: varchar('blood_group', { length: 5 }),
  emergencyContact: varchar('emergency_contact', { length: 20 }),
  emergencyContactName: varchar('emergency_contact_name', { length: 100 }),
  yearsExperience: integer('years_experience').default(0),
  totalTrips: integer('total_trips').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  verified: boolean('verified').notNull().default(false),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goods Requests Table (Shipper looking for specific goods/services - "I need goods from X")
export const goodsRequests = pgTable('goods_requests', {
  id: serial('id').primaryKey(),
  requestNumber: varchar('request_number', { length: 50 }).notNull().unique(), // MR-2026-00001
  shipperId: integer('shipper_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  goodsType: varchar('goods_type', { length: 100 }).notNull(),
  quantity: varchar('quantity', { length: 100 }),
  unit: varchar('unit', { length: 50 }), // kg, tons, pieces, containers
  
  // Origin location with PIN
  originCity: varchar('origin_city', { length: 100 }),
  originCountry: varchar('origin_country', { length: 100 }),
  originAddress: text('origin_address'),
  originLatitude: decimal('origin_latitude', { precision: 10, scale: 7 }),
  originLongitude: decimal('origin_longitude', { precision: 10, scale: 7 }),
  
  // Destination location with PIN
  destinationCity: varchar('destination_city', { length: 100 }),
  destinationCountry: varchar('destination_country', { length: 100 }),
  destinationAddress: text('destination_address'),
  destinationLatitude: decimal('destination_latitude', { precision: 10, scale: 7 }),
  destinationLongitude: decimal('destination_longitude', { precision: 10, scale: 7 }),
  
  // Budget
  budgetMin: decimal('budget_min', { precision: 12, scale: 2 }),
  budgetMax: decimal('budget_max', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 10 }).default('PKR'),
  requiredBy: timestamp('required_by'),
  
  // Container preference
  containerType: varchar('container_type', { length: 50 }), // 20ft, 40ft, 40ft_hc, flatbed, etc.
  
  // Media attachments
  images: jsonb('images'), // Array of image URLs
  videos: jsonb('videos'), // Array of video URLs
  documents: jsonb('documents'), // Array of document URLs
  
  // Internal fulfillment workflow
  status: goodsRequestStatusEnum('status').notNull().default('open'),
  assignedTo: integer('assigned_to').references(() => users.id), // Internal team member
  internalNotes: text('internal_notes'), // Notes visible only to admin/internal team
  fulfillmentStatus: varchar('fulfillment_status', { length: 50 }).default('pending'), // pending, searching, found, negotiating, fulfilled, cancelled
  matchedLoadId: integer('matched_load_id'), // References loads.id (no FK to avoid circular ref)
  matchedCarrierId: integer('matched_carrier_id').references(() => users.id),
  
  responses: integer('responses').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Container Type Enum
export const containerTypeEnum = pgEnum('container_type', [
  '20ft',           // 20-foot standard container
  '40ft',           // 40-foot standard container  
  '40ft_hc',        // 40-foot high cube
  '45ft_hc',        // 45-foot high cube
  'flatbed',        // Flatbed truck
  'lowbed',         // Low bed trailer
  'reefer_20ft',    // 20-foot refrigerated
  'reefer_40ft',    // 40-foot refrigerated
  'tanker',         // Tanker truck
  'open_top',       // Open top container
  'bulk',           // Bulk carrier
  'other'           // Other/custom
]);

// Loads Table
export const loads = pgTable('loads', {
  id: serial('id').primaryKey(),
  shipperId: integer('shipper_id').notNull().references(() => users.id),
  trackingNumber: varchar('tracking_number', { length: 50 }).notNull().unique(),
  
  // Origin with PIN location
  origin: varchar('origin', { length: 255 }).notNull(),
  originAddress: text('origin_address'),
  originCity: varchar('origin_city', { length: 100 }),
  originProvince: varchar('origin_province', { length: 100 }),
  originCountry: varchar('origin_country', { length: 100 }).default('Pakistan'),
  originLatitude: decimal('origin_latitude', { precision: 10, scale: 7 }),
  originLongitude: decimal('origin_longitude', { precision: 10, scale: 7 }),
  pickupContactName: varchar('pickup_contact_name', { length: 255 }),
  pickupContactPhone: varchar('pickup_contact_phone', { length: 20 }),
  
  // Destination with PIN location
  destination: varchar('destination', { length: 255 }).notNull(),
  destinationAddress: text('destination_address'),
  destinationCity: varchar('destination_city', { length: 100 }),
  destinationProvince: varchar('destination_province', { length: 100 }),
  destinationCountry: varchar('destination_country', { length: 100 }).default('Pakistan'),
  destinationLatitude: decimal('destination_latitude', { precision: 10, scale: 7 }),
  destinationLongitude: decimal('destination_longitude', { precision: 10, scale: 7 }),
  deliveryContactName: varchar('delivery_contact_name', { length: 255 }),
  deliveryContactPhone: varchar('delivery_contact_phone', { length: 20 }),
  
  // Dates
  pickupDate: timestamp('pickup_date').notNull(),
  deliveryDate: timestamp('delivery_date').notNull(),
  pickupTimeWindow: varchar('pickup_time_window', { length: 50 }), // e.g., "9AM-12PM"
  deliveryTimeWindow: varchar('delivery_time_window', { length: 50 }),
  
  // Cargo details
  cargoType: varchar('cargo_type', { length: 100 }).notNull(),
  cargoWeight: decimal('cargo_weight', { precision: 10, scale: 2 }).notNull(),
  cargoVolume: decimal('cargo_volume', { precision: 10, scale: 2 }),
  numberOfPackages: integer('number_of_packages'),
  packagingType: varchar('packaging_type', { length: 100 }),
  description: text('description'),
  
  // Container type selection
  containerType: containerTypeEnum('container_type'),
  containerCount: integer('container_count').default(1),
  
  // Media attachments
  images: jsonb('images'), // Array of product image URLs
  videos: jsonb('videos'), // Array of product video URLs
  documents: jsonb('documents'), // Array of document URLs (invoices, packing lists, etc.)
  
  // Pricing (platform fee hidden from users)
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Base price shown to user
  platformFeePercent: decimal('platform_fee_percent', { precision: 5, scale: 2 }), // Admin configurable
  platformFeeAmount: decimal('platform_fee_amount', { precision: 10, scale: 2 }), // Calculated fee (hidden)
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }), // Final amount shown to user
  
  status: loadStatusEnum('status').notNull().default('pending'),
  distance: integer('distance'),
  estimatedDays: varchar('estimated_days', { length: 20 }),
  specialRequirements: text('special_requirements'),
  
  // Admin approval workflow
  approvalStatus: varchar('approval_status', { length: 20 }).default('pending'), // pending, approved, rejected
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  
  // Source tracking (from goods request or direct post)
  sourceRequestId: integer('source_request_id'), // References goodsRequests.id (no FK to avoid circular ref)
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vehicles Table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  carrierId: integer('carrier_id').notNull().references(() => users.id),
  type: varchar('type', { length: 100 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 50 }).notNull().unique(),
  capacity: decimal('capacity', { precision: 10, scale: 2 }).notNull(),
  currentLocation: varchar('current_location', { length: 255 }),
  status: vehicleStatusEnum('status').notNull().default('active'),
  lastMaintenance: timestamp('last_maintenance'),
  nextMaintenance: timestamp('next_maintenance'),
  fuelType: varchar('fuel_type', { length: 50 }),
  yearManufactured: integer('year_manufactured'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  loadId: integer('load_id').notNull().references(() => loads.id),
  carrierId: integer('carrier_id').notNull().references(() => users.id),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  status: bookingStatusEnum('status').notNull().default('pending'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  pickupDate: timestamp('pickup_date').notNull(),
  deliveryDate: timestamp('delivery_date').notNull(),
  actualPickupDate: timestamp('actual_pickup_date'),
  actualDeliveryDate: timestamp('actual_delivery_date'),
  progress: integer('progress').default(0),
  currentLocation: varchar('current_location', { length: 255 }),
  notes: text('notes'),
  
  // Admin approval workflow for bids
  approvalStatus: varchar('approval_status', { length: 20 }).default('pending'), // pending, approved, rejected
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quotes Table
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  loadId: integer('load_id').notNull().references(() => loads.id),
  carrierId: integer('carrier_id').notNull().references(() => users.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  estimatedDays: varchar('estimated_days', { length: 20 }),
  message: text('message'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Routes Table
export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  from: varchar('from', { length: 255 }).notNull(),
  to: varchar('to', { length: 255 }).notNull(),
  distance: integer('distance').notNull(),
  estimatedDays: varchar('estimated_days', { length: 20 }),
  borderCrossing: varchar('border_crossing', { length: 255 }),
  routePopularity: varchar('route_popularity', { length: 50 }),
  activeTrucks: integer('active_trucks').default(0),
  activeLoads: integer('active_loads').default(0),
  avgPrice: decimal('avg_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments Table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  payerId: integer('payer_id').notNull().references(() => users.id),
  payeeId: integer('payee_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payment Proofs Table (for admin verification)
export const paymentProofs = pgTable('payment_proofs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  transactionRef: varchar('transaction_ref', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }),
  status: varchar('status', { length: 50 }).default('pending'), // pending, verified, rejected
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reviews Table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  revieweeId: integer('reviewee_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cargo Categories Table
export const cargoCategories = pgTable('cargo_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  baseRate: decimal('base_rate', { precision: 10, scale: 2 }),
  status: publishStatusEnum('status').notNull().default('draft'),
  displayOrder: integer('display_order').default(0),
  metadata: jsonb('metadata'),
  createdBy: integer('created_by').references(() => users.id),
  updatedBy: integer('updated_by').references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Pricing Rules Table
export const pricingRules = pgTable('pricing_rules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // 'distance', 'weight', 'category', 'route', 'surge'
  categoryId: integer('category_id').references(() => cargoCategories.id),
  routeId: integer('route_id').references(() => routes.id),
  minValue: decimal('min_value', { precision: 10, scale: 2 }),
  maxValue: decimal('max_value', { precision: 10, scale: 2 }),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }),
  fixedPrice: decimal('fixed_price', { precision: 10, scale: 2 }),
  multiplier: decimal('multiplier', { precision: 5, scale: 2 }),
  priority: integer('priority').default(0),
  status: publishStatusEnum('status').notNull().default('draft'),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  conditions: jsonb('conditions'),
  createdBy: integer('created_by').references(() => users.id),
  updatedBy: integer('updated_by').references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Route Pricing Table
export const routePricing = pgTable('route_pricing', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').notNull().references(() => routes.id),
  categoryId: integer('category_id').references(() => cargoCategories.id),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal('price_per_kg', { precision: 10, scale: 2 }),
  pricePerKm: decimal('price_per_km', { precision: 10, scale: 2 }),
  surgeMultiplier: decimal('surge_multiplier', { precision: 5, scale: 2 }).default('1.00'),
  status: publishStatusEnum('status').notNull().default('draft'),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  createdBy: integer('created_by').references(() => users.id),
  updatedBy: integer('updated_by').references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Platform Configuration Table
export const platformConfig = pgTable('platform_config', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'),
  dataType: varchar('data_type', { length: 20 }).default('string'), // 'string', 'number', 'boolean', 'json'
  isPublic: boolean('is_public').default(false),
  status: publishStatusEnum('status').notNull().default('draft'),
  updatedBy: integer('updated_by').references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audit Logs Table (Enhanced)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: auditActionEnum('action').notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: integer('entity_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  changes: jsonb('changes'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  sessionId: varchar('session_id', { length: 255 }),
  severity: varchar('severity', { length: 20 }).default('info'), // 'info', 'warning', 'critical'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Activity Logs Table (Keep for backward compatibility)
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: integer('entity_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notification Type Enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'bid_received',      // Shipper: New bid on your load
  'bid_accepted',      // Carrier: Your bid was accepted
  'bid_rejected',      // Carrier: Your bid was rejected
  'bid_expired',       // Carrier: Your bid expired
  'load_posted',       // Carrier: New load matching your preferences
  'load_assigned',     // Carrier: Load assigned to you
  'load_cancelled',    // Both: Load was cancelled
  'shipment_pickup',   // Both: Shipment picked up
  'shipment_delivered',// Both: Shipment delivered
  'shipment_delayed',  // Both: Shipment delayed
  'payment_received',  // Carrier: Payment received
  'payment_due',       // Shipper: Payment due reminder
  'document_required', // Both: Document upload required
  'message_received',  // Both: New message
  'rating_received',   // Both: New rating/review
  'account_alert',     // Both: Account-related alerts
  'system',            // Both: System announcements
]);

// Notification Priority Enum
export const notificationPriorityEnum = pgEnum('notification_priority', ['low', 'normal', 'high', 'urgent']);

// Notifications Table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: notificationTypeEnum('type').notNull(),
  priority: notificationPriorityEnum('priority').notNull().default('normal'),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  readAt: timestamp('read_at'),
  link: varchar('link', { length: 255 }),
  // Related entities for context
  relatedLoadId: integer('related_load_id').references(() => loads.id),
  relatedBookingId: integer('related_booking_id').references(() => bookings.id),
  relatedUserId: integer('related_user_id').references(() => users.id),
  // Metadata for additional context
  metadata: jsonb('metadata'),
  // Expiry for time-sensitive notifications
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Load = typeof loads.$inferSelect;
export type NewLoad = typeof loads.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type PlatformConfig = typeof platformConfig.$inferSelect;
export type NewPlatformConfig = typeof platformConfig.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type CargoCategory = typeof cargoCategories.$inferSelect;
export type NewCargoCategory = typeof cargoCategories.$inferInsert;
export type PricingRule = typeof pricingRules.$inferSelect;
export type NewPricingRule = typeof pricingRules.$inferInsert;
export type RoutePricing = typeof routePricing.$inferSelect;
export type NewRoutePricing = typeof routePricing.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// TIR Countries Table (60+ countries in TIR Convention)
export const tirCountries = pgTable('tir_countries', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 3 }).notNull().unique(), // ISO 3166-1 alpha-3
  name: varchar('name', { length: 100 }).notNull(),
  region: varchar('region', { length: 50 }), // Europe, Asia, Middle East, etc.
  tirMember: boolean('tir_member').notNull().default(true),
  customsUnion: varchar('customs_union', { length: 100 }), // EU, EAEU, etc.
  borderCrossings: jsonb('border_crossings'), // List of major border crossings
  notes: text('notes'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pakistan Domestic Routes Table
export const pakistanRoutes = pgTable('pakistan_routes', {
  id: serial('id').primaryKey(),
  routeCode: varchar('route_code', { length: 20 }).notNull().unique(),
  fromCity: varchar('from_city', { length: 100 }).notNull(),
  fromProvince: varchar('from_province', { length: 50 }).notNull(),
  fromLatitude: decimal('from_latitude', { precision: 10, scale: 7 }),
  fromLongitude: decimal('from_longitude', { precision: 10, scale: 7 }),
  toCity: varchar('to_city', { length: 100 }).notNull(),
  toProvince: varchar('to_province', { length: 50 }).notNull(),
  toLatitude: decimal('to_latitude', { precision: 10, scale: 7 }),
  toLongitude: decimal('to_longitude', { precision: 10, scale: 7 }),
  distanceKm: integer('distance_km').notNull(),
  estimatedHours: decimal('estimated_hours', { precision: 5, scale: 1 }),
  routeType: varchar('route_type', { length: 50 }), // highway, motorway, national_highway
  tollPlazas: integer('toll_plazas').default(0),
  majorCities: jsonb('major_cities'), // Cities along the route
  restrictions: text('restrictions'), // Weight limits, timing restrictions
  avgFreightRate: decimal('avg_freight_rate', { precision: 10, scale: 2 }), // Per ton
  popularity: varchar('popularity', { length: 20 }).default('medium'), // high, medium, low
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Legal Terms & Disclaimers Table
export const legalTerms = pgTable('legal_terms', {
  id: serial('id').primaryKey(),
  termType: varchar('term_type', { length: 50 }).notNull(), // 'disclaimer', 'terms', 'privacy', 'liability'
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  version: varchar('version', { length: 20 }).notNull(),
  language: varchar('language', { length: 10 }).default('en'),
  effectiveFrom: timestamp('effective_from').notNull(),
  effectiveUntil: timestamp('effective_until'),
  mandatory: boolean('mandatory').notNull().default(true),
  displayOrder: integer('display_order').default(0),
  active: boolean('active').notNull().default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Legal Acceptances Table
export const userLegalAcceptances = pgTable('user_legal_acceptances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  legalTermId: integer('legal_term_id').notNull().references(() => legalTerms.id),
  acceptedAt: timestamp('accepted_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
});

// Shipment Receipts Table (Computer Generated)
export const shipmentReceipts = pgTable('shipment_receipts', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  receiptNumber: varchar('receipt_number', { length: 50 }).notNull().unique(),
  receiptType: varchar('receipt_type', { length: 50 }).notNull(), // 'pickup', 'delivery', 'customs', 'transit'
  issuedTo: integer('issued_to').notNull().references(() => users.id),
  issuedBy: integer('issued_by').references(() => users.id),
  
  // Cargo Details
  cargoDescription: text('cargo_description').notNull(),
  cargoWeight: decimal('cargo_weight', { precision: 10, scale: 2 }),
  cargoVolume: decimal('cargo_volume', { precision: 10, scale: 2 }),
  numberOfPackages: integer('number_of_packages'),
  packagingType: varchar('packaging_type', { length: 100 }),
  
  // Location & Time
  location: varchar('location', { length: 255 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  
  // Signatures
  senderSignature: varchar('sender_signature', { length: 500 }), // URL to signature image
  receiverSignature: varchar('receiver_signature', { length: 500 }),
  driverSignature: varchar('driver_signature', { length: 500 }),
  
  // Condition & Notes
  cargoCondition: varchar('cargo_condition', { length: 50 }).default('good'), // good, damaged, partial
  damageNotes: text('damage_notes'),
  specialNotes: text('special_notes'),
  
  // Photos
  photos: jsonb('photos'), // Array of photo URLs
  
  // QR Code for verification
  qrCode: varchar('qr_code', { length: 500 }),
  verified: boolean('verified').notNull().default(false),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Prohibited Items Table
export const prohibitedItems = pgTable('prohibited_items', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  description: text('description'),
  legalReference: varchar('legal_reference', { length: 255 }), // Law/regulation reference
  penalty: text('penalty'),
  applicableRoutes: jsonb('applicable_routes'), // null = all routes
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customs Incidents Table
export const customsIncidents = pgTable('customs_incidents', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  incidentType: varchar('incident_type', { length: 50 }).notNull(), // 'detention', 'inspection', 'seizure', 'fine'
  location: varchar('location', { length: 255 }),
  authority: varchar('authority', { length: 255 }), // Customs, Police, etc.
  officerName: varchar('officer_name', { length: 255 }),
  officerBadge: varchar('officer_badge', { length: 50 }),
  reason: text('reason'),
  actionTaken: text('action_taken'),
  fineAmount: decimal('fine_amount', { precision: 12, scale: 2 }),
  detentionStarted: timestamp('detention_started'),
  detentionEnded: timestamp('detention_ended'),
  documents: jsonb('documents'), // Related document URLs
  resolved: boolean('resolved').notNull().default(false),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// TIR Vehicles Table
export const tirVehicles = pgTable('tir_vehicles', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id),
  tirCarnetNumber: varchar('tir_carnet_number', { length: 50 }),
  tirCarnetExpiry: timestamp('tir_carnet_expiry'),
  approvedCountries: jsonb('approved_countries'), // List of country codes
  customsSealNumber: varchar('customs_seal_number', { length: 100 }),
  lastInspectionDate: timestamp('last_inspection_date'),
  nextInspectionDue: timestamp('next_inspection_due'),
  tirCertified: boolean('tir_certified').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Load Declarations Table (Shipper declarations for compliance)
export const loadDeclarations = pgTable('load_declarations', {
  id: serial('id').primaryKey(),
  loadId: integer('load_id').notNull().references(() => loads.id),
  userId: integer('user_id').notNull().references(() => users.id),
  
  // Mandatory declarations
  noProhibitedItems: boolean('no_prohibited_items').notNull().default(false),
  accurateDescription: boolean('accurate_description').notNull().default(false),
  hasRequiredPermits: boolean('has_required_permits').notNull().default(false),
  acceptsResponsibility: boolean('accepts_responsibility').notNull().default(false),
  agreesToTerms: boolean('agrees_to_terms').notNull().default(false),
  
  // Document declarations
  containsDocuments: boolean('contains_documents').notNull().default(false),
  documentType: varchar('document_type', { length: 255 }),
  documentQuantity: integer('document_quantity'),
  documentPurpose: text('document_purpose'),
  documentRecipient: varchar('document_recipient', { length: 255 }),
  
  // Hazmat declarations
  containsHazmat: boolean('contains_hazmat').notNull().default(false),
  hazmatClass: varchar('hazmat_class', { length: 50 }),
  hazmatUnNumber: varchar('hazmat_un_number', { length: 20 }),
  
  // Digital signature
  signatureHash: varchar('signature_hash', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  
  declaredAt: timestamp('declared_at').defaultNow().notNull(),
});

// International Routes Table
export const internationalRoutes = pgTable('international_routes', {
  id: serial('id').primaryKey(),
  routeCode: varchar('route_code', { length: 30 }).notNull().unique(),
  routeName: varchar('route_name', { length: 255 }).notNull(),
  
  // Origin
  originCountry: varchar('origin_country', { length: 100 }).notNull(),
  originCity: varchar('origin_city', { length: 100 }).notNull(),
  originLatitude: decimal('origin_latitude', { precision: 10, scale: 7 }),
  originLongitude: decimal('origin_longitude', { precision: 10, scale: 7 }),
  
  // Destination
  destCountry: varchar('dest_country', { length: 100 }).notNull(),
  destCity: varchar('dest_city', { length: 100 }).notNull(),
  destLatitude: decimal('dest_latitude', { precision: 10, scale: 7 }),
  destLongitude: decimal('dest_longitude', { precision: 10, scale: 7 }),
  
  // Route details
  totalDistanceKm: integer('total_distance_km').notNull(),
  estimatedDays: integer('estimated_days').notNull(),
  transitCountries: jsonb('transit_countries'), // Array of country codes
  borderCrossings: jsonb('border_crossings'), // Array of border crossing points
  
  // Requirements
  tirRequired: boolean('tir_required').notNull().default(true),
  visaRequired: boolean('visa_required').notNull().default(false),
  customsDocuments: jsonb('customs_documents'), // Required documents list
  
  // Pricing
  avgFreightRate: decimal('avg_freight_rate', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 10 }).default('USD'),
  
  // Status
  active: boolean('active').notNull().default(true),
  seasonalRestrictions: text('seasonal_restrictions'),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document Verification Queue Table (Admin workflow)
export const documentVerificationQueue = pgTable('document_verification_queue', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => userDocuments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  assignedTo: integer('assigned_to').references(() => users.id), // Admin assigned
  
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  status: varchar('status', { length: 20 }).default('pending'), // pending, in_review, completed
  
  reviewStartedAt: timestamp('review_started_at'),
  reviewCompletedAt: timestamp('review_completed_at'),
  
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Builty (Transport Receipt) Table - Pakistani-style transport document
export const builtyReceipts = pgTable('builty_receipts', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  builtyNumber: varchar('builty_number', { length: 50 }).notNull().unique(), // BLT-2026-00001
  
  // Parties
  consignorId: integer('consignor_id').notNull().references(() => users.id), // Shipper
  consigneeId: integer('consignee_id').references(() => users.id), // Receiver (if registered)
  consigneeName: varchar('consignee_name', { length: 255 }).notNull(),
  consigneePhone: varchar('consignee_phone', { length: 20 }),
  consigneeAddress: text('consignee_address'),
  carrierId: integer('carrier_id').notNull().references(() => users.id),
  driverId: integer('driver_id').references(() => users.id),
  
  // Vehicle details
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  vehicleNumber: varchar('vehicle_number', { length: 50 }).notNull(),
  vehicleType: varchar('vehicle_type', { length: 100 }),
  
  // Route
  fromLocation: varchar('from_location', { length: 255 }).notNull(),
  fromLatitude: decimal('from_latitude', { precision: 10, scale: 7 }),
  fromLongitude: decimal('from_longitude', { precision: 10, scale: 7 }),
  toLocation: varchar('to_location', { length: 255 }).notNull(),
  toLatitude: decimal('to_latitude', { precision: 10, scale: 7 }),
  toLongitude: decimal('to_longitude', { precision: 10, scale: 7 }),
  
  // Cargo details
  cargoDescription: text('cargo_description').notNull(),
  numberOfPackages: integer('number_of_packages').notNull(),
  packagingType: varchar('packaging_type', { length: 100 }),
  declaredWeight: decimal('declared_weight', { precision: 10, scale: 2 }),
  actualWeight: decimal('actual_weight', { precision: 10, scale: 2 }),
  declaredValue: decimal('declared_value', { precision: 12, scale: 2 }),
  
  // Pricing - Only total shown to user (platform fee hidden)
  freightCharges: decimal('freight_charges', { precision: 12, scale: 2 }).notNull(),
  loadingCharges: decimal('loading_charges', { precision: 10, scale: 2 }).default('0'),
  unloadingCharges: decimal('unloading_charges', { precision: 10, scale: 2 }).default('0'),
  otherCharges: decimal('other_charges', { precision: 10, scale: 2 }).default('0'),
  platformFeeHidden: decimal('platform_fee_hidden', { precision: 10, scale: 2 }).default('0'), // Not shown to users
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(), // Final amount shown
  
  // Payment
  paymentMode: varchar('payment_mode', { length: 50 }).default('to_pay'), // to_pay, paid, to_be_billed
  advancePaid: decimal('advance_paid', { precision: 12, scale: 2 }).default('0'),
  balanceDue: decimal('balance_due', { precision: 12, scale: 2 }),
  
  // Dates
  bookingDate: timestamp('booking_date').defaultNow().notNull(),
  dispatchDate: timestamp('dispatch_date'),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  actualDeliveryDate: timestamp('actual_delivery_date'),
  
  // Status
  status: varchar('status', { length: 50 }).default('issued'), // issued, in_transit, delivered, cancelled
  
  // Signatures
  consignorSignature: varchar('consignor_signature', { length: 500 }),
  driverSignature: varchar('driver_signature', { length: 500 }),
  consigneeSignature: varchar('consignee_signature', { length: 500 }),
  
  // Condition
  conditionAtPickup: varchar('condition_at_pickup', { length: 50 }).default('good'),
  conditionAtDelivery: varchar('condition_at_delivery', { length: 50 }),
  damageNotes: text('damage_notes'),
  
  // Photos
  pickupPhotos: jsonb('pickup_photos'),
  deliveryPhotos: jsonb('delivery_photos'),
  
  // QR Code
  qrCode: varchar('qr_code', { length: 500 }),
  
  // Terms
  termsAndConditions: text('terms_and_conditions'),
  specialInstructions: text('special_instructions'),
  
  // Metadata
  metadata: jsonb('metadata'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Market Request Fulfillment Log (Internal team tracking)
export const marketRequestFulfillment = pgTable('market_request_fulfillment', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id').notNull(), // References goodsRequests.id
  
  // Action tracking
  actionType: varchar('action_type', { length: 50 }).notNull(), // search, contact_carrier, negotiate, match, fulfill
  actionBy: integer('action_by').notNull().references(() => users.id), // Internal team member
  actionDate: timestamp('action_date').defaultNow().notNull(),
  
  // Details
  notes: text('notes'),
  carrierContacted: integer('carrier_contacted').references(() => users.id),
  loadMatched: integer('load_matched'), // References loads.id
  quotedPrice: decimal('quoted_price', { precision: 12, scale: 2 }),
  
  // Outcome
  outcome: varchar('outcome', { length: 50 }), // success, pending, rejected, no_match
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Load Media Table (for images and videos)
export const loadMedia = pgTable('load_media', {
  id: serial('id').primaryKey(),
  loadId: integer('load_id').notNull().references(() => loads.id),
  
  mediaType: varchar('media_type', { length: 20 }).notNull(), // image, video, document
  mediaUrl: varchar('media_url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'), // bytes
  mimeType: varchar('mime_type', { length: 100 }),
  
  caption: varchar('caption', { length: 500 }),
  displayOrder: integer('display_order').default(0),
  
  uploadedBy: integer('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export new types
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type NewCompanyProfile = typeof companyProfiles.$inferInsert;
export type UserDocument = typeof userDocuments.$inferSelect;
export type NewUserDocument = typeof userDocuments.$inferInsert;
export type DriverProfile = typeof driverProfiles.$inferSelect;
export type NewDriverProfile = typeof driverProfiles.$inferInsert;
export type GoodsRequest = typeof goodsRequests.$inferSelect;
export type NewGoodsRequest = typeof goodsRequests.$inferInsert;
export type TirCountry = typeof tirCountries.$inferSelect;
export type NewTirCountry = typeof tirCountries.$inferInsert;
export type PakistanRoute = typeof pakistanRoutes.$inferSelect;
export type NewPakistanRoute = typeof pakistanRoutes.$inferInsert;
export type LegalTerm = typeof legalTerms.$inferSelect;
export type NewLegalTerm = typeof legalTerms.$inferInsert;
export type ShipmentReceipt = typeof shipmentReceipts.$inferSelect;
export type NewShipmentReceipt = typeof shipmentReceipts.$inferInsert;
export type ProhibitedItem = typeof prohibitedItems.$inferSelect;
export type CustomsIncident = typeof customsIncidents.$inferSelect;
export type TirVehicle = typeof tirVehicles.$inferSelect;
export type LoadDeclaration = typeof loadDeclarations.$inferSelect;
export type NewLoadDeclaration = typeof loadDeclarations.$inferInsert;
export type InternationalRoute = typeof internationalRoutes.$inferSelect;
export type NewInternationalRoute = typeof internationalRoutes.$inferInsert;
export type BuiltyReceipt = typeof builtyReceipts.$inferSelect;
export type NewBuiltyReceipt = typeof builtyReceipts.$inferInsert;
export type MarketRequestFulfillment = typeof marketRequestFulfillment.$inferSelect;
export type LoadMedia = typeof loadMedia.$inferSelect;
export type NewLoadMedia = typeof loadMedia.$inferInsert;
