import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 })
    }

    const mysql = await import("mysql2/promise")

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "node9.partner-hosting.com",
      port: 3306,
      user: process.env.MYSQL_USER || "u602_YDV9ppr7m2",
      password: process.env.MYSQL_PASSWORD || "L4oDmnR=FPLuOtbrXuc4L!E.",
      database: process.env.MYSQL_DATABASE || "s602_MySQL",
    })

    // Query DiscordSRV codes table to find the Discord ID linked to this PIN
    const [codeRows] = await connection.execute<any[]>(
      `SELECT discordsrv_codes.discord_id, discordsrv_accounts.uuid
       FROM discordsrv_codes
       JOIN discordsrv_accounts ON discordsrv_codes.discord_id = discordsrv_accounts.discord
       WHERE discordsrv_codes.code = ? AND discordsrv_codes.expiry > NOW()`,
      [pin],
    )

    if (codeRows.length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Invalid or expired PIN" }, { status: 401 })
    }

    const { discord_id, uuid } = codeRows[0]

    // Get player by UUID from player_stats
    const [playerRows] = await connection.execute<any[]>(`SELECT username, id FROM player_stats WHERE uuid = ?`, [uuid])

    if (playerRows.length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Player not found in database" }, { status: 404 })
    }

    const { username } = playerRows[0]

    // Link Discord ID to player account
    await connection.execute(`UPDATE player_stats SET discord_id = ? WHERE uuid = ?`, [discord_id, uuid])

    // Mark code as used
    await connection.execute(`DELETE FROM discordsrv_codes WHERE code = ?`, [pin])

    await connection.end()

    return NextResponse.json({ success: true, username, discord_id })
  } catch (error) {
    console.error("[v0] Discord PIN verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
