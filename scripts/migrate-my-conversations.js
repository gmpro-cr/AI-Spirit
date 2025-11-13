import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function migrateConversations() {
  console.log('🔧 Migrating Conversations for mahalegauravk@gmail.com\n')

  const targetEmail = 'mahalegauravk@gmail.com'
  const oldSessionId = '4dd8e3d4-35dd-4c53-afe5-802a6c3e158f' // 15 conversations

  // Find user
  const { data: users } = await serviceClient.auth.admin.listUsers()
  const user = users.users.find(u => u.email === targetEmail)

  if (!user) {
    console.log(`❌ User with email ${targetEmail} not found`)
    return
  }

  console.log(`✅ Found user: ${user.email}`)
  console.log(`   User ID: ${user.id}\n`)

  // Get conversations to migrate
  const { data: previewConvs } = await serviceClient
    .from('conversations')
    .select('id, persona_type, title, updated_at')
    .eq('session_id', oldSessionId)
    .order('updated_at', { ascending: false })

  console.log(`📋 Found ${previewConvs.length} conversations to migrate:\n`)
  previewConvs.slice(0, 10).forEach((conv, i) => {
    console.log(`${i + 1}. ${conv.persona_type}: "${conv.title || '(no title)'}"`)
    console.log(`   Updated: ${new Date(conv.updated_at).toLocaleString()}`)
  })

  if (previewConvs.length > 10) {
    console.log(`   ... and ${previewConvs.length - 10} more`)
  }

  console.log(`\n🔄 Migrating from session_id: ${oldSessionId}`)
  console.log(`   To user_id: ${user.id}\n`)

  // Perform migration
  const { data, error } = await serviceClient
    .from('conversations')
    .update({ session_id: user.id })
    .eq('session_id', oldSessionId)
    .select()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log(`✅ Successfully migrated ${data.length} conversations!\n`)

  // Verify
  const { data: verifyConvs } = await serviceClient
    .from('conversations')
    .select('id')
    .eq('session_id', user.id)
    .eq('is_active', true)

  console.log(`🎉 Verification: You now have ${verifyConvs.length} active conversations`)
  console.log('\n💡 Refresh http://localhost:3001/personas to see your past chats!')
}

migrateConversations()
