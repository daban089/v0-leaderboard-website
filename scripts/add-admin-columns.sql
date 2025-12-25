ALTER TABLE player_stats ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE player_stats ADD COLUMN can_customize_namecard BOOLEAN DEFAULT FALSE;

UPDATE player_stats SET is_admin = TRUE WHERE LOWER(username) = 'bafr';
