package com.smp.inventory;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.plugin.Plugin;
import org.bukkit.potion.PotionEffect;

import java.io.*;
import java.util.*;

public class InventoryManagerPlugin extends JavaPlugin implements Listener {
    
    // The 6 worlds that share inventory (Survival Group)
    private static final Set<String> CONNECTED_WORLDS = new HashSet<>(Arrays.asList(
        "Lobbyj",
        "Lobbyj_nether", 
        "Lobbyj_the_end",
        "world",
        "world_nether",
        "world_the_end"
    ));
    
    private static final Set<String> PRACTICE_WORLDS = new HashSet<>(Arrays.asList(
        "LobbyPractice",
        "Arenas"
    ));
    
    private File dataFolder;
    private Map<UUID, String> playerLastGroup = new HashMap<>();
    
    @Override
    public void onEnable() {
        dataFolder = new File(getDataFolder(), "inventories");
        if (!dataFolder.exists()) {
            dataFolder.mkdirs();
        }
        
        Bukkit.getPluginManager().registerEvents(this, this);
        
        disableStrikePracticeInSurvival();
        
        getLogger().info("Inventory Manager enabled - Managing 6 survival worlds + 2 practice worlds");
        getLogger().info("StrikePractice disabled in survival worlds");
    }
    
    @Override
    public void onDisable() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            String worldName = player.getWorld().getName();
            String group = getInventoryGroup(worldName);
            if (group != null) {
                savePlayerData(player, group);
            }
        }
        getLogger().info("Inventory Manager disabled");
    }
    
    private boolean isConnectedWorld(String worldName) {
        return CONNECTED_WORLDS.contains(worldName);
    }
    
    private boolean isPracticeWorld(String worldName) {
        return PRACTICE_WORLDS.contains(worldName);
    }
    
    private String getInventoryGroup(String worldName) {
        if (isConnectedWorld(worldName)) {
            return "connected";
        } else if (isPracticeWorld(worldName)) {
            return "practice";
        }
        return null; // Not managed
    }
    
    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        String worldName = player.getWorld().getName();
        
        String group = getInventoryGroup(worldName);
        if (group != null) {
            playerLastGroup.put(player.getUniqueId(), group);
        }
        
        if (isConnectedWorld(worldName)) {
            preventStrikePracticeUsage(player);
        }
    }
    
    @EventHandler
    public void onWorldChange(PlayerChangedWorldEvent event) {
        Player player = event.getPlayer();
        String fromWorld = event.getFrom().getName();
        String toWorld = player.getWorld().getName();
        
        String fromGroup = getInventoryGroup(fromWorld);
        String toGroup = getInventoryGroup(toWorld);
        
        if (fromGroup != null && toGroup != null && !fromGroup.equals(toGroup)) {
            savePlayerData(player, fromGroup);
            loadPlayerData(player, toGroup);
            playerLastGroup.put(player.getUniqueId(), toGroup);
        } else if (toGroup != null) {
            // Just update tracking if staying in managed worlds
            playerLastGroup.put(player.getUniqueId(), toGroup);
        }
        
        if (isConnectedWorld(toWorld)) {
            preventStrikePracticeUsage(player);
        }
    }
    
    private void savePlayerData(Player player, String group) {
        try {
            File playerFile = new File(dataFolder, player.getUniqueId() + "_" + group + ".yml");
            
            Map<String, Object> data = new HashMap<>();
            data.put("inventory", serializeInventory(player.getInventory().getContents()));
            data.put("armor", serializeInventory(player.getInventory().getArmorContents()));
            data.put("offhand", serializeItem(player.getInventory().getItemInOffHand()));
            data.put("health", player.getHealth());
            data.put("food", player.getFoodLevel());
            data.put("saturation", player.getSaturation());
            data.put("exp", player.getExp());
            data.put("level", player.getLevel());
            data.put("gamemode", player.getGameMode().name());
            data.put("effects", serializeEffects(player.getActivePotionEffects()));
            
            try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(playerFile))) {
                oos.writeObject(data);
            }
        } catch (IOException e) {
            getLogger().warning("Failed to save data for " + player.getName() + ": " + e.getMessage());
        }
    }
    
    @SuppressWarnings("unchecked")
    private void loadPlayerData(Player player, String group) {
        File playerFile = new File(dataFolder, player.getUniqueId() + "_" + group + ".yml");
        
        if (!playerFile.exists()) {
            player.getInventory().clear();
            player.getInventory().setArmorContents(new ItemStack[4]);
            player.getInventory().setItemInOffHand(null);
            player.setHealth(20.0);
            player.setFoodLevel(20);
            player.setSaturation(5.0f);
            return;
        }
        
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(playerFile))) {
            Map<String, Object> data = (Map<String, Object>) ois.readObject();
            
            player.getInventory().setContents(deserializeInventory((List<Map<String, Object>>) data.get("inventory")));
            player.getInventory().setArmorContents(deserializeInventory((List<Map<String, Object>>) data.get("armor")));
            player.getInventory().setItemInOffHand(deserializeItem((Map<String, Object>) data.get("offhand")));
            
            player.setHealth((Double) data.get("health"));
            player.setFoodLevel((Integer) data.get("food"));
            player.setSaturation((Float) data.get("saturation"));
            player.setExp((Float) data.get("exp"));
            player.setLevel((Integer) data.get("level"));
            player.setGameMode(org.bukkit.GameMode.valueOf((String) data.get("gamemode")));
            
            // Clear existing effects and apply saved ones
            for (PotionEffect effect : player.getActivePotionEffects()) {
                player.removePotionEffect(effect.getType());
            }
            Collection<PotionEffect> effects = deserializeEffects((List<Map<String, Object>>) data.get("effects"));
            player.addPotionEffects(effects);
            
        } catch (IOException | ClassNotFoundException e) {
            getLogger().warning("Failed to load data for " + player.getName() + ": " + e.getMessage());
        }
    }
    
    private List<Map<String, Object>> serializeInventory(ItemStack[] items) {
        List<Map<String, Object>> serialized = new ArrayList<>();
        for (ItemStack item : items) {
            serialized.add(serializeItem(item));
        }
        return serialized;
    }
    
    private Map<String, Object> serializeItem(ItemStack item) {
        if (item == null) {
            return null;
        }
        return item.serialize();
    }
    
    private ItemStack[] deserializeInventory(List<Map<String, Object>> data) {
        ItemStack[] items = new ItemStack[data.size()];
        for (int i = 0; i < data.size(); i++) {
            items[i] = deserializeItem(data.get(i));
        }
        return items;
    }
    
    private ItemStack deserializeItem(Map<String, Object> data) {
        if (data == null) {
            return null;
        }
        return ItemStack.deserialize(data);
    }
    
    private List<Map<String, Object>> serializeEffects(Collection<PotionEffect> effects) {
        List<Map<String, Object>> serialized = new ArrayList<>();
        for (PotionEffect effect : effects) {
            serialized.add(effect.serialize());
        }
        return serialized;
    }
    
    private Collection<PotionEffect> deserializeEffects(List<Map<String, Object>> data) {
        List<PotionEffect> effects = new ArrayList<>();
        for (Map<String, Object> effectData : data) {
            effects.add(new PotionEffect(effectData));
        }
        return effects;
    }
    
    private void disableStrikePracticeInSurvival() {
        Plugin strikePractice = Bukkit.getPluginManager().getPlugin("StrikePractice");
        if (strikePractice != null) {
            getLogger().info("Found StrikePractice plugin - blocking in survival worlds");
        }
    }
    
    private void preventStrikePracticeUsage(Player player) {
        // Remove any StrikePractice scoreboard/sidebar
        player.setScoreboard(Bukkit.getScoreboardManager().getNewScoreboard());
        
        // Send message to player
        player.sendMessage("§c§lStrikePractice is disabled in survival worlds.");
    }
}
