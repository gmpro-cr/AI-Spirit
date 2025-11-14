-- Step 1: Add persona_slug column to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS persona_slug TEXT;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_persona_slug ON conversations(persona_slug);

-- Step 3: Update existing conversations to populate persona_slug from personas table
UPDATE conversations
SET persona_slug = personas.slug
FROM personas
WHERE conversations.persona_id = personas.id
  AND conversations.persona_slug IS NULL;
