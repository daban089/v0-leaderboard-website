import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function POST(request: NextRequest) {
  try {
    const { code, discordId } = await request.json()

    if (!code || !discordId) {
      return NextResponse.json({ error: "Missing code or discordId" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    // Check if code exists and hasn't expired
    const [codeResult] = await connection.query(
      "SELECT username FROM player_stats WHERE verification_code = ? AND verification_code_expires_at > NOW()",
      [code],
    )

    if (codeResult.length === 0) {
      connection.release()
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    const username = codeResult[0].username

    // Link Discord ID to player and delete the code
    await connection.query(
      "UPDATE player_stats SET discord_id = ?, verification_code = NULL, verification_code_expires_at = NULL WHERE verification_code = ?",
      [discordId, code],
    )

    connection.release()

    return NextResponse.json({
      success: true,
      message: `Discord account linked to ${username}`,
      username,
    })
  } catch (error) {
    console.error("[v0] Discord link error:", error)
    return NextResponse.json({ error: "Failed to link Discord account" }, { status: 500 })
  }
}
