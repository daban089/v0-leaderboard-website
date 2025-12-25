package com.smp.stats;

import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.event.Listener;
import org.bukkit.event.EventHandler;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.ChatColor;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Random;

import net.md_5.bungee.api.chat.TextComponent;
import net.md_5.bungee.api.chat.ClickEvent;
import net.md_5.bungee.api.chat.HoverEvent;
import net.md_5.bungee.api.chat.ComponentBuilder;

public class SMPStatsPlugin extends JavaPlugin implements Listener {
    
    private Connection connection;
    private Map<UUID, Long> playerJoinTimes = new HashMap<>();
    
    @Override
    public void onEnable() {
        // Save default config
        saveDefaultConfig();
        
        // Connect to database
        connectDatabase();
        
        // Register events
        Bukkit.getPluginManager().registerEvents(this, this);
        
        getLogger().info("SMP Stats Plugin enabled!");
    }
    
    @Override
    public void onDisable() {
        // Save all online players' playtime
        for (Player player : Bukkit.getOnlinePlayers()) {
            savePlaytime(player);
        }
        
        // Close database connection
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        
        getLogger().info("SMP Stats Plugin disabled!");
    }
    
    private void connectDatabase() {
        String host = getConfig().getString("database.host");
        String port = getConfig().getString("database.port");
        String database = getConfig().getString("database.name");
        String username = getConfig().getString("database.username");
        String password = getConfig().getString("database.password");
        
        try {
            String url = "jdbc:mysql://" + host + ":" + port + "/" + database;
            connection = DriverManager.getConnection(url, username, password);
            getLogger().info("Connected to MySQL database!");
            
            // Create table if not exists
            createTable();
        } catch (SQLException e) {
            getLogger().severe("Could not connect to MySQL database!");
            e.printStackTrace();
        }
    }
    
    private void createTable() {
        String sql = "CREATE TABLE IF NOT EXISTS player_stats (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "username VARCHAR(16) UNIQUE NOT NULL," +
                    "playtime_hours DECIMAL(10,2) DEFAULT 0," +
                    "kills INT DEFAULT 0," +
                    "deaths INT DEFAULT 0," +
                    "verification_key VARCHAR(6)," +
                    "last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)";
        
        try (Statement stmt = connection.createStatement()) {
            stmt.execute(sql);
            getLogger().info("Player stats table ready!");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("discord")) {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ChatColor.RED + "Only players can use this command!");
                return true;
            }
            
            Player player = (Player) sender;
            
            // Create clickable Discord link
            TextComponent discordComponent = new TextComponent(ChatColor.AQUA + "" + ChatColor.UNDERLINE + "https://discord.gg/gzPjF9JNjn");
            discordComponent.setClickEvent(new ClickEvent(
                ClickEvent.Action.OPEN_URL, 
                "https://discord.gg/gzPjF9JNjn"
            ));
            discordComponent.setHoverEvent(new HoverEvent(
                HoverEvent.Action.SHOW_TEXT,
                new ComponentBuilder(ChatColor.YELLOW + "Click to join our Discord!").create()
            ));
            
            player.sendMessage(ChatColor.GREEN + "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
            player.sendMessage(ChatColor.GOLD + "✦ " + ChatColor.YELLOW + "Join Our Discord Server!");
            player.sendMessage("");
            player.spigot().sendMessage(discordComponent);
            player.sendMessage("");
            player.sendMessage(ChatColor.GRAY + "Click the link above to join!");
            player.sendMessage(ChatColor.GREEN + "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
            
            return true;
        }
        
        if (command.getName().equalsIgnoreCase("verify")) {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ChatColor.RED + "Only players can use this command!");
                return true;
            }
            
            Player player = (Player) sender;
            String verificationKey = generateVerificationKey();
            
            if (saveVerificationKey(player.getName(), verificationKey)) {
                TextComponent codeComponent = new TextComponent(ChatColor.GREEN + "" + ChatColor.BOLD + verificationKey);
                codeComponent.setClickEvent(new ClickEvent(
                    ClickEvent.Action.COPY_TO_CLIPBOARD, 
                    verificationKey
                ));
                codeComponent.setHoverEvent(new HoverEvent(
                    HoverEvent.Action.SHOW_TEXT,
                    new ComponentBuilder(ChatColor.YELLOW + "Click to copy!").create()
                ));
                
                player.sendMessage(ChatColor.GREEN + "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
                player.sendMessage(ChatColor.GOLD + "✦ " + ChatColor.YELLOW + "Website Verification");
                player.sendMessage("");
                player.sendMessage(ChatColor.WHITE + "Your verification code:");
                player.spigot().sendMessage(codeComponent);
                player.sendMessage("");
                player.sendMessage(ChatColor.RED + "" + ChatColor.BOLD + "⚠ IMPORTANT:");
                player.sendMessage(ChatColor.YELLOW + "• This is a ONE-TIME use code only");
                player.sendMessage(ChatColor.YELLOW + "• DO NOT share this code with anyone");
                player.sendMessage(ChatColor.YELLOW + "• Once used, you cannot verify again");
                player.sendMessage("");
                player.sendMessage(ChatColor.GRAY + "Click the code above to copy it!");
                player.sendMessage(ChatColor.GREEN + "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
            } else {
                player.sendMessage(ChatColor.RED + "Failed to generate verification code. Please try again!");
            }
            
            return true;
        }
        return false;
    }
    
    private String generateVerificationKey() {
        Random random = new Random();
        int pin = 1000 + random.nextInt(9000); // Generates 1000-9999
        return String.valueOf(pin);
    }
    
    private boolean saveVerificationKey(String username, String key) {
        String sql = "UPDATE player_stats SET verification_key = ? WHERE username = ?";
        
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, key);
            stmt.setString(2, username);
            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        playerJoinTimes.put(player.getUniqueId(), System.currentTimeMillis());
        
        // Initialize player in database if not exists
        initializePlayer(player.getName());
    }
    
    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        savePlaytime(player);
        playerJoinTimes.remove(player.getUniqueId());
    }
    
    @EventHandler
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player victim = event.getEntity();
        Player killer = victim.getKiller();
        
        // Increment death count for victim
        incrementStat(victim.getName(), "deaths");
        
        // Increment kill count for killer if exists
        if (killer != null) {
            incrementStat(killer.getName(), "kills");
        }
    }
    
    private void initializePlayer(String username) {
        String sql = "INSERT INTO player_stats (username) VALUES (?) ON DUPLICATE KEY UPDATE username=username";
        
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, username);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    private void savePlaytime(Player player) {
        Long joinTime = playerJoinTimes.get(player.getUniqueId());
        if (joinTime == null) return;
        
        long sessionTime = System.currentTimeMillis() - joinTime;
        double hoursPlayed = sessionTime / (1000.0 * 60.0 * 60.0);
        
        String sql = "UPDATE player_stats SET playtime_hours = playtime_hours + ? WHERE username = ?";
        
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setDouble(1, hoursPlayed);
            stmt.setString(2, player.getName());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    private void incrementStat(String username, String statColumn) {
        String sql = "UPDATE player_stats SET " + statColumn + " = " + statColumn + " + 1 WHERE username = ?";
        
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, username);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
