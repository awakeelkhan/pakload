import { db } from './index.js';
import { platformConfig } from './schema.js';

const DEFAULT_CONFIGS = [
  // Platform Fees
  { key: 'platform_fee_percent', value: '5', category: 'fees', dataType: 'number', description: 'Platform fee percentage on freight charges', isPublic: false },
  { key: 'min_platform_fee', value: '500', category: 'fees', dataType: 'number', description: 'Minimum platform fee (PKR)', isPublic: false },
  { key: 'max_platform_fee', value: '50000', category: 'fees', dataType: 'number', description: 'Maximum platform fee cap (PKR)', isPublic: false },
  
  // GST Settings
  { key: 'gst_enabled', value: 'true', category: 'taxes', dataType: 'boolean', description: 'Enable GST on transactions', isPublic: true },
  { key: 'gst_percent', value: '16', category: 'taxes', dataType: 'number', description: 'GST percentage', isPublic: true },
  { key: 'gst_registration_number', value: '', category: 'taxes', dataType: 'string', description: 'Platform GST registration number', isPublic: true },
  
  // Withholding Tax
  { key: 'withholding_tax_enabled', value: 'false', category: 'taxes', dataType: 'boolean', description: 'Enable withholding tax', isPublic: false },
  { key: 'withholding_tax_percent', value: '4.5', category: 'taxes', dataType: 'number', description: 'Withholding tax percentage', isPublic: false },
  
  // Load Limits
  { key: 'individual_max_active_loads', value: '5', category: 'limits', dataType: 'number', description: 'Max active loads for individual shippers', isPublic: true },
  { key: 'company_max_active_loads', value: '100', category: 'limits', dataType: 'number', description: 'Max active loads for company shippers', isPublic: true },
  { key: 'max_load_value', value: '10000000', category: 'limits', dataType: 'number', description: 'Maximum load value (PKR)', isPublic: true },
  { key: 'min_load_value', value: '1000', category: 'limits', dataType: 'number', description: 'Minimum load value (PKR)', isPublic: true },
  
  // Bid Settings
  { key: 'bid_validity_hours', value: '48', category: 'bidding', dataType: 'number', description: 'Default bid validity in hours', isPublic: true },
  { key: 'max_bids_per_load', value: '50', category: 'bidding', dataType: 'number', description: 'Maximum bids allowed per load', isPublic: true },
  { key: 'auto_expire_bids', value: 'true', category: 'bidding', dataType: 'boolean', description: 'Automatically expire old bids', isPublic: false },
  
  // Payment Settings
  { key: 'advance_payment_percent', value: '30', category: 'payments', dataType: 'number', description: 'Default advance payment percentage', isPublic: true },
  { key: 'payment_hold_days', value: '3', category: 'payments', dataType: 'number', description: 'Days to hold payment after delivery', isPublic: true },
  { key: 'escrow_enabled', value: 'true', category: 'payments', dataType: 'boolean', description: 'Enable escrow payments', isPublic: true },
  
  // Document Verification
  { key: 'auto_approve_documents', value: 'false', category: 'verification', dataType: 'boolean', description: 'Auto-approve uploaded documents', isPublic: false },
  { key: 'document_expiry_warning_days', value: '30', category: 'verification', dataType: 'number', description: 'Days before expiry to warn users', isPublic: true },
  { key: 'require_all_documents', value: 'true', category: 'verification', dataType: 'boolean', description: 'Require all mandatory documents for activation', isPublic: true },
  
  // Notifications
  { key: 'email_notifications_enabled', value: 'true', category: 'notifications', dataType: 'boolean', description: 'Enable email notifications', isPublic: true },
  { key: 'sms_notifications_enabled', value: 'true', category: 'notifications', dataType: 'boolean', description: 'Enable SMS notifications', isPublic: true },
  { key: 'push_notifications_enabled', value: 'true', category: 'notifications', dataType: 'boolean', description: 'Enable push notifications', isPublic: true },
  
  // Rating Settings
  { key: 'min_rating_for_premium', value: '4.5', category: 'ratings', dataType: 'number', description: 'Minimum rating for premium badge', isPublic: true },
  { key: 'rating_weight_recent', value: '0.7', category: 'ratings', dataType: 'number', description: 'Weight for recent ratings (0-1)', isPublic: false },
  
  // Builty Settings
  { key: 'builty_terms_version', value: '1.0', category: 'builty', dataType: 'string', description: 'Current builty terms version', isPublic: true },
  { key: 'builty_claim_period_hours', value: '24', category: 'builty', dataType: 'number', description: 'Hours to file damage claim after delivery', isPublic: true },
  { key: 'builty_auto_generate', value: 'true', category: 'builty', dataType: 'boolean', description: 'Auto-generate builty on booking confirmation', isPublic: false },
  
  // Market Request Settings
  { key: 'market_request_expiry_days', value: '7', category: 'market_requests', dataType: 'number', description: 'Days before market request expires', isPublic: true },
  { key: 'market_request_auto_assign', value: 'false', category: 'market_requests', dataType: 'boolean', description: 'Auto-assign requests to team members', isPublic: false },
  
  // Currency Settings
  { key: 'default_currency', value: 'PKR', category: 'currency', dataType: 'string', description: 'Default currency', isPublic: true },
  { key: 'supported_currencies', value: '["PKR", "USD", "CNY", "EUR"]', category: 'currency', dataType: 'json', description: 'Supported currencies', isPublic: true },
  { key: 'usd_to_pkr_rate', value: '278.50', category: 'currency', dataType: 'number', description: 'USD to PKR exchange rate', isPublic: true },
  
  // TIR Settings
  { key: 'tir_enabled', value: 'true', category: 'tir', dataType: 'boolean', description: 'Enable TIR international routes', isPublic: true },
  { key: 'tir_premium_percent', value: '10', category: 'tir', dataType: 'number', description: 'Premium percentage for TIR loads', isPublic: false },
  
  // Maintenance
  { key: 'maintenance_mode', value: 'false', category: 'system', dataType: 'boolean', description: 'Platform maintenance mode', isPublic: true },
  { key: 'maintenance_message', value: 'Platform is under maintenance. Please try again later.', category: 'system', dataType: 'string', description: 'Maintenance mode message', isPublic: true },
];

export async function seedPlatformConfig() {
  console.log('Seeding platform configuration...');
  
  let created = 0;
  let skipped = 0;

  for (const config of DEFAULT_CONFIGS) {
    try {
      // Check if config already exists
      const existing = await db.select().from(platformConfig).where(
        (await import('drizzle-orm')).eq(platformConfig.key, config.key)
      );

      if (existing.length === 0) {
        await db.insert(platformConfig).values({
          ...config,
          status: 'published',
          publishedAt: new Date(),
        });
        created++;
        console.log(`  ✓ Created: ${config.key}`);
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`  ✗ Error creating ${config.key}:`, error);
    }
  }

  console.log(`\nPlatform configuration seeded:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Total: ${DEFAULT_CONFIGS.length}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPlatformConfig()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
