import { type NextRequest, NextResponse } from "next/server"
import { verifyKey } from "discord-interactions"
import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY

export async function POST(request: NextRequest) {
  // Verify Discord request signature
  const signature = request.headers.get("x-signature-ed25519") || ""
  const timestamp = request.headers.get("x-signature-timestamp") || ""
  const body = await request.text()

  if (!verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY || "")) {
    return NextResponse.json({ error: "Invalid request signature" }, { status: 401 })
  }

  const interaction = JSON.parse(body)

  // Handle ping
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 })
  }

  // Handle slash command
  if (interaction.type === 2) {
    const { name, options } = interaction.data
    const discordId = interaction.member.user.id
    const discordUsername = interaction.member.user.username

    if (name === "link") {
      const code = options[0]?.value

      if (!code) {
        return NextResponse.json({
          type: 4,
          data: {
            content: "❌ Please provide a verification code!",
            flags: 64, // ephemeral (only visible to user)
          },
        })
      }

      try {
        const connection = await pool.getConnection()

        // Find player with this code
        const [codeResult] = await connection.query(
          "SELECT username FROM player_stats WHERE verification_code = ? AND verification_code_expires_at > NOW()",
          [code],
        )

        if (codeResult.length === 0) {
          connection.release()
          return NextResponse.json({
            type: 4,
            data: {
              content: "❌ Invalid or expired verification code!",
              flags: 64,
            },
          })
        }

        const username = codeResult[0].username

        // Check if Discord is already linked to another account
        const [existingLink] = await connection.query(
          "SELECT username FROM player_stats WHERE discord_id = ? AND username != ?",
          [discordId, username],
        )

        if (existingLink.length > 0) {
          connection.release()
          return NextResponse.json({
            type: 4,
            data: {
              content: `❌ Your Discord is already linked to ${existingLink[0].username}!`,
              flags: 64,
            },
          })
        }

        // Link Discord to player and clear the code
        await connection.query(
          "UPDATE player_stats SET discord_id = ?, verification_code = NULL, verification_code_expires_at = NULL WHERE verification_code = ?",
          [discordId, code],
        )

        connection.release()

        return NextResponse.json({
          type: 4,
          data: {
            content: `✅ Success! Discord account **${discordUsername}** linked to **${username}**!`,
            flags: 64,
          },
        })
      } catch (error) {
        console.error("[v0] Discord interaction error:", error)
        return NextResponse.json({
          type: 4,
          data: {
            content: "❌ An error occurred. Please try again!",
            flags: 64,
          },
        })
      }
    }
  }

  return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 })
}
