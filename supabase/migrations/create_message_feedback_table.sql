-- Message feedback (thumbs up / down on assistant replies)
--
-- Keyed by (user, conversation, message index) rather than by message id: the
-- chat client tracks messages positionally and does not learn the server-side
-- message uuid, and re-voting on the same reply must overwrite rather than
-- accumulate.
--
-- conversation_id is TEXT, not a FK: guest conversations use client-generated
-- ids (conv_<ts>_<rand>) that never reach the conversations table.

CREATE TABLE IF NOT EXISTS message_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  message_index INTEGER NOT NULL,
  persona_slug TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT message_feedback_unique_vote UNIQUE (user_id, conversation_id, message_index)
);

-- "Which personas are producing bad replies?" is the question this table exists
-- to answer, so index for it.
CREATE INDEX IF NOT EXISTS message_feedback_persona_rating_idx
  ON message_feedback (persona_slug, rating);

CREATE INDEX IF NOT EXISTS message_feedback_conversation_idx
  ON message_feedback (conversation_id);

ALTER TABLE message_feedback ENABLE ROW LEVEL SECURITY;

-- Writes go through the service role in /api/feedback, which bypasses RLS.
-- These policies exist so a user can read back their own votes directly.
DROP POLICY IF EXISTS "Users can view their own feedback" ON message_feedback;
CREATE POLICY "Users can view their own feedback"
  ON message_feedback FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own feedback" ON message_feedback;
CREATE POLICY "Users can manage their own feedback"
  ON message_feedback FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
