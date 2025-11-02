import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPersonaCreation() {
  console.log('🧪 Testing Persona Creation Flow\n')

  // 1. Check if personas table has the required columns
  console.log('1️⃣ Checking personas table schema...')
  const { data: columns, error: schemaError } = await supabase
    .rpc('exec_sql', {
      sql: `SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'personas'
            AND column_name IN ('user_id', 'is_custom')
            ORDER BY column_name`
    })

  if (schemaError) {
    console.log('Using direct query instead...')
    // Try direct query
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error accessing personas table:', error)
      return
    }

    const firstPersona = data[0]
    console.log('✅ Personas table exists')
    console.log('Columns present:', Object.keys(firstPersona))
    console.log('Has user_id?', 'user_id' in firstPersona ? '✅' : '❌')
    console.log('Has is_custom?', 'is_custom' in firstPersona ? '✅' : '❌')
  }

  // 2. Check RLS policies
  console.log('\n2️⃣ Checking RLS policies...')
  const { data: policies, error: policyError } = await supabase
    .from('personas')
    .select('*')
    .eq('is_custom', true)

  if (policyError) {
    console.error('❌ Error querying custom personas:', policyError)
  } else {
    console.log(`✅ Can query custom personas (found ${policies.length})`)
  }

  // 3. Try to insert a test persona
  console.log('\n3️⃣ Testing insert operation...')

  // First, get a test user (or create one)
  const { data: users } = await supabase.auth.admin.listUsers()

  if (!users || users.users.length === 0) {
    console.log('⚠️  No users found. You need to sign in first.')
    console.log('Go to: https://esperit-ai.vercel.app/auth/signin')
    return
  }

  const testUserId = users.users[0].id
  console.log(`Using user ID: ${testUserId.substring(0, 8)}...`)

  const testPersona = {
    name: 'Test Persona',
    slug: `test-persona-${Date.now()}`,
    category: 'Custom',
    description: 'Test Description',
    avatar_url: null,
    system_prompt: 'You are a test persona.',
    language: 'en',
    is_custom: true,
    user_id: testUserId
  }

  const { data: inserted, error: insertError } = await supabase
    .from('personas')
    .insert(testPersona)
    .select()
    .single()

  if (insertError) {
    console.error('❌ Error inserting test persona:', insertError)
    console.error('Details:', insertError.message)

    if (insertError.code === '42501') {
      console.log('\n🔍 This is a permissions error. Checking RLS policies...')
      console.log('The issue is likely with Row Level Security policies.')
    }
  } else {
    console.log('✅ Successfully inserted test persona')
    console.log('Persona ID:', inserted.id)

    // Clean up - delete the test persona
    const { error: deleteError } = await supabase
      .from('personas')
      .delete()
      .eq('id', inserted.id)

    if (!deleteError) {
      console.log('✅ Test persona cleaned up')
    }
  }

  // 4. Check all custom personas
  console.log('\n4️⃣ Listing all custom personas...')
  const { data: allCustom, error: listError } = await supabase
    .from('personas')
    .select('id, name, slug, is_custom, user_id, created_at')
    .eq('is_custom', true)

  if (listError) {
    console.error('❌ Error listing custom personas:', listError)
  } else {
    console.log(`Found ${allCustom.length} custom personas:`)
    if (allCustom.length > 0) {
      console.table(allCustom.map(p => ({
        name: p.name,
        slug: p.slug.substring(0, 30),
        user_id: p.user_id ? p.user_id.substring(0, 8) + '...' : 'NULL'
      })))
    }
  }
}

testPersonaCreation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
