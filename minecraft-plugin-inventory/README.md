# Inventory Manager Plugin

A Minecraft plugin that connects inventories for a specific group of 6 worlds while leaving all other worlds untouched.

## Features

- **Connected Inventory Group**: The following 6 worlds share the same inventory:
  - Lobbyj
  - Lobbyj_nether
  - Lobbyj_the_end
  - world
  - world_nether
  - world_the_end

- **All Other Worlds Unaffected**: LobbyPractice, Arenas, and any other worlds on your server use default Minecraft behavior - each keeps its own separate inventory naturally.

## How It Works

When a player is in any of the 6 connected worlds, their inventory is shared across all of them. When they move to any other world (like LobbyPractice or Arenas), the plugin saves their connected-world inventory and lets Minecraft handle the inventory for that world normally. Moving back to the connected worlds restores the shared inventory.

The plugin saves:
- Inventory contents
- Armor and offhand items
- Health, food level, and saturation
- Experience points and levels
- Game mode
- Potion effects

## Installation

1. Build the plugin using Maven: `mvn clean package`
2. Copy the generated JAR file from `target/inventory-manager-1.0.jar` to your server's `plugins` folder
3. Restart your server

## Data Storage

Player inventory data for the connected worlds is saved in `plugins/InventoryManager/inventories/` as `.yml` files.
