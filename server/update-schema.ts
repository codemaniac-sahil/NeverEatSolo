import { db } from './db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

async function updateSchema() {
  try {
    console.log('Creating notifications table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        related_id INTEGER,
        related_type TEXT,
        link_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating user_settings table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        theme TEXT NOT NULL DEFAULT 'dark',
        notification_preferences JSONB DEFAULT '{"messages": true, "friendRequests": true, "invitations": true, "mealReminders": true, "recommendations": true, "nearbyUsers": true}'::jsonb,
        privacy_settings JSONB DEFAULT '{"profileVisibility": "public", "locationVisibility": "friends", "availabilityVisibility": "friends", "savedRestaurantsVisibility": "friends"}'::jsonb,
        search_radius INTEGER NOT NULL DEFAULT 10,
        custom_ui JSONB DEFAULT '{}'::jsonb,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating conversations table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT NOT NULL UNIQUE,
        user1_id INTEGER NOT NULL REFERENCES users(id),
        user2_id INTEGER NOT NULL REFERENCES users(id),
        last_message_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating messages table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        conversation_id TEXT NOT NULL
      );
    `);
    
    // Add corporate tables
    console.log('Creating organizations table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT NOT NULL UNIQUE,
        logo_image TEXT,
        primary_color TEXT,
        description TEXT,
        address TEXT,
        location_lat TEXT,
        location_lng TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true,
        admin_email TEXT,
        max_employees INTEGER,
        subscription_tier TEXT NOT NULL DEFAULT 'basic'
      );
    `);
    
    console.log('Creating teams table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES organizations(id),
        name TEXT NOT NULL,
        description TEXT,
        department TEXT,
        manager_id INTEGER,
        logo_image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `);
    
    console.log('Creating workspaces table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workspaces (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES organizations(id),
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        location_lat TEXT NOT NULL,
        location_lng TEXT NOT NULL,
        floor TEXT,
        building_name TEXT,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `);
    
    console.log('Creating team_members table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS team_members (
        team_id INTEGER NOT NULL REFERENCES teams(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true,
        PRIMARY KEY (team_id, user_id)
      );
    `);
    
    console.log('Creating campus_restaurants table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS campus_restaurants (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES organizations(id),
        workspace_id INTEGER REFERENCES workspaces(id),
        name TEXT NOT NULL,
        description TEXT,
        location_details TEXT NOT NULL,
        cuisine TEXT NOT NULL,
        price_range TEXT NOT NULL,
        opening_time TEXT,
        closing_time TEXT,
        days_open JSONB DEFAULT '[]'::jsonb,
        menu_url TEXT,
        image TEXT,
        capacity INTEGER,
        average_wait_time INTEGER,
        accepts_reservations BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `);
    
    console.log('Creating corporate_events table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS corporate_events (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES organizations(id),
        team_id INTEGER REFERENCES teams(id),
        name TEXT NOT NULL,
        description TEXT,
        location_id INTEGER,
        location_type TEXT,
        external_location TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_public BOOLEAN NOT NULL DEFAULT true,
        max_participants INTEGER,
        event_type TEXT NOT NULL
      );
    `);
    
    console.log('Creating event_participants table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_participants (
        event_id INTEGER NOT NULL REFERENCES corporate_events(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'invited',
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        comment TEXT,
        PRIMARY KEY (event_id, user_id)
      );
    `);
    
    // Update users table to add corporate fields
    console.log('Updating users table with corporate fields...');
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id),
      ADD COLUMN IF NOT EXISTS work_email TEXT,
      ADD COLUMN IF NOT EXISTS job_title TEXT,
      ADD COLUMN IF NOT EXISTS department TEXT,
      ADD COLUMN IF NOT EXISTS employee_id TEXT,
      ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(id),
      ADD COLUMN IF NOT EXISTS is_corp_admin BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS use_work_profile BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS work_profile_public BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS allow_cross_department_matching BOOLEAN DEFAULT true;
    `);
    
    // Update user_availabilities table to add corporate fields
    console.log('Updating user_availabilities table with corporate fields...');
    await db.execute(sql`
      ALTER TABLE user_availabilities
      ADD COLUMN IF NOT EXISTS is_work_availability BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(id),
      ADD COLUMN IF NOT EXISTS restrict_to_team BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id),
      ADD COLUMN IF NOT EXISTS restrict_to_department BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS spontaneous BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS looking_for_new_connections BOOLEAN DEFAULT true;
    `);
    
    console.log('Schema successfully updated!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit(0);
  }
}

updateSchema();