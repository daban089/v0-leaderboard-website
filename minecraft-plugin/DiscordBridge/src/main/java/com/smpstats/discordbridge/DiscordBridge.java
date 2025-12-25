package com.smpstats.discordbridge;

import github.scarsz.discordsrv.DiscordSRV;
import github.scarsz.discordsrv.api.Subscribe;
import github.scarsz.discordsrv.api.events.AccountLinkCodeGenerateEvent;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class DiscordBridge extends JavaPlugin {

    private String mysqlHost;
    private String mysqlDatabase;
    private String mysqlUser;
    private String mysqlPassword;
    private int mysqlPort;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        
        mysqlHost = getConfig().getString("mysql.host", "localhost");
        mysqlPort = getConfig().getInt("mysql.port", 3306);
        mysqlDatabase = getConfig().getString("mysql.database", "smpstats");
        mysqlUser = getConfig().getString("mysql.user", "root");
        mysqlPassword = getConfig().getString("mysql.password", "");
        
        createTable();
        
        // Subscribe to DiscordSRV events
        DiscordSRV.api.subscribe(this);
        
        getLogger().info("DiscordBridge enabled! Listening for DiscordSRV code generation.");
    }

    @Override
    public void onDisable() {
        DiscordSRV.api.unsubscribe(this);
    }

    private Connection getConnection() throws Exception {
        String url = "jdbc:mysql://" + mysqlHost + ":" + mysqlPort + "/" + mysqlDatabase;
        return DriverManager.getConnection(url, mysqlUser, mysqlPassword);
    }

    private void createTable() {
        try (Connection conn = getConnection()) {
            String sql = "CREATE TABLE IF NOT EXISTS website_verifications (" +
                    "id INT PRIMARY KEY AUTO_INCREMENT, " +
                    "code VARCHAR(4), " +
                    "uuid VARCHAR(36), " +
                    "username VARCHAR(16), " +
                    "discord_id VARCHAR(20), " +
                    "verified BOOLEAN DEFAULT FALSE, " +
                    "expiration BIGINT, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")";
            conn.createStatement().execute(sql);
            getLogger().info("Database table ready.");
        } catch (Exception e) {
            getLogger().severe("Failed to create table: " + e.getMessage());
        }
    }

    @Subscribe
    public void onCodeGenerate(AccountLinkCodeGenerateEvent event) {
        String code = event.getCode(); // Get the code DiscordSRV generated
        String uuid = event.getPlayer().getUniqueId().toString();
        String username = event.getPlayer().getName();
        long expiration = System.currentTimeMillis() + (10 * 60 * 1000); // 10 minutes
        
        saveToDatabase(code, uuid, username, expiration);
        
        getLogger().info("Captured code for " + username + ": " + code);
    }

    private void saveToDatabase(String code, String uuid, String username, long expiration) {
        Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
            try (Connection conn = getConnection()) {
                // Delete old codes for this UUID
                String deleteSql = "DELETE FROM website_verifications WHERE uuid = ?";
                PreparedStatement deleteStmt = conn.prepareStatement(deleteSql);
                deleteStmt.setString(1, uuid);
                deleteStmt.executeUpdate();
                
                String sql = "INSERT INTO website_verifications (code, uuid, username, verified, expiration) VALUES (?, ?, ?, FALSE, ?)";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, code);
                stmt.setString(2, uuid);
                stmt.setString(3, username);
                stmt.setLong(4, expiration);
                stmt.executeUpdate();
                
                getLogger().info("Saved to database: " + username + " with code " + code);
            } catch (Exception e) {
                getLogger().severe("Failed to save: " + e.getMessage());
            }
        });
    }
}
