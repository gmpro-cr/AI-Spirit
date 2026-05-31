-- Public conversation sharing
--
-- Adds opt-in sharing to conversations. A conversation is private by default;
-- the owner explicitly flips is_public=true via the share button, which makes
-- the conversation visible at /share/<conversation_id> without authentication.
--
-- Apply with:
--   psql $DATABASE_URL -f supabase/migration-add-conversation-sharing.sql
-- or paste into Supabase SQL Editor.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE;

-- Speed up the most common query: "is this share URL valid?"
CREATE INDEX IF NOT EXISTS conversations_is_public_idx
  ON conversations (id)
  WHERE is_public = true;

-- RLS: anyone (including anon) can read a conversation marked public.
-- Authenticated users keep their existing access (already covered by other policies).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'conversations'
      AND policyname = 'Public conversations are readable by anyone'
  ) THEN
    CREATE POLICY "Public conversations are readable by anyone"
      ON conversations FOR SELECT
      USING (is_public = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'Messages from public conversations are readable'
  ) THEN
    CREATE POLICY "Messages from public conversations are readable"
      ON messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversations
          WHERE conversations.id = messages.conversation_id
            AND conversations.is_public = true
        )
      );
  END IF;
END $$;
