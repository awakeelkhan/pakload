import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

// IMPORTANT: load env BEFORE anything else
dotenv.config({ path: './server/.env' });
// Database connection configuration
const connectionString = process.env.DATABASE_URL;
// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false, // SSL disabled for local/EC2 PostgreSQL
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Export schema
export * from './schema.js';

// Test connection function
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}
