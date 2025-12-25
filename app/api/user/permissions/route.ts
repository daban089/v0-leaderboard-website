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
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const connection = await getConnection()

    const [rows] = await connection.execute(
      `SELECT is_admin, can_customize_namecard FROM player_stats WHERE LOWER(username) = LOWER(?)`,
      [username],
    )

    await connection.end()

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ is_admin: false, can_customize_namecard: false })
    }

    const user = (rows as any[])[0]
    return NextResponse.json({
      is_admin: !!user.is_admin,
      can_customize_namecard: !!user.can_customize_namecard,
    })
  } catch (error) {
    console.error("[v0] Error fetching permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
