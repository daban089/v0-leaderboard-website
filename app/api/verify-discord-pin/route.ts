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
      `SELECT discordsrv_codes.discord_id, player_stats.username, player_stats.id 
       FROM discordsrv_codes
       JOIN discordsrv_accounts ON discordsrv_codes.discord_id = discordsrv_accounts.discord
       JOIN player_stats ON LOWER(player_stats.username) = LOWER(discordsrv_accounts.uuid)
       WHERE discordsrv_codes.code = ? AND discordsrv_codes.expiry > NOW()`,
      [pin],
    )

    if (codeRows.length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Invalid or expired PIN" }, { status: 401 })
    }

    const { discord_id, username } = codeRows[0]

    // Link Discord ID to player account
    await connection.execute(`UPDATE player_stats SET discord_id = ? WHERE username = ?`, [discord_id, username])

    // Mark code as used
    await connection.execute(`DELETE FROM discordsrv_codes WHERE code = ?`, [pin])

    await connection.end()

    return NextResponse.json({ success: true, username, discord_id })
  } catch (error) {
    console.error("[v0] Discord PIN verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
