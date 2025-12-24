import mysql from "mysql2/promise"

async function addCustomNamecardColumn() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })

  try {
    console.log("Adding custom_namecard column to users table...")
    await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_namecard VARCHAR(500) DEFAULT NULL")
    console.log("✓ custom_namecard column added successfully")
  } catch (error) {
    console.error("Error adding column:", error)
  } finally {
    await connection.end()
  }
}

addCustomNamecardColumn()
