const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://pakload:Khan123%40%23@13.60.13.7:5432/pakload'
});

async function addColumn() {
  try {
    await pool.query(`ALTER TABLE loads ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved'`);
    console.log('Column approval_status added successfully');
  } catch (error) {
    console.error('Error adding column:', error.message);
  } finally {
    await pool.end();
  }
}

addColumn();
