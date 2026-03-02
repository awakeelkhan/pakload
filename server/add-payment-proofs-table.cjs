const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://pakload:Khan123%40%23@13.60.13.7:5432/pakload'
});

async function createPaymentProofsTable() {
  try {
    // Create payment_proofs table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS payment_proofs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        transaction_ref VARCHAR(255) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        verified_by INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    await pool.query(createTableSQL);
    console.log('payment_proofs table created or already exists');
    
    // Create index on user_id for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id ON payment_proofs(user_id)
    `);
    console.log('Index created');
    
    // Create index on status for filtering
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status)
    `);
    console.log('Status index created');
    
    console.log('Payment proofs table setup complete!');
  } catch (error) {
    console.error('Error creating payment_proofs table:', error.message);
  } finally {
    await pool.end();
  }
}

createPaymentProofsTable();
