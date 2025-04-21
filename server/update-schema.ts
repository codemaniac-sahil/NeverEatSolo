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
    
    console.log('Schema successfully updated!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit(0);
  }
}

updateSchema();