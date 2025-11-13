import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

console.log('🔍 Checking RLS policies and permissions...\n')

// Test with anon key (what the client uses)
const anonClient = createClient(supabaseUrl, supabaseAnonKey)

async function testAnonAccess() {
  console.log('📋 Testing with ANON key (client perspective):\n')

  // Try to get conversations without auth
  const { data: noAuthData, error: noAuthError } = await anonClient
    .from('conversations')
    .select('*')
    .limit(5)

  console.log('Without auth:')
  if (noAuthError) {
    console.log('  ❌ Error:', noAuthError.message)
  } else {
    console.log(`  ✅ Success! Found ${noAuthData?.length || 0} conversations`)
  }
}

// Test with service key (admin)
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function testServiceAccess() {
  console.log('\n📋 Testing with SERVICE key (admin perspective):\n')

  const { data, error } = await serviceClient
    .from('conversations')
    .select('*')
    .limit(5)

  console.log('With service key:')
  if (error) {
    console.log('  ❌ Error:', error.message)
  } else {
    console.log(`  ✅ Success! Found ${data?.length || 0} conversations`)
    if (data && data.length > 0) {
      console.log('\n  Sample conversation:')
      console.log(`    ID: ${data[0].id}`)
      console.log(`    Session ID: ${data[0].session_id}`)
      console.log(`    Persona: ${data[0].persona_type}`)
      console.log(`    Title: ${data[0].title || '(null)'}`)
    }
  }
}

async function checkRLS() {
  console.log('\n📋 Checking if RLS is enabled:\n')

  const { data, error } = await serviceClient
    .from('conversations')
    .select('*')
    .limit(1)

  if (!error) {
    console.log('  ℹ️  RLS might be DISABLED or service key bypasses it')
    console.log('  ℹ️  This is expected for service key')
  }
}

async function main() {
  await testAnonAccess()
  await testServiceAccess()
  await checkRLS()

  console.log('\n💡 Summary:')
  console.log('  - If anon key fails: RLS policies are blocking unauthenticated access (GOOD)')
  console.log('  - Client needs valid auth session to query conversations')
  console.log('  - Check browser console for "Loading chats for user: [id]" message')
}

main()
