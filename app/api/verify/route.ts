import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { verificationKey } = await request.json()

    if (!verificationKey) {
      return NextResponse.json({ error: "Verification key required" }, { status: 400 })
    }

    console.log("[v0] Verifying key:", verificationKey)

    const mysql = await import("mysql2/promise")

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "node9.partner-hosting.com",
      port: 3306,
      user: process.env.MYSQL_USER || "u602_YDV9ppr7m2",
      password: process.env.MYSQL_PASSWORD || "L4oDmnR=FPLuOtbrXuc4L!E.",
      database: process.env.MYSQL_DATABASE || "s602_MySQL",
    })

    const [rows] = await connection.execute<any[]>(`SELECT username FROM player_stats WHERE verification_key = ?`, [
      verificationKey,
    ])

    if (rows.length > 0) {
      const username = rows[0].username

      await connection.execute(`UPDATE player_stats SET verification_key = NULL WHERE verification_key = ?`, [
        verificationKey,
      ])

      await connection.end()

      console.log("[v0] Verification successful for:", username)
      console.log("[v0] Code invalidated - one-time use enforced")
      return NextResponse.json({ success: true, username })
    } else {
      await connection.end()
      console.log("[v0] Verification failed - invalid or already used key")
      return NextResponse.json({ error: "Invalid or already used verification key" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
