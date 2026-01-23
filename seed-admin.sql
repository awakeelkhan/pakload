-- Seed Admin Data for PakLoad Platform
-- Run this script to populate admin tables with sample data

-- Insert Routes
INSERT INTO routes (origin, destination, distance, estimated_time, status, created_at) VALUES
('Kashgar, China', 'Islamabad, Pakistan', '1200', '48', 'active', NOW()),
('Urumqi, China', 'Lahore, Pakistan', '1450', '56', 'active', NOW()),
('Kashgar, China', 'Karachi, Pakistan', '1800', '72', 'active', NOW()),
('Tashkurgan, China', 'Gilgit, Pakistan', '350', '12', 'active', NOW()),
('Khunjerab Pass', 'Islamabad, Pakistan', '600', '24', 'active', NOW()),
('Urumqi, China', 'Karachi, Pakistan', '2100', '84', 'active', NOW()),
('Kashgar, China', 'Peshawar, Pakistan', '900', '36', 'active', NOW()),
('Hotan, China', 'Lahore, Pakistan', '1600', '64', 'draft', NOW())
ON CONFLICT DO NOTHING;

-- Insert Platform Configs
INSERT INTO platform_configs (key, value, description, category, status, created_at) VALUES
('platform_fee_percentage', '5', 'Platform fee percentage for each booking', 'pricing', 'published', NOW()),
('min_load_value', '100', 'Minimum load value in USD', 'pricing', 'published', NOW()),
('max_load_value', '100000', 'Maximum load value in USD', 'pricing', 'published', NOW()),
('auto_approve_carriers', 'false', 'Automatically approve new carrier registrations', 'registration', 'published', NOW()),
('auto_approve_shippers', 'true', 'Automatically approve new shipper registrations', 'registration', 'published', NOW()),
('maintenance_mode', 'false', 'Enable maintenance mode', 'system', 'published', NOW()),
('max_bid_duration_hours', '72', 'Maximum hours a bid can remain open', 'bidding', 'published', NOW()),
('currency_conversion_rate', '278', 'USD to PKR conversion rate', 'pricing', 'published', NOW()),
('support_email', 'support@pakload.com', 'Support email address', 'contact', 'published', NOW()),
('support_phone', '+92-300-1234567', 'Support phone number', 'contact', 'published', NOW())
ON CONFLICT DO NOTHING;

-- Insert Cargo Categories
INSERT INTO cargo_categories (name, description, base_rate, status, created_at) VALUES
('Electronics', 'Electronic goods, computers, phones, etc.', '150.00', 'published', NOW()),
('Textiles', 'Fabric, clothing, and textile products', '80.00', 'published', NOW()),
('Machinery', 'Industrial machinery and equipment', '200.00', 'published', NOW()),
('Food & Beverages', 'Perishable and non-perishable food items', '120.00', 'published', NOW()),
('Chemicals', 'Industrial chemicals (non-hazardous)', '180.00', 'published', NOW()),
('Construction Materials', 'Building materials, cement, steel', '100.00', 'published', NOW()),
('Automotive Parts', 'Vehicle parts and accessories', '130.00', 'published', NOW()),
('Furniture', 'Home and office furniture', '90.00', 'published', NOW())
ON CONFLICT DO NOTHING;

-- Insert Pricing Rules
INSERT INTO pricing_rules (name, description, rule_type, multiplier, conditions, status, created_at) VALUES
('Peak Season Surge', 'Higher rates during peak shipping season', 'multiplier', '1.25', '{"months": [11, 12, 1]}', 'active', NOW()),
('Urgent Delivery', 'Premium for urgent deliveries', 'multiplier', '1.50', '{"urgent": true}', 'active', NOW()),
('Long Distance Discount', 'Discount for routes over 1500km', 'multiplier', '0.95', '{"min_distance": 1500}', 'active', NOW()),
('Weekend Pickup', 'Additional charge for weekend pickups', 'multiplier', '1.15', '{"weekend": true}', 'active', NOW()),
('Bulk Shipment', 'Discount for shipments over 20 tons', 'multiplier', '0.90', '{"min_weight": 20000}', 'active', NOW()),
('New Customer', 'First-time customer discount', 'multiplier', '0.85', '{"first_order": true}', 'draft', NOW())
ON CONFLICT DO NOTHING;

-- Insert Route Pricing
INSERT INTO route_pricing (route_id, base_price, surge_multiplier, status, created_at) VALUES
(1, '4500.00', '1.0', 'published', NOW()),
(2, '5200.00', '1.0', 'published', NOW()),
(3, '6500.00', '1.0', 'published', NOW()),
(4, '1500.00', '1.0', 'published', NOW()),
(5, '2800.00', '1.0', 'published', NOW()),
(6, '7500.00', '1.2', 'published', NOW()),
(7, '3500.00', '1.0', 'published', NOW())
ON CONFLICT DO NOTHING;

-- Insert Audit Logs (sample entries)
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(1, 'create', 'route', 1, 'Created route Kashgar to Islamabad', '192.168.1.1', NOW() - INTERVAL '2 days'),
(1, 'update', 'platform_config', 1, 'Updated platform fee to 5%', '192.168.1.1', NOW() - INTERVAL '1 day'),
(1, 'create', 'cargo_category', 1, 'Created Electronics category', '192.168.1.1', NOW() - INTERVAL '1 day'),
(1, 'publish', 'pricing_rule', 1, 'Published Peak Season Surge rule', '192.168.1.1', NOW() - INTERVAL '12 hours'),
(1, 'create', 'route_pricing', 1, 'Set pricing for Kashgar-Islamabad route', '192.168.1.1', NOW() - INTERVAL '6 hours'),
(1, 'update', 'cargo_category', 2, 'Updated Textiles base rate', '192.168.1.1', NOW() - INTERVAL '3 hours'),
(1, 'create', 'user', 5, 'New carrier registration approved', '192.168.1.1', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

SELECT 'Admin data seeded successfully!' as status;
