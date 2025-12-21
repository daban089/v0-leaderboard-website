import { NextResponse } from "next/server"

interface PlayerData {
  username: string
  playtime: number
  kills: number
  deaths: number
}

const MOCK_DATA: PlayerData[] = [
  { username: "bafr", playtime: 245.8, kills: 312, deaths: 89 },
  { username: "hamaynazymc", playtime: 198.3, kills: 267, deaths: 102 },
  { username: "Steve", playtime: 187.5, kills: 189, deaths: 134 },
  { username: "Alex", playtime: 165.2, kills: 156, deaths: 98 },
  { username: "Herobrine", playtime: 148.7, kills: 245, deaths: 72 },
  { username: "Notch", playtime: 137.3, kills: 162, deaths: 111 },
  { username: "Dream", playtime: 126.9, kills: 203, deaths: 89 },
  { username: "TommyInnit", playtime: 115.4, kills: 148, deaths: 152 },
  { username: "Technoblade", playtime: 108.2, kills: 221, deaths: 65 },
  { username: "Ph1LzA", playtime: 102.8, kills: 155, deaths: 93 },
  { username: "Ranboo", playtime: 95.6, kills: 134, deaths: 108 },
  { username: "Tubbo", playtime: 88.3, kills: 119, deaths: 127 },
  { username: "Wilbur", playtime: 82.1, kills: 142, deaths: 95 },
  { username: "Sapnap", playtime: 76.9, kills: 178, deaths: 81 },
  { username: "GeorgeNotFound", playtime: 71.5, kills: 98, deaths: 114 },
]

function getMockDataWithRank() {
  return MOCK_DATA.map((player, index) => ({
    ...player,
    rank: index + 1,
  }))
}

export async function GET() {
  try {
    // Try to dynamically import mysql2 - will fail in v0 preview
    const mysql = await import("mysql2/promise")

    // If import succeeds, try database connection
    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "node9.partner-hosting.com",
        port: 3306,
        user: process.env.MYSQL_USER || "u602_YDV9ppr7m2",
        password: process.env.MYSQL_PASSWORD || "L4oDmnR=FPLuOtbrXuc4L!E.",
        database: process.env.MYSQL_DATABASE || "s602_MySQL",
      })

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

      await connection.end()

      const playersWithRank = (rows as PlayerData[]).map((player, index) => ({
        ...player,
        rank: index + 1,
      }))

      return NextResponse.json(playersWithRank)
    } catch (dbError) {
      // Database connection failed, use mock data
      return NextResponse.json(getMockDataWithRank())
    }
  } catch (importError) {
    return NextResponse.json(getMockDataWithRank())
  }
}
