import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

async function getConnection() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
}

export async function GET() {
  try {
    const connection = await getConnection()

    const [rows] = await connection.execute(`SELECT username FROM player_stats WHERE can_customize_namecard = TRUE`)

    await connection.end()

    const users = (rows as any[]).map((row) => row.username)
    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Error fetching allowed users:", error)
    return NextResponse.json({ error: "Failed to fetch allowed users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const connection = await getConnection()

    await connection.execute(`UPDATE player_stats SET can_customize_namecard = TRUE WHERE LOWER(username) = LOWER(?)`, [
      username,
    ])

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding allowed user:", error)
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const connection = await getConnection()

    await connection.execute(
      `UPDATE player_stats SET can_customize_namecard = FALSE, custom_namecard = NULL WHERE LOWER(username) = LOWER(?)`,
      [username],
    )

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing allowed user:", error)
    return NextResponse.json({ error: "Failed to remove user" }, { status: 500 })
  }
}
