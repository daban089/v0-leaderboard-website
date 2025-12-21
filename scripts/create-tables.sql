-- Create player_stats table for Minecraft SMP leaderboard
CREATE TABLE IF NOT EXISTS player_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(16) NOT NULL UNIQUE,
  playtime INT DEFAULT 0 COMMENT 'Total playtime in hours',
  kills INT DEFAULT 0 COMMENT 'Total player kills',
  deaths INT DEFAULT 0 COMMENT 'Total deaths',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_playtime (playtime DESC),
  INDEX idx_kills (kills DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert some sample data (optional - remove if you'll import from your Minecraft plugin)
INSERT INTO player_stats (username, playtime, kills, deaths) VALUES
  ('Steve_Builder', 342, 156, 45),
  ('Alex_Warrior', 298, 203, 67),
  ('Creeper_Hunter', 276, 189, 52),
  ('Diamond_Miner', 245, 134, 38),
  ('Enderman_Slayer', 223, 178, 61)
ON DUPLICATE KEY UPDATE username=username;
