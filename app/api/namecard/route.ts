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

export async function POST(request: Request) {
  try {
    const { username, gifUrl, colors } = await request.json()

    if (!username || !gifUrl) {
      return NextResponse.json({ error: "Username and GIF URL are required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(gifUrl)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const connection = await getConnection()

    const colorsJson = colors ? JSON.stringify(colors) : null
    await connection.execute(
      `UPDATE player_stats SET custom_namecard = ?, namecard_colors = ? WHERE LOWER(username) = LOWER(?)`,
      [gifUrl, colorsJson, username],
    )

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving namecard:", error)
    return NextResponse.json({ error: "Failed to save custom namecard" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const connection = await getConnection()

    const [rows] = await connection.execute(
      `SELECT username, custom_namecard, namecard_colors FROM player_stats WHERE custom_namecard IS NOT NULL`,
    )

    await connection.end()

    const namecards: Record<string, { url: string; colors: string[] }> = {}
    ;(rows as any[]).forEach((row: any) => {
      namecards[row.username.toLowerCase()] = {
        url: row.custom_namecard,
        colors: row.namecard_colors ? JSON.parse(row.namecard_colors) : ["#ff6b35", "#f7931e", "#c1121f"],
      }
    })

    return NextResponse.json(namecards)
  } catch (error) {
    console.error("[v0] Error fetching namecards:", error)
    return NextResponse.json({ error: "Failed to fetch namecards" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const connection = await getConnection()

    await connection.execute(
      `UPDATE player_stats SET custom_namecard = NULL, namecard_colors = NULL WHERE LOWER(username) = LOWER(?)`,
      [username],
    )

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing namecard:", error)
    return NextResponse.json({ error: "Failed to remove custom namecard" }, { status: 500 })
  }
}
