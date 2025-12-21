import { NextResponse } from "next/server"

interface PlayerData {
  username: string
  elo: number
  wins: number
  losses: number
  winStreak: number
  kit?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "elo"
  const kit = searchParams.get("kit") || "all"

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

      const kitFilter = kit && kit !== "all" ? "AND f.kit = ?" : ""
      const params = kit && kit !== "all" ? [kit] : []

      const [rows] = await connection.execute<any[]>(
        `SELECT 
          fp.username,
          f.kit,
          SUM(fp.is_winner) as wins,
          COUNT(*) - SUM(fp.is_winner) as losses,
          fp.player_data
        FROM fight_players fp
        JOIN fights f ON fp.fight = f.id
        ${kitFilter}
        GROUP BY fp.username, f.kit`,
        params,
      )

      const playersWithElo = (rows as any[]).map((player) => {
        let elo = 1000

        try {
          const data = JSON.parse(player.player_data)
          elo = data.newElo || data.oldElo || 1000
        } catch (e) {
          // Keep default ELO if parsing fails
        }

        return {
          username: player.username,
          wins: player.wins,
          losses: player.losses,
          elo: elo,
          kit: player.kit,
        }
      })

      const playersWithStreaks = await Promise.all(
        playersWithElo.map(async (player) => {
          const streakParams = kit && kit !== "all" ? [player.username, kit] : [player.username]
          const streakKitFilter = kit && kit !== "all" ? "AND f.kit = ?" : ""

          const [streakRows] = await connection.execute<any[]>(
            `SELECT fp.is_winner 
             FROM fight_players fp 
             JOIN fights f ON fp.fight = f.id
             WHERE fp.username = ? ${streakKitFilter}
             ORDER BY fp.id DESC 
             LIMIT 20`,
            streakParams,
          )

          let currentStreak = 0
          for (const match of streakRows as any[]) {
            if (match.is_winner === 1) {
              currentStreak++
            } else {
              break
            }
          }

          return {
            ...player,
            winStreak: currentStreak,
          }
        }),
      )

      await connection.end()

      const sorted = [...playersWithStreaks]
      if (category === "elo") {
        sorted.sort((a, b) => b.elo - a.elo)
      } else if (category === "wins") {
        sorted.sort((a, b) => b.wins - a.wins)
      } else if (category === "winstreak") {
        sorted.sort((a, b) => b.winStreak - a.winStreak)
      }

      const playersWithRank = sorted.map((player, index) => ({
        ...player,
        rank: index + 1,
      }))

      return NextResponse.json(playersWithRank)
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json([])
    }
  } catch (importError) {
    console.log("[v0] mysql2 not available")
    return NextResponse.json([])
  }
}
