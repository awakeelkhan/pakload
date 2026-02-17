const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://pakload:Khan123%40%23@13.60.13.7:5432/pakload'
});

async function addColumns() {
  try {
    // Add all potentially missing columns for loads table
    const columns = [
      `ALTER TABLE loads ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved'`,
      `ALTER TABLE loads ADD COLUMN IF NOT EXISTS approved_by INTEGER`,
      `ALTER TABLE loads ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP`,
      `ALTER TABLE loads ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,
      // Add columns for bookings table (used for bids/quotes)
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending'`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_by INTEGER`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,
    ];
    
    for (const sql of columns) {
      await pool.query(sql);
      console.log('Executed:', sql.substring(0, 60) + '...');
    }
    
    console.log('All columns added successfully');
  } catch (error) {
    console.error('Error adding columns:', error.message);
  } finally {
    await pool.end();
  }
}

addColumns();
