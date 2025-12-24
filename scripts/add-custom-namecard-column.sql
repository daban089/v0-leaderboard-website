-- Add custom_namecard column to existing users table
ALTER TABLE users ADD COLUMN custom_namecard VARCHAR(500) NULL;
