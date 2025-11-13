import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('🔍 Checking tables...\n')

  // Check chats table
  const { data: chats, error: chatsError } = await supabase
    .from('chats')
    .select('*')
    .limit(1)

  console.log('Chats table:')
  if (chatsError) {
    console.log('  ❌ Error:', chatsError.message)
  } else {
    console.log('  ✅ Exists')
  }

  // Check messages table
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .limit(1)

  console.log('\nMessages table:')
  if (messagesError) {
    console.log('  ❌ Error:', messagesError.message)
  } else {
    console.log('  ✅ Exists')
    if (messages && messages.length > 0) {
      console.log('  📊 Sample record:', JSON.stringify(messages[0], null, 2))
    }
  }

  // Check personas table
  const { data: personas, error: personasError } = await supabase
    .from('personas')
    .select('*')
    .limit(1)

  console.log('\nPersonas table:')
  if (personasError) {
    console.log('  ❌ Error:', personasError.message)
  } else {
    console.log('  ✅ Exists')
  }
}

checkTables()
