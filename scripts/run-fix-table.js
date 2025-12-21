import mysql from "mysql2/promise"
import fs from "fs"

async function fixTable() {
  console.log("[v0] Connecting to MySQL database...")

  const connection = await mysql.createConnection({
    host: "node9.partner-hosting.com",
    port: 3306,
    user: "u602_YDV9ppr7m2",
    password: "L4oDmnR=FPLuOtbrXuc4L!E.",
    database: "s602_MySQL",
  })

  console.log("[v0] Connected! Reading SQL script...")

  const sql = fs.readFileSync("scripts/fix-table-structure.sql", "utf8")

  console.log("[v0] Executing SQL to fix table structure...")
  await connection.query(sql)

  console.log("[v0] Table structure fixed successfully!")
  console.log("[v0] The player_stats table now has the correct columns.")

  await connection.end()
  console.log("[v0] Database connection closed")
}

fixTable().catch(console.error)
