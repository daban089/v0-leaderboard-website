import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

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

      // Fetch ELO for each gamemode
      const kits = [
        { base: "sword", ranked: "swordelo" },
        { base: "axe", ranked: "axeelo" },
        { base: "sumo", ranked: "sumoelo" },
        { base: "mace", ranked: "maceelo" },
      ]

      const gamemodeElos: { [key: string]: number } = {}

      for (const kit of kits) {
        let elo = 1000

        // Try ranked first
        const [rankedRows] = await connection.execute<any[]>(
          `SELECT fp.player_data 
           FROM fight_players fp 
           INNER JOIN fights f ON fp.fight = f.started
           WHERE fp.username = ? 
           AND f.mode = 'DUEL_QUEUE_RANKED'
           AND f.kit = ?
           ORDER BY fp.id DESC 
           LIMIT 1`,
          [username, kit.ranked],
        )

        if (rankedRows.length > 0) {
          try {
            const data = JSON.parse((rankedRows[0] as any).player_data)
            elo = data.newElo || data.oldElo || 1000
          } catch (e) {
            // Use default
          }
        } else {
          // Try unranked if ranked doesn't exist
          const [unrankedRows] = await connection.execute<any[]>(
            `SELECT fp.player_data 
             FROM fight_players fp 
             INNER JOIN fights f ON fp.fight = f.started
             WHERE fp.username = ? 
             AND f.mode = 'DUEL_QUEUE_RANKED'
             AND f.kit = ?
             ORDER BY fp.id DESC 
             LIMIT 1`,
            [username, kit.base],
          )

          if (unrankedRows.length > 0) {
            try {
              const data = JSON.parse((unrankedRows[0] as any).player_data)
              elo = data.newElo || data.oldElo || 1000
            } catch (e) {
              // Use default
            }
          }
        }

        gamemodeElos[kit.base] = elo
      }

      await connection.end()

      return NextResponse.json({
        username,
        gamemodeElos: {
          sword: gamemodeElos.sword,
          axe: gamemodeElos.axe,
          sumo: gamemodeElos.sumo,
          mace: gamemodeElos.mace,
        },
      })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (importError) {
    console.log("[v0] mysql2 not available in preview")
    return NextResponse.json({ error: "Database not available" }, { status: 503 })
  }
}
