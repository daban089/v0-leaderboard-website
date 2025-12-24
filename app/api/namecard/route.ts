import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function POST(request: Request) {
  try {
    const { username, gifUrl } = await request.json()

    if (!username || !gifUrl) {
      return NextResponse.json({ error: "Username and GIF URL are required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(gifUrl)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })

    // Update the user's custom namecard URL
    await connection.execute("UPDATE users SET custom_namecard = ? WHERE LOWER(username) = LOWER(?)", [
      gifUrl,
      username,
    ])

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving namecard:", error)
    return NextResponse.json({ error: "Failed to save custom namecard" }, { status: 500 })
  }
}
