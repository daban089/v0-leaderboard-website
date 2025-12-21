-- Add verification_key column to existing table
ALTER TABLE player_stats 
ADD COLUMN IF NOT EXISTS verification_key VARCHAR(6) AFTER deaths;
