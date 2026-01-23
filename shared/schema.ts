import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email').unique().notNull(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  phone: varchar('phone'),
  role: varchar('role').notNull().default('shipper'), // shipper, carrier, admin
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Loads table
export const loads = pgTable('loads', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  pickupDate: timestamp('pickup_date').notNull(),
  deliveryDate: timestamp('delivery_date'),
  cargoType: text('cargo_type').notNull(),
  weight: integer('weight').notNull(), // in kg
  length: integer('length'), // in cm
  width: integer('width'), // in cm
  height: integer('height'), // in cm
  volume: decimal('volume', { precision: 10, scale: 2 }), // in CBM
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency').default('USD'),
  status: varchar('status').default('available'), // available, booked, in_transit, delivered, cancelled
  urgent: boolean('urgent').default(false),
  description: text('description'),
  specialRequirements: text('special_requirements'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trucks table
export const trucks = pgTable('trucks', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id),
  truckType: varchar('truck_type').notNull(), // 20ft Container, 40ft Container, Flatbed, etc.
  capacity: integer('capacity').notNull(), // in kg
  currentLocation: text('current_location'),
  preferredRoute: text('preferred_route'),
  availableFrom: timestamp('available_from'),
  ratePerKm: decimal('rate_per_km', { precision: 10, scale: 2 }),
  currency: varchar('currency').default('USD'),
  verified: boolean('verified').default(false),
  insured: boolean('insured').default(false),
  gpsTracking: boolean('gps_tracking').default(false),
  status: varchar('status').default('available'), // available, busy, maintenance
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Carriers table (additional info for carrier users)
export const carriers = pgTable('carriers', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id),
  companyName: varchar('company_name').notNull(),
  licenseNumber: varchar('license_number'),
  insuranceNumber: varchar('insurance_number'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalTrips: integer('total_trips').default(0),
  onTimeDelivery: integer('on_time_delivery').default(0),
  borderCrossingExperience: integer('border_crossing_experience').default(0),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Quotes table
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  loadId: integer('load_id').notNull().references(() => loads.id),
  carrierId: varchar('carrier_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency').default('USD'),
  estimatedDays: integer('estimated_days'),
  message: text('message'),
  status: varchar('status').default('pending'), // pending, accepted, rejected
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  loadId: integer('load_id').notNull().references(() => loads.id),
  carrierId: varchar('carrier_id').notNull().references(() => users.id),
  truckId: integer('truck_id').references(() => trucks.id),
  agreedPrice: decimal('agreed_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency').default('USD'),
  status: varchar('status').default('pending'), // pending, confirmed, in_transit, completed, cancelled
  trackingNumber: varchar('tracking_number').unique(),
  currentLocation: text('current_location'),
  progress: integer('progress').default(0), // 0-100
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tracking milestones
export const trackingMilestones = pgTable('tracking_milestones', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  milestone: varchar('milestone').notNull(), // loadPickup, borderCrossing, customsClearance, inTransit, finalDelivery
  location: text('location'),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loads: many(loads),
  trucks: many(trucks),
  carrier: many(carriers),
}));

export const loadsRelations = relations(loads, ({ one, many }) => ({
  user: one(users, { fields: [loads.userId], references: [users.id] }),
  quotes: many(quotes),
  bookings: many(bookings),
}));

export const trucksRelations = relations(trucks, ({ one }) => ({
  user: one(users, { fields: [trucks.userId], references: [users.id] }),
}));

export const carriersRelations = relations(carriers, ({ one }) => ({
  user: one(users, { fields: [carriers.userId], references: [users.id] }),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  load: one(loads, { fields: [quotes.loadId], references: [loads.id] }),
  carrier: one(users, { fields: [quotes.carrierId], references: [users.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  load: one(loads, { fields: [bookings.loadId], references: [loads.id] }),
  carrier: one(users, { fields: [bookings.carrierId], references: [users.id] }),
  truck: one(trucks, { fields: [bookings.truckId], references: [trucks.id] }),
  milestones: many(trackingMilestones),
}));

export const trackingMilestonesRelations = relations(trackingMilestones, ({ one }) => ({
  booking: one(bookings, { fields: [trackingMilestones.bookingId], references: [bookings.id] }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertLoadSchema = createInsertSchema(loads).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectLoadSchema = createSelectSchema(loads);

export const insertTruckSchema = createInsertSchema(trucks).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectTruckSchema = createSelectSchema(trucks);

export const insertQuoteSchema = createInsertSchema(quotes).omit({ 
  id: true, 
  carrierId: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectQuoteSchema = createSelectSchema(quotes);

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectBookingSchema = createSelectSchema(bookings);

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Load = typeof loads.$inferSelect;
export type InsertLoad = z.infer<typeof insertLoadSchema>;

export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = z.infer<typeof insertTruckSchema>;

export type Carrier = typeof carriers.$inferSelect;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type TrackingMilestone = typeof trackingMilestones.$inferSelect;
