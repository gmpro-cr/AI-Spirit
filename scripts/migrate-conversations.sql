-- Step 1: Remove the foreign key constraint
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_session_id_fkey;

-- Step 2: Update conversations to new user ID
UPDATE conversations
SET session_id = 'f7ddbd3c-089b-4068-8722-de0fea30d335'
WHERE session_id = '4dd8e3d4-35dd-4c53-afe5-802a6c3e158f';

-- Step 3: Verify the update
SELECT COUNT(*) as migrated_conversations
FROM conversations
WHERE session_id = 'f7ddbd3c-089b-4068-8722-de0fea30d335'
AND is_active = true;
