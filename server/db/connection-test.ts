import pkg from 'pg';
const { Client } = pkg;
import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

AWS.config.update({ region: process.env.AWS_REGION || 'eu-north-1' });

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📍 Host:', process.env.DB_HOST);
  console.log('👤 User:', process.env.DB_USER);
  console.log('🗄️  Database:', process.env.DB_NAME);
  
  let password = process.env.DB_PASSWORD || '';
  
  // Use IAM authentication if enabled
  if (process.env.USE_IAM_AUTH === 'true') {
    console.log('🔐 Using AWS IAM authentication...');
    const signer = new AWS.RDS.Signer({
      region: process.env.AWS_REGION || 'eu-north-1',
      hostname: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER!
    });
    password = signer.getAuthToken({});
  } else {
    console.log('🔑 Using password authentication...');
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', res.rows[0].version);
    
    // Test creating a simple table
    await client.query('CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_time TIMESTAMP DEFAULT NOW())');
    console.log('✅ Test table created');
    
    await client.query('INSERT INTO connection_test DEFAULT VALUES');
    console.log('✅ Test insert successful');
    
    const testResult = await client.query('SELECT COUNT(*) FROM connection_test');
    console.log('✅ Test query successful. Rows:', testResult.rows[0].count);
    
    await client.query('DROP TABLE connection_test');
    console.log('✅ Test table dropped');
    
    console.log('\n🎉 Database connection test PASSED!');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection test FAILED!');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
