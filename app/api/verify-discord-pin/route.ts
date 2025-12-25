import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

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

    const [playerRows] = await connection.execute<any[]>(
      `SELECT username, uuid FROM player_stats WHERE verification_key = ?`,
      [pin],
    )

    if (playerRows.length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 })
    }

    const { username, uuid } = playerRows[0]

    const [discordRows] = await connection.execute<any[]>(`SELECT discord FROM discordsrv_accounts WHERE uuid = ?`, [
      uuid,
    ])

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

    await connection.execute(`UPDATE player_stats SET discord_id = ?, verification_key = NULL WHERE username = ?`, [
      discord_id,
      username,
    ])

    console.error("[v0] Verification successful:", { username, discord_id })

    await connection.end()

    return NextResponse.json({ success: true, username, discord_id })
  } catch (error) {
    console.error("Discord PIN verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
