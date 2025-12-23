package com.smp.inventory;

import org.bukkit.Bukkit;
import org.bukkit.GameMode;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.*;
import java.util.*;

public class InventoryManagerPlugin extends JavaPlugin implements Listener {

    // Define world groups
    private static final Set<String> SURVIVAL_GROUP = new HashSet<>(Arrays.asList(
            "Lobbyj", "Lobbyj_nether", "Lobbyj_the_end",
            "world", "world_nether", "world_the_end"
    ));

    // Map to store player inventories: UUID -> WorldGroup -> InventoryData
    private final Map<UUID, Map<String, InventoryData>> playerInventories = new HashMap<>();
    
    private File dataFolder;

    @Override
    public void onEnable() {
        // Register events
        Bukkit.getPluginManager().registerEvents(this, this);
        
        // Create data folder for storing inventories
        dataFolder = new File(getDataFolder(), "inventories");
        if (!dataFolder.exists()) {
            dataFolder.mkdirs();
        }
        
        getLogger().info("InventoryManager has been enabled!");
        getLogger().info("Survival group worlds: " + SURVIVAL_GROUP);
    }

    @Override
    public void onDisable() {
        // Save all player inventories before shutdown
        for (Player player : Bukkit.getOnlinePlayers()) {
            savePlayerInventory(player);
        }
        
        getLogger().info("InventoryManager has been disabled!");
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        loadPlayerData(player);
        
        // Load the correct inventory for the world they're joining
        String worldGroup = getWorldGroup(player.getWorld().getName());
        loadInventory(player, worldGroup);
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPlayerQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        savePlayerInventory(player);
        
        // Clear from memory
        playerInventories.remove(player.getUniqueId());
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onWorldChange(PlayerChangedWorldEvent event) {
        Player player = event.getPlayer();
        String fromWorld = event.getFrom().getName();
        String toWorld = player.getWorld().getName();
        
        String fromGroup = getWorldGroup(fromWorld);
        String toGroup = getWorldGroup(toWorld);
        
        // If changing between different world groups, swap inventories
        if (!fromGroup.equals(toGroup)) {
            // Save current inventory to the "from" group
            saveInventoryToGroup(player, fromGroup);
            
            // Load inventory for the "to" group
            loadInventory(player, toGroup);
            
            getLogger().info(player.getName() + " switched from " + fromGroup + " to " + toGroup);
        }
    }

    /**
     * Get the world group for a given world name
     */
    private String getWorldGroup(String worldName) {
        if (SURVIVAL_GROUP.contains(worldName)) {
            return "survival";
        }
        // Each other world gets its own group
        return worldName;
    }

    /**
     * Save player's current inventory to a specific world group
     */
    private void saveInventoryToGroup(Player player, String worldGroup) {
        UUID uuid = player.getUniqueId();
        
        InventoryData data = new InventoryData();
        data.inventory = player.getInventory().getContents();
        data.armor = player.getInventory().getArmorContents();
        data.offHand = player.getInventory().getItemInOffHand();
        data.health = player.getHealth();
        data.foodLevel = player.getFoodLevel();
        data.saturation = player.getSaturation();
        data.exp = player.getExp();
        data.level = player.getLevel();
        data.gameMode = player.getGameMode();
        
        playerInventories.computeIfAbsent(uuid, k -> new HashMap<>()).put(worldGroup, data);
    }

    /**
     * Load inventory for a specific world group
     */
    private void loadInventory(Player player, String worldGroup) {
        UUID uuid = player.getUniqueId();
        
        Map<String, InventoryData> groups = playerInventories.get(uuid);
        if (groups == null || !groups.containsKey(worldGroup)) {
            // No saved inventory for this group, keep current inventory
            return;
        }
        
        InventoryData data = groups.get(worldGroup);
        
        player.getInventory().setContents(data.inventory);
        player.getInventory().setArmorContents(data.armor);
        player.getInventory().setItemInOffHand(data.offHand);
        player.setHealth(Math.min(data.health, player.getMaxHealth()));
        player.setFoodLevel(data.foodLevel);
        player.setSaturation(data.saturation);
        player.setExp(data.exp);
        player.setLevel(data.level);
        player.setGameMode(data.gameMode);
    }

    /**
     * Save all player inventories to disk
     */
    private void savePlayerInventory(Player player) {
        // Save current inventory first
        String currentGroup = getWorldGroup(player.getWorld().getName());
        saveInventoryToGroup(player, currentGroup);
        
        // Save to file
        UUID uuid = player.getUniqueId();
        Map<String, InventoryData> groups = playerInventories.get(uuid);
        
        if (groups == null || groups.isEmpty()) {
            return;
        }
        
        File playerFile = new File(dataFolder, uuid.toString() + ".dat");
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(playerFile))) {
            oos.writeObject(groups);
        } catch (IOException e) {
            getLogger().severe("Failed to save inventory for " + player.getName());
            e.printStackTrace();
        }
    }

    /**
     * Load player data from disk
     */
    @SuppressWarnings("unchecked")
    private void loadPlayerData(Player player) {
        UUID uuid = player.getUniqueId();
        File playerFile = new File(dataFolder, uuid.toString() + ".dat");
        
        if (!playerFile.exists()) {
            return;
        }
        
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(playerFile))) {
            Map<String, InventoryData> groups = (Map<String, InventoryData>) ois.readObject();
            playerInventories.put(uuid, groups);
        } catch (IOException | ClassNotFoundException e) {
            getLogger().warning("Failed to load inventory for " + player.getName());
            e.printStackTrace();
        }
    }

    /**
     * Class to store inventory data
     */
    private static class InventoryData implements Serializable {
        private static final long serialVersionUID = 1L;
        
        ItemStack[] inventory;
        ItemStack[] armor;
        ItemStack offHand;
        double health;
        int foodLevel;
        float saturation;
        float exp;
        int level;
        GameMode gameMode;
    }
}
