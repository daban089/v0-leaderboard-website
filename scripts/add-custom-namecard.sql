-- Add custom_namecard column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_namecard VARCHAR(500) DEFAULT NULL;
