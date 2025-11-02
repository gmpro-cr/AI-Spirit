import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Checking NOT NULL constraints in personas table...\n')

// Get a sample persona to see all columns and their values
const { data: sample } = await supabase
  .from('personas')
  .select('*')
  .limit(1)
  .single()

console.log('Sample persona columns and values:')
console.log('====================================\n')

Object.entries(sample).forEach(([key, value]) => {
  const valueStr = value === null ? 'NULL' :
                   typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' :
                   String(value)
  console.log(`${key.padEnd(25)} = ${valueStr}`)
})

console.log('\n====================================')
console.log('\nColumns that might be required (NOT NULL):')
console.log('- avatar_url')
console.log('- bio')
console.log('- short_description')
console.log('- system_prompt')
console.log('- name')
console.log('- slug')
