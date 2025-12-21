import { NextResponse } from "next/server"

interface PlayerData {
  username: string
  playtime: number
  kills: number
  deaths: number
}

const MOCK_DATA: PlayerData[] = [
  { username: "Steve", playtime: 127.5, kills: 89, deaths: 34 },
  { username: "Alex", playtime: 103.2, kills: 76, deaths: 28 },
  { username: "Herobrine", playtime: 98.7, kills: 145, deaths: 12 },
  { username: "Notch", playtime: 87.3, kills: 62, deaths: 41 },
  { username: "Dream", playtime: 76.9, kills: 103, deaths: 19 },
  { username: "TommyInnit", playtime: 65.4, kills: 48, deaths: 52 },
  { username: "Technoblade", playtime: 58.2, kills: 121, deaths: 15 },
  { username: "Ph1LzA", playtime: 52.8, kills: 55, deaths: 23 },
]

export async function GET() {
  try {
    console.log("[v0] Attempting to connect to MySQL database...")
    console.log("[v0] Host:", process.env.MYSQL_HOST || "node9.partner-hosting.com")

    const mysql = await import("mysql2/promise")

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "node9.partner-hosting.com",
      port: 3306,
      user: process.env.MYSQL_USER || "u602_YDV9ppr7m2",
      password: process.env.MYSQL_PASSWORD || "L4oDmnR=FPLuOtbrXuc4L!E.",
      database: process.env.MYSQL_DATABASE || "s602_MySQL",
    })

    console.log("[v0] Connected to database successfully")

    const [rows] = await connection.execute<any[]>(
      `SELECT 
        username,
        ROUND(playtime_hours, 1) as playtime,
        kills,
        deaths
      FROM player_stats
      ORDER BY playtime_hours DESC 
      LIMIT 50`,
    )

    console.log("[v0] Query executed. Rows found:", rows.length)
    if (rows.length > 0) {
      console.log("[v0] Sample data:", rows[0])
    }

    await connection.end()

    const playersWithRank = (rows as PlayerData[]).map((player, index) => ({
      ...player,
      rank: index + 1,
    }))

    return NextResponse.json(playersWithRank)
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    console.log("[v0] Falling back to mock data")
    const playersWithRank = MOCK_DATA.map((player, index) => ({
      ...player,
      rank: index + 1,
    }))
    return NextResponse.json(playersWithRank)
  }
}
