import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json()

    if (!username || !pin || pin.length !== 4) {
      return NextResponse.json({ error: "Invalid username or PIN format" }, { status: 400 })
    }

    const mysql = await import("mysql2/promise")

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })

    const [playerRows] = await connection.execute<any[]>(
      `SELECT username, player_uuid FROM player_stats WHERE username = ? AND verification_key = ?`,
      [username, pin],
    )

    if (playerRows.length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Invalid username or PIN" }, { status: 401 })
    }

    const { player_uuid } = playerRows[0]

    const [discordRows] = await connection.execute<any[]>(`SELECT discord FROM discordsrv_accounts WHERE uuid = ?`, [
      player_uuid,
    ])

    if (discordRows.length === 0 || !discordRows[0].discord) {
      await connection.end()
      return NextResponse.json(
        {
          error: "Discord not linked. Please use /discord link in-game first, then try again.",
        },
        { status: 403 },
      )
    }

    const discord_id = discordRows[0].discord

    await connection.execute(`UPDATE player_stats SET discord_id = ?, verification_key = NULL WHERE username = ?`, [
      discord_id,
      username,
    ])

    await connection.end()

    return NextResponse.json({ success: true, username, discord_id })
  } catch (error) {
    console.error("[v0] Discord PIN verification error:", error)
    return NextResponse.json({ error: "Verification failed: " + String(error) }, { status: 500 })
  }
}
