import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  console.log('🔍 Checking available tables and user data...\n')
  
  // Try user_profiles table
  console.log('1. Checking user_profiles table:')
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'mahalegauravk@gmail.com')
    .single()
  
  if (profileError) {
    console.log('  ❌ Error:', profileError.message)
  } else {
    console.log('  ✅ Found in user_profiles:')
    console.log('  ', JSON.stringify(profiles, null, 2))
  }
  
  // Try auth.users (Supabase Auth)
  console.log('\n2. Checking auth.users (Supabase Auth):')
  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.log('  ❌ Error:', authError.message)
  } else {
    const user = authUser.users.find(u => u.email === 'mahalegauravk@gmail.com')
    if (user) {
      console.log('  ✅ Found in auth.users:')
      console.log('  ', JSON.stringify({
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }, null, 2))
    } else {
      console.log('  ❌ Not found')
    }
  }
  
  // Try conversation_histories
  console.log('\n3. Checking conversation_histories table:')
  const { data: convos, error: convoError } = await supabase
    .from('conversation_histories')
    .select('user_id, created_at')
    .limit(5)
  
  if (convoError) {
    console.log('  ❌ Error:', convoError.message)
  } else {
    console.log('  ✅ Table exists, sample records:', convos.length)
  }
}

checkTables()
