const { Client, IntentsBitField, ChannelType } = require("discord.js")
const axios = require("axios")
const mysql = require("mysql2/promise")

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
})

const DISCORD_BOT_TOKEN = "MTQ1MjE1NjI2MDU4NDc4NDAyNQ.GB-yBg.t_LphjXwSrR4KbvmJa7hggGMWS0RJVNFrcCQ9M"
const GUILD_ID = "873549002753343509"
const VERIFY_CHANNEL_ID = "1453641207002697758"
const WEBSITE_URL = process.env.WEBSITE_URL || "http://localhost:3000"

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
})

client.on("ready", () => {
  console.log(`[Discord Bot] Logged in as ${client.user.tag}`)
  console.log(`[Discord Bot] Listening in channel ${VERIFY_CHANNEL_ID}`)
})

client.on("messageCreate", async (message) => {
  if (message.author.bot) return
  if (message.channelId !== VERIFY_CHANNEL_ID) return

  const code = message.content.trim()

  // Validate code format (alphanumeric, 6-10 chars)
  if (!/^[a-zA-Z0-9]{6,10}$/.test(code)) {
    await message.reply("❌ Invalid code format. Codes should be 6-10 alphanumeric characters.")
    return
  }

  try {
    const connection = await pool.getConnection()

    // Check if code exists and is valid
    const [codeResult] = await connection.query(
      "SELECT username FROM player_stats WHERE verification_code = ? AND verification_code_expires_at > NOW()",
      [code],
    )

    if (codeResult.length === 0) {
      connection.release()
      await message.reply("❌ Code not found or expired. Please generate a new code with `/verify` in-game.")
      return
    }

    const username = codeResult[0].username

    // Link Discord ID
    await connection.query(
      "UPDATE player_stats SET discord_id = ?, verification_code = NULL, verification_code_expires_at = NULL WHERE verification_code = ?",
      [message.author.id, code],
    )

    connection.release()

    await message.reply(`✅ Successfully linked Discord account to **${username}**!`)
    console.log(`[Discord Bot] Linked ${username} to Discord user ${message.author.tag}`)
  } catch (error) {
    console.error("[Discord Bot] Error processing code:", error)
    await message.reply("❌ An error occurred while linking your account. Please try again.")
  }
})

client.login(DISCORD_BOT_TOKEN)
