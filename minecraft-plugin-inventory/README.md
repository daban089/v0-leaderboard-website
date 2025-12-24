# Inventory Manager Plugin

A Minecraft plugin that manages separate inventory groups for different world sets while keeping them completely isolated.

## Features

- **Survival Worlds Group (Connected)**: The following 6 worlds share the same inventory:
  - Lobbyj
  - Lobbyj_nether
  - Lobbyj_the_end
  - world
  - world_nether
  - world_the_end

- **Practice Worlds Group (Connected)**: The following 2 worlds share the same inventory:
  - LobbyPractice
  - Arenas

- **Complete Separation**: The survival group and practice group have completely separate inventories. Players moving between these groups will have their inventory saved and swapped automatically.

- **StrikePractice Disabled in Survival**: The StrikePractice plugin is blocked from operating in the 6 survival worlds to prevent conflicts.

## How It Works

When a player moves between worlds in the same group (e.g., from Lobbyj to world_nether), their inventory stays the same. When they move to a different group (e.g., from world to LobbyPractice), the plugin saves their current inventory and loads the inventory for that group.

When a player is in any of the 6 survival worlds, their inventory is shared across all of them. When they move to any of the 2 practice worlds (like LobbyPractice or Arenas), the plugin saves their survival-world inventory and lets Minecraft handle the inventory for that world normally. Moving back to the survival worlds restores the shared inventory. Similarly, when a player is in any of the 2 practice worlds, their inventory is shared across both. Moving to any of the 6 survival worlds saves their practice-world inventory and restores the survival-world inventory.

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

Player inventory data for the survival group is saved in `plugins/InventoryManager/inventories/survival/` as `.yml` files.
Player inventory data for the practice group is saved in `plugins/InventoryManager/inventories/practice/` as `.yml` files.
