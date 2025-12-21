-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all Plan plugin tables
DROP TABLE IF EXISTS plan_accesslog;
DROP TABLE IF EXISTS plan_commandusages;
DROP TABLE IF EXISTS plan_cookies;
DROP TABLE IF EXISTS plan_extension_groups;
DROP TABLE IF EXISTS plan_extension_icons;
DROP TABLE IF EXISTS plan_extension_plugins;
DROP TABLE IF EXISTS plan_extension_providers;
DROP TABLE IF EXISTS plan_extension_server_table_values;
DROP TABLE IF EXISTS plan_extension_tabs;
DROP TABLE IF EXISTS plan_extension_tables;
DROP TABLE IF EXISTS plan_extension_user_table_values;
DROP TABLE IF EXISTS plan_geolocations;
DROP TABLE IF EXISTS plan_kills;
DROP TABLE IF EXISTS plan_nicknames;
DROP TABLE IF EXISTS plan_ping;
DROP TABLE IF EXISTS plan_security;
DROP TABLE IF EXISTS plan_servers;
DROP TABLE IF EXISTS plan_sessions;
DROP TABLE IF EXISTS plan_settings;
DROP TABLE IF EXISTS plan_tps;
DROP TABLE IF EXISTS plan_user_info;
DROP TABLE IF EXISTS plan_users;
DROP TABLE IF EXISTS plan_web_group;
DROP TABLE IF EXISTS plan_web_group_to_permission;
DROP TABLE IF EXISTS plan_web_permission;
DROP TABLE IF EXISTS plan_web_user_preferences;
DROP TABLE IF EXISTS plan_world_times;
DROP TABLE IF EXISTS plan_worlds;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
