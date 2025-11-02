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
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCustomPersonas() {
  console.log('🔍 Checking for custom personas in database...\n')

  const { data, error } = await supabase
    .from('personas')
    .select('id, name, slug, is_custom, user_id, created_at')
    .eq('is_custom', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`Found ${data.length} custom personas:\n`)

  if (data.length > 0) {
    console.table(data.map(p => ({
      name: p.name,
      slug: p.slug.substring(0, 30),
      user_id: p.user_id ? p.user_id.substring(0, 8) + '...' : 'NULL',
      created: new Date(p.created_at).toLocaleString()
    })))
  } else {
    console.log('No custom personas found yet.')
    console.log('\nTo test:')
    console.log('1. Sign in to https://esperit-ai.vercel.app/auth/signin')
    console.log('2. Go to Personas page')
    console.log('3. Click "Create Custom Persona"')
    console.log('4. Fill in the form and submit')
    console.log('5. Run this script again to verify')
  }
}

checkCustomPersonas()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
