-- Delete the 9 users from fight_players table
DELETE FROM fight_players 
WHERE username IN (
    '.BrushyLake34960',
    '.DrDaniar',
    '.Hama12298',
    '.KilluaKurd1',
    '0MuNeB0',
    'bafr',
    'HamaYNazyMC',
    'NxTahh',
    'Test'
);

-- Verify deletion
SELECT COUNT(*) as remaining_players FROM fight_players;
SELECT DISTINCT username FROM fight_players ORDER BY username;
