import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

console.log('🔧 Connecting to Supabase...')
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  try {
    console.log('\n📋 Instructions to create chat tables:')
    console.log('\n1. Go to: https://supabase.com/dashboard/project/[your-project]/editor')
    console.log('2. Click on "SQL Editor" in the left sidebar')
    console.log('3. Click "New query" button')
    console.log('4. Copy and paste the SQL from scripts/setup-chats-table.sql')
    console.log('5. Click "Run" to execute')
    console.log('\n📄 SQL file location: scripts/setup-chats-table.sql')

    console.log('\n✅ After running the SQL, the following tables will be created:')
    console.log('   - chats (stores chat sessions)')
    console.log('   - messages (stores individual messages)')
    console.log('\nRun this script again after executing the SQL to verify.')

    // Try to check if tables exist
    console.log('\n🔍 Checking current tables...')

    const { data: chatsCheck, error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .limit(1)

    const { data: messagesCheck, error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .limit(1)

    if (!chatsError && !messagesError) {
      console.log('✅ Both tables already exist!')
      console.log('   - chats table: ✓')
      console.log('   - messages table: ✓')
    } else {
      if (chatsError) {
        console.log('❌ chats table does not exist yet')
      } else {
        console.log('✅ chats table exists')
      }

      if (messagesError) {
        console.log('❌ messages table does not exist yet')
      } else {
        console.log('✅ messages table exists')
      }

      console.log('\n⚠️  Please run the SQL script as described above.')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createTables()
