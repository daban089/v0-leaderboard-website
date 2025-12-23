-- List all fights with details
SELECT 
    id,
    kit,
    winner_uuid,
    loser_uuid,
    ranked,
    timestamp
FROM fights
ORDER BY id DESC;

-- Count total fights
SELECT COUNT(*) as total_fights FROM fights;

-- Count fights by kit
SELECT 
    kit,
    COUNT(*) as total_fights,
    SUM(CASE WHEN ranked = 1 THEN 1 ELSE 0 END) as ranked_fights,
    SUM(CASE WHEN ranked = 0 THEN 1 ELSE 0 END) as unranked_fights
FROM fights
GROUP BY kit;

-- Get recent 20 fights
SELECT * FROM fights ORDER BY timestamp DESC LIMIT 20;
