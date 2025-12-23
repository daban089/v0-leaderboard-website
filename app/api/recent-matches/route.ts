import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })

    // Fetch the 20 most recent fights with winner/loser names
    const [rows] = await connection.execute(
      `
      SELECT 
        f.id,
        f.kit,
        f.timestamp,
        f.winner_uuid,
        f.loser_uuid,
        winner.username as winner,
        loser.username as loser
      FROM fights f
      LEFT JOIN fight_players winner ON f.winner_uuid = winner.uuid AND f.kit = winner.kit
      LEFT JOIN fight_players loser ON f.loser_uuid = loser.uuid AND f.kit = loser.kit
      ORDER BY f.timestamp DESC
      LIMIT 20
    `,
    )

    await connection.end()

    const matches = (rows as any[]).map((row) => ({
      id: row.id.toString(),
      winner: row.winner || "Unknown",
      loser: row.loser || "Unknown",
      winnerEloChange: Math.floor(Math.random() * 21) + 10, // TODO: Calculate real ELO changes
      loserEloChange: -(Math.floor(Math.random() * 21) + 10), // TODO: Calculate real ELO changes
      kit: row.kit,
      timestamp: new Date(row.timestamp).toISOString(),
    }))

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("Failed to fetch recent matches:", error)
    return NextResponse.json({ matches: [] }, { status: 500 })
  }
}
