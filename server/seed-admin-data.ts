import { db } from './db';
import { routes, platformConfigs } from '../shared/schema';

async function seedAdminData() {
  console.log('🌱 Seeding admin data...');

  try {
    // Seed Routes
    const routesData = [
      { origin: 'Kashgar, China', destination: 'Islamabad, Pakistan', distance: '1200', estimatedTime: '48', status: 'active' },
      { origin: 'Urumqi, China', destination: 'Lahore, Pakistan', distance: '1450', estimatedTime: '56', status: 'active' },
      { origin: 'Kashgar, China', destination: 'Karachi, Pakistan', distance: '1800', estimatedTime: '72', status: 'active' },
      { origin: 'Tashkurgan, China', destination: 'Gilgit, Pakistan', distance: '350', estimatedTime: '12', status: 'active' },
      { origin: 'Khunjerab Pass', destination: 'Islamabad, Pakistan', distance: '600', estimatedTime: '24', status: 'active' },
      { origin: 'Urumqi, China', destination: 'Karachi, Pakistan', distance: '2100', estimatedTime: '84', status: 'active' },
      { origin: 'Kashgar, China', destination: 'Peshawar, Pakistan', distance: '900', estimatedTime: '36', status: 'active' },
      { origin: 'Hotan, China', destination: 'Lahore, Pakistan', distance: '1600', estimatedTime: '64', status: 'draft' },
    ];

    console.log('  📍 Inserting routes...');
    for (const route of routesData) {
      await db.insert(routes).values(route).onConflictDoNothing();
    }
    console.log(`  ✅ Inserted ${routesData.length} routes`);

    // Seed Platform Configs
    const configsData = [
      { key: 'platform_fee_percentage', value: '5', description: 'Platform fee percentage for each booking', category: 'pricing', status: 'published' },
      { key: 'min_load_value', value: '100', description: 'Minimum load value in USD', category: 'pricing', status: 'published' },
      { key: 'max_load_value', value: '100000', description: 'Maximum load value in USD', category: 'pricing', status: 'published' },
      { key: 'auto_approve_carriers', value: 'false', description: 'Automatically approve new carrier registrations', category: 'registration', status: 'published' },
      { key: 'auto_approve_shippers', value: 'true', description: 'Automatically approve new shipper registrations', category: 'registration', status: 'published' },
      { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode', category: 'system', status: 'published' },
      { key: 'max_bid_duration_hours', value: '72', description: 'Maximum hours a bid can remain open', category: 'bidding', status: 'published' },
      { key: 'currency_conversion_rate', value: '278', description: 'USD to PKR conversion rate', category: 'pricing', status: 'published' },
      { key: 'support_email', value: 'support@pakload.com', description: 'Support email address', category: 'contact', status: 'published' },
      { key: 'support_phone', value: '+92-300-1234567', description: 'Support phone number', category: 'contact', status: 'published' },
    ];

    console.log('  ⚙️ Inserting platform configs...');
    for (const config of configsData) {
      await db.insert(platformConfigs).values(config).onConflictDoNothing();
    }
    console.log(`  ✅ Inserted ${configsData.length} platform configs`);

    console.log('\n✅ Admin data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
    throw error;
  }
}

// Run if called directly
seedAdminData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
