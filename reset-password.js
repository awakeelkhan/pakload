import bcrypt from 'bcrypt';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || '13.63.16.242',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pakload',
  user: process.env.DB_USER || 'pakload',
  password: process.env.DB_PASSWORD || 'Khan123@#',
});

async function resetPasswords() {
  const passwords = {
    'admin@pakload.com': 'admin123',
    'shipper@pakload.com': 'shipper123',
    'carrier@pakload.com': 'carrier123',
    'demo@pakload.com': 'demo123',
  };

  for (const [email, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash, email]);
    console.log(`Reset password for ${email}`);
  }

  console.log('All passwords reset successfully!');
  await pool.end();
}

resetPasswords().catch(console.error);
