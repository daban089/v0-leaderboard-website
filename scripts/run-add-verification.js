import mysql from "mysql2/promise"

const connection = await mysql.createConnection({
  host: "node9.partner-hosting.com",
  port: 3306,
  user: "u602_YDV9ppr7m2",
  password: "L4oDmnR=FPLuOtbrXuc4L!E.",
  database: "s602_MySQL",
})

console.log("[v0] Connected to MySQL database")

// Add verification_key column if it doesn't exist
const alterQuery = `
  ALTER TABLE player_stats 
  ADD COLUMN verification_key VARCHAR(6) AFTER deaths;
`

try {
  await connection.execute(alterQuery)
  console.log("[v0] Successfully added verification_key column")
} catch (error) {
  if (error.code === "ER_DUP_FIELDNAME") {
    console.log("[v0] verification_key column already exists")
  } else {
    console.error("[v0] Error adding column:", error.message)
  }
}

await connection.end()
console.log("[v0] Database connection closed")
