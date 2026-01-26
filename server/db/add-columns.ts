import { db } from './index';
import { sql } from 'drizzle-orm';

async function addColumns() {
  try {
    console.log('Adding missing columns to users table...');
    
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS documents_verified boolean DEFAULT false NOT NULL`);
    console.log('✅ Added documents_verified column');
    
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture varchar(500)`);
    console.log('✅ Added profile_picture column');
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

addColumns();
