import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkConversations() {
  console.log('🔍 Checking conversations table...\n')

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .limit(3)

  if (error) {
    console.log('❌ conversations table does not exist:', error.message)
  } else {
    console.log('✅ conversations table exists!')
    if (data && data.length > 0) {
      console.log('\n📊 Sample records:')
      data.forEach((record, i) => {
        console.log(`\n${i + 1}.`, JSON.stringify(record, null, 2))
      })
    } else {
      console.log('📊 Table is empty')
    }
  }
}

checkConversations()
