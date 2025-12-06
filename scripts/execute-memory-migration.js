import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running memory system migration...\n')
  
  try {
    const sql = readFileSync('supabase/migrations/create_memory_and_relationship_tables.sql', 'utf8')
    
    // Execute using Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    })
    
    if (!response.ok) {
      throw new Error(`Migration failed: ${response.statusText}`)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('\nCreated tables:')
    console.log('  - conversation_memories')
    console.log('  - persona_relationships')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n📋 Please run the SQL manually in Supabase Dashboard:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy content from: supabase/migrations/create_memory_and_relationship_tables.sql')
    console.log('   4. Paste and execute in SQL Editor')
    process.exit(1)
  }
}

runMigration()
