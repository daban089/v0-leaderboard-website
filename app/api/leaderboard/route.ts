import { NextResponse } from "next/server"

interface PlayerData {
  username: string
  elo: number
  wins: number
  losses: number
  winStreak: number
  kit?: string
}

const MOCK_DATA: PlayerData[] = [
  { username: "bafr", elo: 1850, wins: 312, losses: 89, winStreak: 8, kit: "sword" },
  { username: "hamaynazymc", elo: 1720, wins: 267, losses: 102, winStreak: 5, kit: "axe" },
  { username: "Steve", elo: 1650, wins: 189, losses: 134, winStreak: 3, kit: "sumo" },
  { username: "Alex", elo: 1580, wins: 156, losses: 98, winStreak: 12, kit: "sword" },
  { username: "Herobrine", elo: 1520, wins: 245, losses: 72, winStreak: 6, kit: "axe" },
  { username: "Notch", elo: 1480, wins: 162, losses: 111, winStreak: 2, kit: "sumo" },
  { username: "Dream", elo: 1430, wins: 203, losses: 89, winStreak: 15, kit: "sword" },
  { username: "TommyInnit", elo: 1390, wins: 148, losses: 152, winStreak: 1, kit: "axe" },
  { username: "Technoblade", elo: 1340, wins: 221, losses: 65, winStreak: 9, kit: "sumo" },
  { username: "Ph1LzA", elo: 1310, wins: 155, losses: 93, winStreak: 4, kit: "sword" },
  { username: "Ranboo", elo: 1275, wins: 134, losses: 108, winStreak: 7, kit: "axe" },
  { username: "Tubbo", elo: 1240, wins: 119, losses: 127, winStreak: 0, kit: "sumo" },
  { username: "Wilbur", elo: 1210, wins: 142, losses: 95, winStreak: 3, kit: "sword" },
  { username: "Sapnap", elo: 1180, wins: 178, losses: 81, winStreak: 11, kit: "axe" },
  { username: "GeorgeNotFound", elo: 1150, wins: 98, losses: 114, winStreak: 2, kit: "sumo" },
]

function getMockDataWithRank(category: string, kit?: string) {
  let filtered = [...MOCK_DATA]

  if (kit && kit !== "all") {
    filtered = filtered.filter((p) => p.kit === kit)
  }

  if (category === "elo") {
    filtered.sort((a, b) => b.elo - a.elo)
  } else if (category === "wins") {
    filtered.sort((a, b) => b.wins - a.wins)
  } else if (category === "winstreak") {
    filtered.sort((a, b) => b.winStreak - a.winStreak)
  }

  return filtered.map((player, index) => ({
    ...player,
    rank: index + 1,
  }))
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
          console.error("[v0] Error parsing player_data JSON:", e)
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
      return NextResponse.json(getMockDataWithRank(category, kit))
    }
  } catch (importError) {
    console.log("[v0] mysql2 not available, using mock data")
    return NextResponse.json(getMockDataWithRank(category, kit))
  }
}
