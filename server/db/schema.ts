import { pgTable, serial, varchar, text, integer, decimal, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'shipper', 'carrier']);
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
  status: userStatusEnum('status').notNull().default('pending'),
  verified: boolean('verified').notNull().default(false),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalLoads: integer('total_loads').default(0),
  completedLoads: integer('completed_loads').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Loads Table
export const loads = pgTable('loads', {
  id: serial('id').primaryKey(),
  shipperId: integer('shipper_id').notNull().references(() => users.id),
  trackingNumber: varchar('tracking_number', { length: 50 }).notNull().unique(),
  origin: varchar('origin', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  pickupDate: timestamp('pickup_date').notNull(),
  deliveryDate: timestamp('delivery_date').notNull(),
  cargoType: varchar('cargo_type', { length: 100 }).notNull(),
  cargoWeight: decimal('cargo_weight', { precision: 10, scale: 2 }).notNull(),
  cargoVolume: decimal('cargo_volume', { precision: 10, scale: 2 }),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  status: loadStatusEnum('status').notNull().default('pending'),
  distance: integer('distance'),
  estimatedDays: varchar('estimated_days', { length: 20 }),
  specialRequirements: text('special_requirements'),
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

// Notifications Table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  read: boolean('read').notNull().default(false),
  link: varchar('link', { length: 255 }),
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
