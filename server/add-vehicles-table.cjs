const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://pakload:Khan123%40%23@13.60.13.7:5432/pakload'
});

async function createVehiclesTable() {
  try {
    // Create vehicle_status enum if it doesn't exist
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('vehicle_status enum created or already exists');

    // Create vehicles table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        carrier_id INTEGER NOT NULL REFERENCES users(id),
        type VARCHAR(100) NOT NULL,
        registration_number VARCHAR(50) NOT NULL UNIQUE,
        capacity DECIMAL(10, 2) NOT NULL,
        current_location VARCHAR(255),
        status vehicle_status NOT NULL DEFAULT 'active',
        last_maintenance TIMESTAMP,
        next_maintenance TIMESTAMP,
        fuel_type VARCHAR(50),
        insurance_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    await pool.query(createTableSQL);
    console.log('vehicles table created or already exists');
    
    // Create index on carrier_id for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_carrier_id ON vehicles(carrier_id)
    `);
    console.log('Index on carrier_id created');
    
    // Create index on status for filtering
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)
    `);
    console.log('Index on status created');
    
    console.log('Vehicles table setup complete!');
  } catch (error) {
    console.error('Error creating vehicles table:', error.message);
  } finally {
    await pool.end();
  }
}

createVehiclesTable();
