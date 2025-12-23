-- Delete user "Test" from the fight_players table
-- This will remove all match records for this player
DELETE FROM fight_players WHERE username = 'Test';

-- Note: This will remove the player from all their matches
-- The fights table itself won't be deleted, just the player's participation records
