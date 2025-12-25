import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    console.log("[v0] Received PIN:", pin)

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 })
    }

    const mysql = await import("mysql2/promise")

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })

    console.log("[v0] Database connected, querying player_stats for PIN:", pin)

    const [playerRows] = await connection.execute<any[]>(
      `SELECT username, uuid FROM player_stats WHERE verification_key = ?`,
      [pin],
    )

    console.log("[v0] Player query result:", playerRows)

    if (playerRows.length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 })
    }

    const { username, uuid } = playerRows[0]

    console.log("[v0] Found player:", { username, uuid })
    console.log("[v0] Checking discordsrv_accounts for UUID:", uuid)

    const [discordRows] = await connection.execute<any[]>(`SELECT discord FROM discordsrv_accounts WHERE uuid = ?`, [
      uuid,
    ])

    console.log("[v0] Discord query result:", discordRows)

    if (discordRows.length === 0) {
      await connection.end()
      return NextResponse.json(
        {
          error: "Discord not linked. Please use /discord link in-game first, then try again.",
        },
        { status: 403 },
      )
    }

    const discord_id = discordRows[0].discord

    console.log("[v0] Found Discord ID:", discord_id)

    await connection.execute(`UPDATE player_stats SET discord_id = ?, verification_key = NULL WHERE username = ?`, [
      discord_id,
      username,
    ])

    console.log("[v0] Verification successful:", { username, discord_id })

    await connection.end()

    return NextResponse.json({ success: true, username, discord_id })
  } catch (error) {
    console.error("[v0] Discord PIN verification error:", error)
    return NextResponse.json({ error: "Verification failed: " + String(error) }, { status: 500 })
  }
}
