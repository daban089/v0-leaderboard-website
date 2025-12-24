import { NextResponse } from "next/server"

interface PlayerData {
  username: string
  elo: number
  wins: number
  losses: number
  winRate: number
  winStreak: number
  totalMatches: number
  kit?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
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

      let query: string
      let params: any[] = []

      if (kit === "all") {
        query = `SELECT 
          fp.username,
          SUM(fp.is_winner) as wins,
          COUNT(*) - SUM(fp.is_winner) as losses,
          COUNT(*) as total_matches,
          GROUP_CONCAT(fp.is_winner ORDER BY fp.id DESC SEPARATOR ',') as recent_results
        FROM fight_players fp
        INNER JOIN fights f ON fp.fight = f.started
        WHERE f.mode = 'DUEL_QUEUE_RANKED'
        GROUP BY fp.username`
      } else {
        query = `SELECT 
          fp.username,
          SUM(fp.is_winner) as wins,
          COUNT(*) - SUM(fp.is_winner) as losses,
          COUNT(*) as total_matches,
          (SELECT fp2.player_data 
           FROM fight_players fp2 
           INNER JOIN fights f2 ON fp2.fight = f2.started
           WHERE fp2.username = fp.username 
           AND f2.mode = 'DUEL_QUEUE_RANKED'
           AND (f2.kit = ? OR f2.kit = ?)
           ORDER BY fp2.id DESC 
           LIMIT 1) as latest_player_data,
          GROUP_CONCAT(fp.is_winner ORDER BY fp.id DESC SEPARATOR ',') as recent_results
        FROM fight_players fp
        INNER JOIN fights f ON fp.fight = f.started
        WHERE f.mode = 'DUEL_QUEUE_RANKED' AND (f.kit = ? OR f.kit = ?)
        GROUP BY fp.username`

        const rankedKit = kit + "elo"
        params = [kit, rankedKit, kit, rankedKit]
      }

      console.log("[v0] Executing query for kit:", kit)

      const [rows] = await connection.execute<any[]>(query, params)

      console.log("[v0] Query returned rows:", rows.length)

      const players = await Promise.all(
        (rows as any[]).map(async (player) => {
          let elo = 1000

          if (kit === "all") {
            const kits = [
              { base: "sword", ranked: "swordelo" },
              { base: "axe", ranked: "axeelo" },
              { base: "sumo", ranked: "sumoelo" },
              { base: "mace", ranked: "maceelo" },
              { base: "crystalpvp", ranked: "crystalpvpelo" },
            ]
            const kitElos: number[] = []

            for (const kit of kits) {
              let foundElo = false

              const [rankedRows] = await connection.execute<any[]>(
                `SELECT fp.player_data 
               FROM fight_players fp 
               INNER JOIN fights f ON fp.fight = f.started
               WHERE fp.username = ? 
               AND f.mode = 'DUEL_QUEUE_RANKED'
               AND f.kit = ?
               ORDER BY fp.id DESC 
               LIMIT 1`,
                [player.username, kit.ranked],
              )

              if (rankedRows.length > 0) {
                try {
                  const data = JSON.parse((rankedRows[0] as any).player_data)
                  const kitElo = data.newElo || data.oldElo || 1000
                  kitElos.push(kitElo)
                  foundElo = true
                } catch (e) {
                  // Ignore parse errors
                }
              }

              if (!foundElo) {
                const [unrankedRows] = await connection.execute<any[]>(
                  `SELECT fp.player_data 
                 FROM fight_players fp 
                 INNER JOIN fights f ON fp.fight = f.started
                 WHERE fp.username = ? 
                 AND f.mode = 'DUEL_QUEUE_RANKED'
                 AND f.kit = ?
                 ORDER BY fp.id DESC 
                 LIMIT 1`,
                  [player.username, kit.base],
                )

                if (unrankedRows.length > 0) {
                  try {
                    const data = JSON.parse((unrankedRows[0] as any).player_data)
                    const kitElo = data.newElo || data.oldElo || 1000
                    kitElos.push(kitElo)
                    foundElo = true
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }

              if (!foundElo) {
                kitElos.push(1000)
              }
            }

            const sum = kitElos.reduce((a, b) => a + b, 0)
            elo = Math.floor(sum / 5)
          } else {
            try {
              if (player.latest_player_data) {
                const data = JSON.parse(player.latest_player_data)
                elo = data.newElo || data.oldElo || 1000
              }
            } catch (e) {
              console.log("[v0] Failed to parse player_data for:", player.username, e)
            }
          }

          let winStreak = 0
          if (player.recent_results) {
            const results = player.recent_results.split(",")
            for (const result of results) {
              if (result === "1") {
                winStreak++
              } else {
                break
              }
            }
          }

          const wins = Number(player.wins) || 0
          const losses = Number(player.losses) || 0
          const totalMatches = Number(player.total_matches) || 0
          const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

          return {
            username: player.username,
            wins,
            losses,
            totalMatches,
            winRate,
            elo,
            winStreak,
          }
        }),
      )

      await connection.end()

      players.sort((a, b) => b.elo - a.elo)

      const playersWithRank = players.map((player, index) => ({
        ...player,
        rank: index + 1,
      }))

      return NextResponse.json(playersWithRank)
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json([])
    }
  } catch (importError) {
    console.log("[v0] mysql2 not available in preview")
    return NextResponse.json([])
  }
}
