import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from server/.env
dotenv.config({ path: './server/.env' });

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('🔗 Connecting to database:', connectionString.replace(/:[^:@]+@/, ':****@'));

export default {
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false,
    } : false,
  },
  verbose: true,
  strict: true,
} satisfies Config;
