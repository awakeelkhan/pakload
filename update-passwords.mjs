import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function updatePasswords() {
  try {
    const carrierHash = await bcrypt.hash('carrier123', 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [carrierHash, 'demo@pakload.com']);
    console.log('Updated demo@pakload.com password to carrier123');
    
    const adminHash = await bcrypt.hash('admin123', 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [adminHash, 'admin@pakload.com']);
    console.log('Updated admin@pakload.com password to admin123');
    
    const shipperHash = await bcrypt.hash('shipper123', 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [shipperHash, 'shipper@pakload.com']);
    console.log('Updated shipper@pakload.com password to shipper123');
    
    console.log('All passwords updated successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

updatePasswords();
