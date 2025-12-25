const { Client, IntentsBitField } = require("discord.js")
const mysql = require("mysql2/promise")

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
})

const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN
const GUILD_ID = process.env.SERVER_ID
const VERIFY_CHANNEL_ID = process.env.VERIFY_CHANNEL_ID

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

  // Validate code format (4 digits for DiscordSRV)
  if (!/^[0-9]{4}$/.test(code)) {
    await message.reply("❌ Invalid code format. Please enter a 4-digit code from `/discord link`.")
    return
  }

  try {
    const connection = await pool.getConnection()

    // Check if code exists in discordsrv_codes and get the UUID
    const [codeResult] = await connection.query("SELECT uuid, expiration FROM discordsrv_codes WHERE code = ?", [code])

    if (codeResult.length === 0) {
      connection.release()
      await message.reply("❌ Code not found. Please generate a new code with `/discord link` in-game.")
      return
    }

    const codeData = codeResult[0]
    const uuid = codeData.uuid

    // Check if code is expired
    if (new Date(codeData.expiration) < new Date()) {
      connection.release()
      await message.reply("❌ Code has expired. Please generate a new code with `/discord link` in-game.")
      return
    }

    // Get player name from UUID (query player_stats by UUID or however you store it)
    // Also link the Discord ID in discordsrv_accounts
    const [accountResult] = await connection.query("SELECT uuid FROM discordsrv_accounts WHERE uuid = ?", [uuid])

    if (accountResult.length === 0) {
      // First time linking - insert into discordsrv_accounts
      await connection.query("INSERT INTO discordsrv_accounts (uuid, discord) VALUES (?, ?)", [uuid, message.author.id])
    } else {
      // Already has account - update Discord ID
      await connection.query("UPDATE discordsrv_accounts SET discord = ? WHERE uuid = ?", [message.author.id, uuid])
    }

    connection.release()

    await message.reply(`✅ Successfully linked your Discord account! You can now use this code on the website.`)
    console.log(`[Discord Bot] Linked UUID ${uuid} to Discord user ${message.author.tag}`)
  } catch (error) {
    console.error("[Discord Bot] Error processing code:", error)
    await message.reply("❌ An error occurred while linking your account. Please try again.")
  }
})

client.login(DISCORD_BOT_TOKEN)
