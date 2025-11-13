import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserSessions() {
  console.log('🔍 Analyzing User Sessions and Conversations\n')

  // Get all users
  const { data: users, error: usersError } = await serviceClient.auth.admin.listUsers()

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message)
    return
  }

  console.log(`📊 Total Users: ${users.users.length}\n`)

  // Get all conversations
  const { data: conversations, error: convError } = await serviceClient
    .from('conversations')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  if (convError) {
    console.error('❌ Error fetching conversations:', convError.message)
    return
  }

  console.log(`💬 Total Active Conversations: ${conversations.length}\n`)

  // Group conversations by session_id
  const conversationsBySession = {}
  conversations.forEach(conv => {
    if (!conversationsBySession[conv.session_id]) {
      conversationsBySession[conv.session_id] = []
    }
    conversationsBySession[conv.session_id].push(conv)
  })

  console.log('=' * 60)
  console.log('👥 USERS AND THEIR CONVERSATIONS')
  console.log('=' * 60)

  users.users.forEach((user, i) => {
    console.log(`\n${i + 1}. User: ${user.email}`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
    console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`)

    const userConversations = conversationsBySession[user.id] || []
    console.log(`   Conversations: ${userConversations.length}`)

    if (userConversations.length > 0) {
      console.log('   Recent chats:')
      userConversations.slice(0, 3).forEach(conv => {
        console.log(`     - ${conv.persona_type}: "${conv.title || '(no title)'}"`)
      })
    }
  })

  console.log('\n' + '=' * 60)
  console.log('🔍 ORPHANED CONVERSATIONS (no matching user)')
  console.log('=' * 60)

  const userIds = new Set(users.users.map(u => u.id))
  const orphanedSessions = Object.keys(conversationsBySession).filter(sid => !userIds.has(sid))

  if (orphanedSessions.length > 0) {
    console.log(`\nFound ${orphanedSessions.length} session IDs without matching users:\n`)
    orphanedSessions.forEach((sessionId, i) => {
      const convs = conversationsBySession[sessionId]
      console.log(`${i + 1}. Session ID: ${sessionId}`)
      console.log(`   Conversations: ${convs.length}`)
      console.log(`   Personas: ${convs.map(c => c.persona_type).join(', ')}`)
    })
  } else {
    console.log('\n✅ All conversations have matching users')
  }

  console.log('\n' + '=' * 60)
  console.log('💡 DEBUGGING TIPS')
  console.log('=' * 60)
  console.log('\n1. Check browser console for "Loading chats for user: [id]"')
  console.log('2. Compare that ID with the User IDs listed above')
  console.log('3. If they match, past chats should appear')
  console.log('4. If they don\'t match, we need to update the session_id in conversations')
  console.log('\n5. To test: Open browser console at http://localhost:3001/personas')
  console.log('   Look for the console.log output from SidePanel component')
}

checkUserSessions()
