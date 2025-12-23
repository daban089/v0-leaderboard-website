-- Show structure of fight_players table
DESCRIBE fight_players;

-- Show structure of fights table
DESCRIBE fights;

-- Count records in each table
SELECT 'fight_players' as table_name, COUNT(*) as record_count FROM fight_players
UNION ALL
SELECT 'fights' as table_name, COUNT(*) as record_count FROM fights;
