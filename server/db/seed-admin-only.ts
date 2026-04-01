import { db } from './index.js';
import { routes, platformConfig, cargoCategories, pricingRules, routePricing, auditLogs } from './schema.js';

async function seedAdminData() {
  console.log('🌱 Seeding admin data only...');

  try {
    // Create routes
    console.log('📍 Creating routes...');
    await db.insert(routes).values([
      { from: 'Kashgar', to: 'Islamabad', distance: 1200, estimatedDays: '10-12', borderCrossing: 'Khunjerab Pass', routePopularity: 'High', activeTrucks: 45, activeLoads: 67, avgPrice: '308000' },
      { from: 'Urumqi', to: 'Lahore', distance: 1500, estimatedDays: '12-14', borderCrossing: 'Khunjerab Pass', routePopularity: 'High', activeTrucks: 38, activeLoads: 52, avgPrice: '380000' },
      { from: 'Kashgar', to: 'Karachi', distance: 1800, estimatedDays: '14-16', borderCrossing: 'Khunjerab Pass', routePopularity: 'Medium', activeTrucks: 28, activeLoads: 41, avgPrice: '452000' },
      { from: 'Tashkurgan', to: 'Gilgit', distance: 350, estimatedDays: '4-6', borderCrossing: 'Khunjerab Pass', routePopularity: 'Medium', activeTrucks: 15, activeLoads: 22, avgPrice: '102000' },
      { from: 'Hotan', to: 'Peshawar', distance: 1100, estimatedDays: '8-10', borderCrossing: 'Khunjerab Pass', routePopularity: 'Low', activeTrucks: 12, activeLoads: 18, avgPrice: '271000' },
    ]).onConflictDoNothing();
    console.log('✅ Routes created');

    // Create platform configuration
    console.log('⚙️ Creating platform configs...');
    await db.insert(platformConfig).values([
      { key: 'platform_fee_percentage', value: '5', description: 'Platform fee percentage' },
      { key: 'min_load_value', value: '100', description: 'Minimum load value in USD' },
      { key: 'max_load_value', value: '100000', description: 'Maximum load value in USD' },
      { key: 'auto_approve_carriers', value: 'false', description: 'Auto approve carriers' },
      { key: 'auto_approve_shippers', value: 'true', description: 'Auto approve shippers' },
      { key: 'maintenance_mode', value: 'false', description: 'Maintenance mode' },
      { key: 'currency_conversion_rate', value: '278', description: 'USD to PKR rate' },
      { key: 'support_email', value: 'support@pakload.com', description: 'Support email' },
    ]).onConflictDoNothing();
    console.log('✅ Platform configs created');

    // Create cargo categories
    console.log('📦 Creating cargo categories...');
    await db.insert(cargoCategories).values([
      { name: 'Electronics', description: 'Electronic goods', baseRate: '150.00', status: 'published' },
      { name: 'Textiles', description: 'Fabric and clothing', baseRate: '80.00', status: 'published' },
      { name: 'Machinery', description: 'Industrial machinery', baseRate: '200.00', status: 'published' },
      { name: 'Food & Beverages', description: 'Food items', baseRate: '120.00', status: 'published' },
      { name: 'Chemicals', description: 'Industrial chemicals', baseRate: '180.00', status: 'published' },
      { name: 'Construction', description: 'Building materials', baseRate: '100.00', status: 'published' },
      { name: 'Automotive', description: 'Vehicle parts', baseRate: '130.00', status: 'published' },
      { name: 'Furniture', description: 'Home furniture', baseRate: '90.00', status: 'published' },
    ]).onConflictDoNothing();
    console.log('✅ Cargo categories created');

    // Create pricing rules
    console.log('💰 Creating pricing rules...');
    await db.insert(pricingRules).values([
      { name: 'Peak Season Surge', description: 'Higher rates during peak season', ruleType: 'surge', multiplier: '1.25', status: 'published' },
      { name: 'Urgent Delivery', description: 'Premium for urgent deliveries', ruleType: 'surge', multiplier: '1.50', status: 'published' },
      { name: 'Long Distance Discount', description: 'Discount for long routes', ruleType: 'distance', multiplier: '0.95', status: 'published' },
      { name: 'Weekend Pickup', description: 'Weekend pickup charge', ruleType: 'surge', multiplier: '1.15', status: 'published' },
      { name: 'Bulk Shipment', description: 'Bulk shipment discount', ruleType: 'weight', multiplier: '0.90', status: 'published' },
      { name: 'New Customer', description: 'First-time discount', ruleType: 'category', multiplier: '0.85', status: 'draft' },
    ]).onConflictDoNothing();
    console.log('✅ Pricing rules created');

    // Create route pricing
    console.log('🛣️ Creating route pricing...');
    await db.insert(routePricing).values([
      { routeId: 1, basePrice: '308000.00', surgeMultiplier: '1.00', status: 'published' },
      { routeId: 2, basePrice: '380000.00', surgeMultiplier: '1.00', status: 'published' },
      { routeId: 3, basePrice: '452000.00', surgeMultiplier: '1.00', status: 'published' },
      { routeId: 4, basePrice: '102000.00', surgeMultiplier: '1.00', status: 'published' },
      { routeId: 5, basePrice: '271000.00', surgeMultiplier: '1.00', status: 'published' },
    ]).onConflictDoNothing();
    console.log('✅ Route pricing created');

    // Create audit logs
    console.log('📋 Creating audit logs...');
    await db.insert(auditLogs).values([
      { userId: 1, action: 'create', entity: 'route', entityId: 1, ipAddress: '192.168.1.1' },
      { userId: 1, action: 'update', entity: 'platform_config', entityId: 1, ipAddress: '192.168.1.1' },
      { userId: 1, action: 'create', entity: 'cargo_category', entityId: 1, ipAddress: '192.168.1.1' },
      { userId: 1, action: 'publish', entity: 'pricing_rule', entityId: 1, ipAddress: '192.168.1.1' },
      { userId: 1, action: 'create', entity: 'route_pricing', entityId: 1, ipAddress: '192.168.1.1' },
    ]).onConflictDoNothing();
    console.log('✅ Audit logs created');

    console.log('🎉 Admin data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
    throw error;
  }
}

seedAdminData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
