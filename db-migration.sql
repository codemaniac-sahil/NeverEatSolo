-- Update the users table to add missing columns for preferences
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS dietary_restrictions json DEFAULT '[]'::json,
ADD COLUMN IF NOT EXISTS cuisine_preferences json DEFAULT '[]'::json,
ADD COLUMN IF NOT EXISTS dining_styles json DEFAULT '[]'::json;