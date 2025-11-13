import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function fixAndMigrate() {
  console.log('🔧 Fixing Foreign Key Constraint and Migrating Conversations\n')

  const targetEmail = 'mahalegauravk@gmail.com'
  const oldSessionId = '4dd8e3d4-35dd-4c53-afe5-802a6c3e158f'

  // Find user
  const { data: users } = await serviceClient.auth.admin.listUsers()
  const user = users.users.find(u => u.email === targetEmail)

  if (!user) {
    console.log(`❌ User not found`)
    return
  }

  console.log(`✅ User: ${user.email}`)
  console.log(`   User ID: ${user.id}\n`)

  // Step 1: Drop the foreign key constraint
  console.log('🔄 Step 1: Removing foreign key constraint...')

  const dropConstraintSQL = `
    ALTER TABLE conversations
    DROP CONSTRAINT IF EXISTS conversations_session_id_fkey;
  `

  const { error: dropError } = await serviceClient.rpc('exec_sql', {
    sql: dropConstraintSQL
  })

  // If RPC doesn't work, try direct query
  if (dropError) {
    console.log('⚠️  RPC not available, trying direct approach...')

    // Alternative: Just update without dropping constraint
    // We'll make session_id nullable first
    const { error: alterError } = await serviceClient
      .from('conversations')
      .update({ session_id: user.id })
      .eq('session_id', oldSessionId)

    if (alterError) {
      console.log('❌ Cannot update due to foreign key constraint')
      console.log('   We need to remove this constraint from the database')
      console.log('\n💡 Solution: Run this SQL in Supabase SQL Editor:')
      console.log('\n```sql')
      console.log('ALTER TABLE conversations')
      console.log('DROP CONSTRAINT IF EXISTS conversations_session_id_fkey;')
      console.log('')
      console.log('-- Then update the conversations')
      console.log(`UPDATE conversations`)
      console.log(`SET session_id = '${user.id}'`)
      console.log(`WHERE session_id = '${oldSessionId}';`)
      console.log('```\n')
      return
    }
  }

  // Step 2: Perform migration
  console.log('🔄 Step 2: Migrating conversations...')

  const { data, error: updateError } = await serviceClient
    .from('conversations')
    .update({ session_id: user.id })
    .eq('session_id', oldSessionId)
    .select()

  if (updateError) {
    console.error('❌ Migration error:', updateError.message)
    return
  }

  console.log(`\n✅ Successfully migrated ${data.length} conversations!\n`)

  // Verify
  const { data: verifyConvs } = await serviceClient
    .from('conversations')
    .select('id, persona_type, title')
    .eq('session_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(10)

  console.log(`🎉 You now have ${verifyConvs.length}+ conversations:\n`)
  verifyConvs.forEach((conv, i) => {
    console.log(`${i + 1}. ${conv.persona_type}: "${conv.title || '(no title)'}"`)
  })

  console.log('\n💡 Refresh http://localhost:3001/personas to see your past chats!')
}

fixAndMigrate()
