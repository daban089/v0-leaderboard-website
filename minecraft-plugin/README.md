# SMP Stats Plugin

A lightweight Minecraft plugin for tracking player statistics (playtime, kills, deaths) and syncing them to a MySQL database for the SMP Leaderboard website.

## Features

- 📊 Tracks player playtime, kills, and deaths
- 🔗 Syncs data to MySQL database in real-time
- ✅ `/verify` command generates 6-character verification codes for website login
- 🎮 Works with both Java and Bedrock editions (via Geyser)

## Requirements

- Spigot/Paper server (1.16+)
- MySQL database
- Java 8 or higher
- Maven (for compiling)

## Installation

1. Download or compile the plugin JAR file
2. Place `smp-stats-1.0.jar` in your server's `plugins` folder
3. Start your server (config file will be generated)
4. Stop your server and configure the database
5. Restart your server

## Configuration

Edit `plugins/SMPStats/config.yml`:

```yaml
database:
  host: your-database-host.com
  port: 3306
  database: your_database_name
  username: your_username
  password: your_password
```

### Your Current Database Details
```yaml
database:
  host: node9.partner-hosting.com
  port: 3306
  database: s602_MySQL
  username: u602_YDV9ppr7m2
  password: L4oDmnR=FPLuOtbrXuc4L!E.
```

## Database Setup

The plugin requires a `player_stats` table. Run this SQL:

```sql
CREATE TABLE player_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(16) NOT NULL UNIQUE,
    playtime_hours DECIMAL(10,2) DEFAULT 0,
    kills INT DEFAULT 0,
    deaths INT DEFAULT 0,
    verification_key VARCHAR(6),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_playtime (playtime_hours)
);
```

## Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/verify` | Generate a verification code for website login | `smpstats.verify` (default: all players) |

## How It Works

### Playtime Tracking
- Tracks when players join and quit
- Calculates playtime in hours
- Updates database on player quit

### Kill/Death Tracking
- Listens to `EntityDeathEvent`
- Only counts player kills (not mobs)
- Updates both killer's kills and victim's deaths
- Updates database immediately

### Verification System
- Players run `/verify` in-game
- Plugin generates a unique 6-character code (uppercase letters + numbers)
- Code is stored in database and shown to player
- Players use this code to log into the leaderboard website

## Compiling from Source

```bash
cd minecraft-plugin
mvn clean package
```

The compiled JAR will be in `target/smp-stats-1.0.jar`

## Permissions

- `smpstats.verify` - Allows use of `/verify` command (default: true)

## Support

If you encounter issues:
1. Check server console for error messages
2. Verify database credentials in config.yml
3. Ensure the `player_stats` table exists with correct structure
4. Check that your MySQL server allows remote connections

## Version

Current version: **1.0**

## License

This plugin is custom-built for your SMP server.
