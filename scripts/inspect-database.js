import mysql from "mysql2/promise"

async function inspectDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })

  console.log("✅ Connected to MySQL database\n")

  // List all tables
  console.log("📋 Tables in database:")
  const [tables] = await connection.query("SHOW TABLES")
  console.log(tables)
  console.log("\n")

  // Check fights table structure
  console.log("🔍 Structure of fights table:")
  const [fightsStructure] = await connection.query("DESCRIBE fights")
  console.log(fightsStructure)
  console.log("\n")

  // Check fight_players table structure
  console.log("🔍 Structure of fight_players table:")
  const [playersStructure] = await connection.query("DESCRIBE fight_players")
  console.log(playersStructure)
  console.log("\n")

  // List all users
  console.log("👥 All users in fight_players:")
  const [users] = await connection.query("SELECT DISTINCT username FROM fight_players ORDER BY username")
  console.log(users)
  console.log(`\nTotal users: ${users.length}\n`)

  // Count total fights
  console.log("⚔️ Total fights recorded:")
  const [fightCount] = await connection.query("SELECT COUNT(*) as total FROM fights")
  console.log(fightCount)
  console.log("\n")

  // Show sample fights
  console.log("📊 Sample fights (last 10):")
  const [sampleFights] = await connection.query("SELECT * FROM fights ORDER BY id DESC LIMIT 10")
  console.log(sampleFights)

  await connection.end()
}

inspectDatabase().catch(console.error)
