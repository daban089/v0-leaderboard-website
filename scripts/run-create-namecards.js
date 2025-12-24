import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function createNamecardsTable() {
  try {
    console.log("Creating custom_namecards table...")

    await sql`
      CREATE TABLE IF NOT EXISTS custom_namecards (
        id SERIAL PRIMARY KEY,
        username VARCHAR(16) NOT NULL UNIQUE,
        namecard_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_username ON custom_namecards(username)
    `

    console.log("✓ custom_namecards table created successfully")
  } catch (error) {
    console.error("Error creating table:", error)
    throw error
  }
}

createNamecardsTable()
