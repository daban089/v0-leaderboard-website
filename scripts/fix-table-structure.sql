-- Drop the old table if it exists and create it with the correct structure
DROP TABLE IF EXISTS player_stats;

CREATE TABLE player_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(16) NOT NULL UNIQUE,
    playtime_hours DECIMAL(10, 2) DEFAULT 0,
    kills INT DEFAULT 0,
    deaths INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_playtime (playtime_hours DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
