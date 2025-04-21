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
    
    // Check if friends table exists
    const checkFriendsTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'friends'
    `);
    
    if (checkFriendsTable.rows.length === 0) {
      console.log('Creating friends table');
      await client.query(`
        CREATE TABLE friends (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          friend_id INTEGER NOT NULL REFERENCES users(id),
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Check if dining_circles table exists
    const checkDiningCirclesTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'dining_circles'
    `);
    
    if (checkDiningCirclesTable.rows.length === 0) {
      console.log('Creating dining_circles table');
      await client.query(`
        CREATE TABLE dining_circles (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_by INTEGER NOT NULL REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          is_private BOOLEAN NOT NULL DEFAULT FALSE,
          image TEXT
        )
      `);
    }
    
    // Check if dining_circle_members table exists
    const checkDiningCircleMembersTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'dining_circle_members'
    `);
    
    if (checkDiningCircleMembersTable.rows.length === 0) {
      console.log('Creating dining_circle_members table');
      await client.query(`
        CREATE TABLE dining_circle_members (
          dining_circle_id INTEGER NOT NULL REFERENCES dining_circles(id),
          user_id INTEGER NOT NULL REFERENCES users(id),
          role TEXT NOT NULL DEFAULT 'member',
          joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
          PRIMARY KEY (dining_circle_id, user_id)
        )
      `);
    }
    
    // Check if user_availabilities table exists
    const checkUserAvailabilitiesTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_availabilities'
    `);
    
    if (checkUserAvailabilitiesTable.rows.length === 0) {
      console.log('Creating user_availabilities table');
      await client.query(`
        CREATE TABLE user_availabilities (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          status TEXT NOT NULL DEFAULT 'unavailable',
          start_time TIMESTAMP NOT NULL DEFAULT NOW(),
          end_time TIMESTAMP,
          notes TEXT,
          visibility TEXT NOT NULL DEFAULT 'public',
          location_lat TEXT,
          location_lng TEXT,
          preferred_radius INTEGER,
          preferred_cuisines JSONB DEFAULT '[]',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Check if restaurant_recommendations table exists
    const checkRestaurantRecommendationsTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'restaurant_recommendations'
    `);
    
    if (checkRestaurantRecommendationsTable.rows.length === 0) {
      console.log('Creating restaurant_recommendations table');
      await client.query(`
        CREATE TABLE restaurant_recommendations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
          score INTEGER NOT NULL DEFAULT 0,
          reason TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          viewed_at TIMESTAMP
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