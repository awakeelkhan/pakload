import { db } from './index.js';
import { users, loads, vehicles, routes, platformConfig } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const shipperPassword = await bcrypt.hash('shipper123', 10);
    const carrierPassword = await bcrypt.hash('carrier123', 10);

    // Create admin user
    const [admin] = await db.insert(users).values({
      email: 'admin@pakload.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+92-300-1234567',
      companyName: 'PakLoad Administration',
      role: 'admin',
      status: 'active',
      verified: true,
      rating: '5.00',
    }).returning();
    console.log('✅ Created admin user (admin@pakload.com / admin123)');

    // Create shipper users
    const [shipper1] = await db.insert(users).values({
      email: 'shipper@pakload.com',
      password: shipperPassword,
      firstName: 'Ahmad',
      lastName: 'Khan',
      phone: '+92-300-2345678',
      companyName: 'Khan Logistics',
      role: 'shipper',
      status: 'active',
      verified: true,
      rating: '4.80',
      totalLoads: 45,
      completedLoads: 42,
    }).returning();

    const [shipper2] = await db.insert(users).values({
      email: 'sara@pakload.com',
      password: shipperPassword,
      firstName: 'Sara',
      lastName: 'Ali',
      phone: '+92-300-3456789',
      companyName: 'Ali Trading Co',
      role: 'shipper',
      status: 'active',
      verified: true,
      rating: '4.65',
      totalLoads: 32,
      completedLoads: 30,
    }).returning();
    console.log('✅ Created shipper users (shipper@pakload.com / shipper123)');

    // Create carrier users
    const [carrier1] = await db.insert(users).values({
      email: 'demo@pakload.com',
      password: carrierPassword,
      firstName: 'Hassan',
      lastName: 'Raza',
      phone: '+92-300-4567890',
      companyName: 'CPEC Express Logistics',
      role: 'carrier',
      status: 'active',
      verified: true,
      rating: '4.90',
      totalLoads: 67,
      completedLoads: 65,
    }).returning();

    const [carrier2] = await db.insert(users).values({
      email: 'carrier2@pakload.com',
      password: carrierPassword,
      firstName: 'Fatima',
      lastName: 'Ahmed',
      phone: '+92-300-5678901',
      companyName: 'Silk Road Transport',
      role: 'carrier',
      status: 'active',
      verified: true,
      rating: '4.75',
      totalLoads: 54,
      completedLoads: 52,
    }).returning();
    console.log('✅ Created carrier users');

    // Create vehicles
    await db.insert(vehicles).values([
      {
        carrierId: carrier1.id,
        type: '40ft Container',
        registrationNumber: 'LHR-1234',
        capacity: '25000',
        currentLocation: 'Islamabad',
        status: 'active',
        fuelType: 'Diesel',
        yearManufactured: 2020,
      },
      {
        carrierId: carrier1.id,
        type: '20ft Container',
        registrationNumber: 'KHI-5678',
        capacity: '15000',
        currentLocation: 'Karachi',
        status: 'active',
        fuelType: 'Diesel',
        yearManufactured: 2021,
      },
      {
        carrierId: carrier2.id,
        type: 'Flatbed Truck',
        registrationNumber: 'ISB-9012',
        capacity: '20000',
        currentLocation: 'Lahore',
        status: 'active',
        fuelType: 'Diesel',
        yearManufactured: 2019,
      },
    ]);
    console.log('✅ Created vehicles');

    // Create loads
    await db.insert(loads).values([
      {
        shipperId: shipper1.id,
        trackingNumber: 'LP-2024-08844',
        origin: 'Kashgar, China',
        destination: 'Islamabad, Pakistan',
        pickupDate: new Date('2024-12-08'),
        deliveryDate: new Date('2024-12-20'),
        cargoType: 'Electronics',
        cargoWeight: '15000',
        cargoVolume: '45',
        description: 'Consumer electronics shipment',
        price: '4200',
        status: 'posted',
        distance: 1200,
        estimatedDays: '10-12',
      },
      {
        shipperId: shipper1.id,
        trackingNumber: 'LP-2024-08845',
        origin: 'Urumqi, China',
        destination: 'Lahore, Pakistan',
        pickupDate: new Date('2024-12-15'),
        deliveryDate: new Date('2024-12-28'),
        cargoType: 'Textiles',
        cargoWeight: '18000',
        cargoVolume: '60',
        description: 'Textile goods',
        price: '5200',
        status: 'posted',
        distance: 1500,
        estimatedDays: '12-14',
      },
      {
        shipperId: shipper2.id,
        trackingNumber: 'LP-2024-08846',
        origin: 'Kashgar, China',
        destination: 'Karachi, Pakistan',
        pickupDate: new Date('2024-12-25'),
        deliveryDate: new Date('2025-01-05'),
        cargoType: 'Machinery',
        cargoWeight: '22000',
        cargoVolume: '80',
        description: 'Industrial machinery',
        price: '6800',
        status: 'posted',
        distance: 1800,
        estimatedDays: '14-16',
      },
    ]);
    console.log('✅ Created loads');

    // Create routes
    await db.insert(routes).values([
      {
        from: 'Kashgar',
        to: 'Islamabad',
        distance: 1200,
        estimatedDays: '10-12',
        borderCrossing: 'Khunjerab Pass',
        routePopularity: 'High',
        activeTrucks: 45,
        activeLoads: 67,
        avgPrice: '4500',
      },
      {
        from: 'Urumqi',
        to: 'Lahore',
        distance: 1500,
        estimatedDays: '12-14',
        borderCrossing: 'Khunjerab Pass',
        routePopularity: 'High',
        activeTrucks: 38,
        activeLoads: 52,
        avgPrice: '5200',
      },
      {
        from: 'Kashgar',
        to: 'Karachi',
        distance: 1800,
        estimatedDays: '14-16',
        borderCrossing: 'Khunjerab Pass',
        routePopularity: 'Medium',
        activeTrucks: 28,
        activeLoads: 41,
        avgPrice: '6500',
      },
    ]);
    console.log('✅ Created routes');

    // Create platform configuration
    await db.insert(platformConfig).values([
      {
        key: 'platform_fee_percentage',
        value: '5',
        description: 'Platform fee percentage charged on each transaction',
      },
      {
        key: 'min_load_value',
        value: '100',
        description: 'Minimum load value in USD',
      },
      {
        key: 'max_load_value',
        value: '100000',
        description: 'Maximum load value in USD',
      },
      {
        key: 'auto_approve_carriers',
        value: 'false',
        description: 'Automatically approve carrier registrations',
      },
      {
        key: 'auto_approve_shippers',
        value: 'false',
        description: 'Automatically approve shipper registrations',
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Platform maintenance mode',
      },
    ]);
    console.log('✅ Created platform configuration');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
