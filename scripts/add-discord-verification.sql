-- Add Discord ID column to store linked Discord accounts
ALTER TABLE player_stats ADD COLUMN discord_id VARCHAR(255) NULL UNIQUE;

-- Add verification code column for temporary codes
ALTER TABLE player_stats ADD COLUMN verification_code VARCHAR(10) NULL UNIQUE;

-- Add verification code expiry timestamp
ALTER TABLE player_stats ADD COLUMN verification_code_expires_at TIMESTAMP NULL;

-- Create index for faster verification lookups
CREATE INDEX idx_verification_code ON player_stats(verification_code);
CREATE INDEX idx_discord_id ON player_stats(discord_id);
