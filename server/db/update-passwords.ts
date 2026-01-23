import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function updatePasswords() {
  console.log('🔐 Updating user passwords...');

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const shipperPassword = await bcrypt.hash('shipper123', 10);
    const carrierPassword = await bcrypt.hash('carrier123', 10);

    // Update admin password
    await db.update(users)
      .set({ password: adminPassword })
      .where(eq(users.email, 'admin@pakload.com'));
    console.log('✅ Updated admin@pakload.com password to: admin123');

    // Update shipper passwords
    await db.update(users)
      .set({ password: shipperPassword })
      .where(eq(users.email, 'shipper@pakload.com'));
    console.log('✅ Updated shipper@pakload.com password to: shipper123');

    await db.update(users)
      .set({ password: shipperPassword })
      .where(eq(users.email, 'sara@pakload.com'));
    console.log('✅ Updated sara@pakload.com password to: shipper123');

    // Update carrier passwords
    await db.update(users)
      .set({ password: carrierPassword })
      .where(eq(users.email, 'demo@pakload.com'));
    console.log('✅ Updated demo@pakload.com password to: carrier123');

    await db.update(users)
      .set({ password: carrierPassword })
      .where(eq(users.email, 'carrier2@pakload.com'));
    console.log('✅ Updated carrier2@pakload.com password to: carrier123');

    console.log('\n✅ All passwords updated successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@pakload.com / admin123');
    console.log('Shipper: shipper@pakload.com / shipper123');
    console.log('Carrier: demo@pakload.com / carrier123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    process.exit(1);
  }
}

updatePasswords();
