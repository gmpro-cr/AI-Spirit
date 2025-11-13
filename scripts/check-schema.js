import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('🔍 Checking database schema...\n')

  // Get one record with all columns
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .limit(1)
    .single()

  console.log('conversations table columns:')
  if (conv) {
    Object.keys(conv).forEach(key => {
      console.log(`  - ${key}: ${typeof conv[key]} = ${conv[key]}`)
    })
  }

  console.log('\n')

  const { data: msg, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .limit(1)
    .single()

  console.log('messages table columns:')
  if (msg) {
    Object.keys(msg).forEach(key => {
      console.log(`  - ${key}: ${typeof msg[key]} = ${msg[key]}`)
    })
  }

  // Check if we can query by user
  console.log('\n\n🔍 Checking user association...')

  // Try to find user_id column
  const { data: withUser } = await supabase
    .from('conversations')
    .select('user_id')
    .limit(1)

  if (withUser && withUser.length > 0) {
    console.log('✅ conversations table has user_id column')
  } else {
    console.log('❓ No user_id column found, checking session_id...')
  }
}

checkSchema()
