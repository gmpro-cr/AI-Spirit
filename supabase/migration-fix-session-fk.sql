-- Drop the foreign key constraint that links to sessions table
-- This allows conversations.session_id to store Supabase auth user IDs directly

ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_session_id_fkey;

-- Note: session_id column will now accept any UUID
-- The application code uses Supabase auth user.id as session_id
-- Old conversations with custom session IDs will remain but won't match auth users
