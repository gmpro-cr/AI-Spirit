import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('Running persona_slug migration...\n')

  try {
    console.log('Step 1: Adding persona_slug column...')

    // Check database connection
    const { data: columns, error: schemaError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)

    if (schemaError) {
      console.error('Error checking schema:', schemaError)
      process.exit(1)
    }

    console.log('\nDatabase connection successful!')
    console.log('\nTo complete the migration, run this SQL in Supabase SQL Editor:\n')
    console.log('='.repeat(70))
    console.log(`
-- Add persona_slug column to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS persona_slug TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_persona_slug
ON conversations(persona_slug);

-- Update existing conversations to populate persona_slug from personas table
UPDATE conversations c
SET persona_slug = p.slug
FROM personas p
WHERE c.persona_id = p.id AND c.persona_slug IS NULL;
`)
    console.log('='.repeat(70))
    console.log('\nGo to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql')
    console.log('\nAfter running the SQL, test by:')
    console.log('1. Sign in to your app')
    console.log('2. Start a chat with any persona')
    console.log('3. Check if it appears in "Past Chats" sidebar\n')

  } catch (error) {
    console.error('Migration check failed:', error)
    process.exit(1)
  }
}

runMigration()
