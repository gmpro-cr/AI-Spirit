import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import readline from 'readline'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function fixSessionIds() {
  console.log('🔧 Fix Session IDs for Past Chats\n')
  console.log('This script will update the session_id of orphaned conversations')
  console.log('to match your current Google user ID.\n')

  // Get user email
  const email = await question('Enter your email (mahalegauravk@gmail.com): ')

  if (!email.trim()) {
    console.log('❌ Email is required')
    rl.close()
    return
  }

  // Find user
  const { data: users } = await serviceClient.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email.trim())

  if (!user) {
    console.log(`❌ User with email ${email} not found`)
    rl.close()
    return
  }

  console.log(`\n✅ Found user: ${user.email}`)
  console.log(`   User ID: ${user.id}\n`)

  // Get all conversations
  const { data: conversations } = await serviceClient
    .from('conversations')
    .select('session_id')
    .eq('is_active', true)

  // Group by session_id
  const sessionCounts = {}
  conversations.forEach(conv => {
    sessionCounts[conv.session_id] = (sessionCounts[conv.session_id] || 0) + 1
  })

  // Sort by count
  const sortedSessions = Object.entries(sessionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  console.log('📊 Top 5 session IDs by conversation count:\n')
  sortedSessions.forEach(([sessionId, count], i) => {
    console.log(`${i + 1}. ${sessionId} (${count} conversations)`)
  })

  const defaultSession = sortedSessions[0][0]
  console.log(`\n💡 Most likely yours: ${defaultSession} (${sortedSessions[0][1]} conversations)`)

  const oldSessionId = await question(`\nEnter the old session_id to migrate [${defaultSession}]: `)
  const sessionToMigrate = oldSessionId.trim() || defaultSession

  // Confirm
  const { data: previewConvs } = await serviceClient
    .from('conversations')
    .select('id, persona_type, title, updated_at')
    .eq('session_id', sessionToMigrate)
    .order('updated_at', { ascending: false })
    .limit(5)

  console.log(`\n📋 Preview of conversations to be migrated:`)
  previewConvs.forEach((conv, i) => {
    console.log(`${i + 1}. ${conv.persona_type}: "${conv.title || '(no title)'}"`)
    console.log(`   Updated: ${new Date(conv.updated_at).toLocaleString()}`)
  })

  const confirm = await question(`\n⚠️  Migrate ${sortedSessions.find(s => s[0] === sessionToMigrate)?.[1] || '?'} conversations from ${sessionToMigrate} to ${user.id}? (yes/no): `)

  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Migration cancelled')
    rl.close()
    return
  }

  // Perform migration
  console.log('\n🔄 Migrating conversations...')

  const { data, error } = await serviceClient
    .from('conversations')
    .update({ session_id: user.id })
    .eq('session_id', sessionToMigrate)
    .select()

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log(`\n✅ Successfully migrated ${data.length} conversations!`)
    console.log('\n🎉 Your past chats should now appear in the sidebar!')
    console.log('   Refresh the /personas page to see them.')
  }

  rl.close()
}

fixSessionIds()
