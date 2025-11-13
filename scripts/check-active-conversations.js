import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function checkConversations() {
  console.log('🔍 Checking conversation data...\n')

  // Get all conversations
  const { data: allConvs, error: allError } = await serviceClient
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (allError) {
    console.error('❌ Error:', allError.message)
    return
  }

  console.log(`Total conversations: ${allConvs.length}\n`)

  allConvs.forEach((conv, i) => {
    console.log(`${i + 1}. ID: ${conv.id}`)
    console.log(`   Session ID: ${conv.session_id}`)
    console.log(`   Persona: ${conv.persona_type}`)
    console.log(`   is_active: ${conv.is_active}`)
    console.log(`   Title: ${conv.title || '(null)'}`)
    console.log(`   Updated: ${conv.updated_at}`)
    console.log('')
  })

  // Count active vs inactive
  const activeCount = allConvs.filter(c => c.is_active).length
  const inactiveCount = allConvs.length - activeCount

  console.log(`\n📊 Summary:`)
  console.log(`   Active conversations: ${activeCount}`)
  console.log(`   Inactive conversations: ${inactiveCount}`)
}

checkConversations()
