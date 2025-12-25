const axios = require("axios")

const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN
const GUILD_ID = process.env.SERVER_ID

const REST_API_URL = "https://discord.com/api/v10"

async function registerSlashCommands() {
  try {
    console.log("[Discord] Registering slash commands...")

    const commands = [
      {
        name: "link",
        description: "Link your Minecraft account using verification code",
        options: [
          {
            name: "code",
            description: "Your verification code from /verify",
            type: 3, // STRING type
            required: true,
          },
        ],
      },
    ]

    // Register guild commands (specific to your server)
    const response = await axios.put(`${REST_API_URL}/applications/${GUILD_ID}/guilds/${GUILD_ID}/commands`, commands, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    })

    console.log("✅ Registered /link command successfully!")
    console.log(`Commands registered: ${response.data.length}`)
  } catch (error) {
    console.error("[Discord] Error registering commands:", error.response?.data || error.message)
    process.exit(1)
  }
}

registerSlashCommands()
