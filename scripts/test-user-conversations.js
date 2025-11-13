import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUserConversations() {
  console.log('🔍 Testing user conversations...\n')

  // Get all conversations
  const { data: allConvs, error: allError } = await supabase
    .from('conversations')
    .select('*')
    .limit(5)

  console.log('All conversations (first 5):')
  if (allError) {
    console.log('  ❌ Error:', allError.message)
  } else {
    console.log(`  Found ${allConvs.length} conversations`)
    allConvs.forEach((conv, i) => {
      console.log(`  ${i + 1}. session_id: ${conv.session_id}, persona: ${conv.persona_type}, title: ${conv.title}`)
    })
  }

  console.log('\n📋 Note: The session_id in conversations should match the user ID from Google auth')
  console.log('You can find your user ID by checking the browser console when logged in')
}

testUserConversations()
