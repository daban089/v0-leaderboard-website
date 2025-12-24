-- Updated to use player_stats table instead of non-existent users table
ALTER TABLE player_stats ADD COLUMN custom_namecard VARCHAR(500) NULL;
