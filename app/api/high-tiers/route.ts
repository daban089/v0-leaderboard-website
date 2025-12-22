import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mysql = await import("mysql2/promise")

    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        port: 3306,
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      })

      const [rows] = await connection.execute<any[]>(`SELECT rank, username FROM high_tiers ORDER BY rank ASC`)

      await connection.end()

      return NextResponse.json(rows)
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json([])
    }
  } catch (importError) {
    console.log("[v0] mysql2 not available in preview")
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const { rank, username } = await request.json()

    if (!rank || !username) {
      return NextResponse.json({ error: "Missing rank or username" }, { status: 400 })
    }

    const mysql = await import("mysql2/promise")

    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        port: 3306,
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      })

      await connection.execute(
        `INSERT INTO high_tiers (rank, username) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE rank = VALUES(rank), updated_at = CURRENT_TIMESTAMP`,
        [rank, username],
      )

      await connection.end()

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (importError) {
    console.log("[v0] mysql2 not available in preview")
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 })
    }

    const mysql = await import("mysql2/promise")

    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        port: 3306,
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      })

      await connection.execute(`DELETE FROM high_tiers WHERE username = ?`, [username])

      await connection.end()

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (importError) {
    console.log("[v0] mysql2 not available in preview")
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
  }
}
