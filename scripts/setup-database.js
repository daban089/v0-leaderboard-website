import mysql from "mysql2/promise"

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: "node9.partner-hosting.com",
    port: 3306,
    user: "u602_YDV9ppr7m2",
    password: "L4oDmnR=FPLuOtbrXuc4L!E.",
    database: "s602_MySQL",
  })

  console.log("[v0] Connected to MySQL database")

  try {
    // Create player_stats table
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    console.log('[v0] Table "player_stats" created successfully')

    // Insert sample data
    await connection.execute(`
      INSERT INTO player_stats (username, playtime, kills, deaths) VALUES
        ('Steve_Builder', 342, 156, 45),
        ('Alex_Warrior', 298, 203, 67),
        ('Creeper_Hunter', 276, 189, 52),
        ('Diamond_Miner', 245, 134, 38),
        ('Enderman_Slayer', 223, 178, 61)
      ON DUPLICATE KEY UPDATE username=username
    `)

    console.log("[v0] Sample data inserted successfully")

    // Verify the data
    const [rows] = await connection.execute("SELECT * FROM player_stats ORDER BY playtime DESC")
    console.log("[v0] Current player stats:", rows)
  } catch (error) {
    console.error("[v0] Error setting up database:", error.message)
  } finally {
    await connection.end()
    console.log("[v0] Database connection closed")
  }
}

setupDatabase()
