const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://pakload:Khan123%40%23@13.60.13.7:5432/pakload'
});

async function addAmountColumn() {
  try {
    // Add amount column to payment_proofs table if it doesn't exist
    await pool.query(`
      ALTER TABLE payment_proofs 
      ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2)
    `);
    console.log('Amount column added to payment_proofs table');
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Error adding amount column:', error.message);
  } finally {
    await pool.end();
  }
}

addAmountColumn();
