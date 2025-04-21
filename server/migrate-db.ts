import { pool } from "./db";

async function migrate() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Starting database migration...');
    
    // Check if google_place_id column exists in restaurants table
    const checkGooglePlaceIdColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'google_place_id'
    `);
    
    if (checkGooglePlaceIdColumn.rows.length === 0) {
      console.log('Adding google_place_id column to restaurants table');
      await client.query(`
        ALTER TABLE restaurants 
        ADD COLUMN google_place_id TEXT
      `);
    }
    
    // Check if website column exists in restaurants table
    const checkWebsiteColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'website'
    `);
    
    if (checkWebsiteColumn.rows.length === 0) {
      console.log('Adding website column to restaurants table');
      await client.query(`
        ALTER TABLE restaurants 
        ADD COLUMN website TEXT
      `);
    }
    
    // Check if phone_number column exists in restaurants table
    const checkPhoneNumberColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'phone_number'
    `);
    
    if (checkPhoneNumberColumn.rows.length === 0) {
      console.log('Adding phone_number column to restaurants table');
      await client.query(`
        ALTER TABLE restaurants 
        ADD COLUMN phone_number TEXT
      `);
    }
    
    // Check if opening_hours column exists in restaurants table
    const checkOpeningHoursColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' AND column_name = 'opening_hours'
    `);
    
    if (checkOpeningHoursColumn.rows.length === 0) {
      console.log('Adding opening_hours column to restaurants table');
      await client.query(`
        ALTER TABLE restaurants 
        ADD COLUMN opening_hours JSONB DEFAULT '[]'
      `);
    }
    
    // Check if saved_restaurants table exists
    const checkSavedRestaurantsTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'saved_restaurants'
    `);
    
    if (checkSavedRestaurantsTable.rows.length === 0) {
      console.log('Creating saved_restaurants table');
      await client.query(`
        CREATE TABLE saved_restaurants (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
          is_public BOOLEAN NOT NULL DEFAULT TRUE,
          notes TEXT,
          priority INTEGER DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
    
  } catch (err) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    // Release the client
    client.release();
  }
}

// Run the migration
migrate()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration process failed:', err);
    process.exit(1);
  });