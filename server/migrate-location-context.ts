import { db } from "./db";
import { sql } from "drizzle-orm";

// Run this file directly with `tsx server/migrate-location-context.ts`
async function migrateDatabase() {
  console.log("Adding location context fields to users table...");
  
  try {
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS location_context text DEFAULT 'local',
      ADD COLUMN IF NOT EXISTS location_context_note text;
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrateDatabase();