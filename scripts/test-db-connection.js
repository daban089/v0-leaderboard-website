import mysql from "mysql2/promise"

async function testDatabaseConnection() {
  console.log("[v0] Testing database connection...")
  console.log("[v0] Host:", process.env.MYSQL_HOST)
  console.log("[v0] User:", process.env.MYSQL_USER)
  console.log("[v0] Database:", process.env.MYSQL_DATABASE)

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })

    console.log("[v0] ✓ Successfully connected to database!")

    // Test query - get all tables
    const [tables] = await connection.execute("SHOW TABLES")
    console.log("[v0] Tables in database:", tables.length)

    // Test query - get player count
    const [players] = await connection.execute("SELECT COUNT(*) as count FROM fight_players")
    console.log("[v0] Total fight records:", players[0].count)

    // Test query - get unique players
    const [uniquePlayers] = await connection.execute("SELECT COUNT(DISTINCT username) as count FROM fight_players")
    console.log("[v0] Unique players:", uniquePlayers[0].count)

    await connection.end()
    console.log("[v0] ✓ Database connection test completed successfully!")
  } catch (error) {
    console.error("[v0] ✗ Database connection failed:", error.message)
    console.error("[v0] Full error:", error)
    process.exit(1)
  }
}

testDatabaseConnection()
