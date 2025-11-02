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

const { data } = await supabase
  .from('personas')
  .select('name, avatar_url')
  .limit(5)

console.log('Sample avatar URLs from existing personas:\n')
data.forEach(p => {
  const url = p.avatar_url || 'NULL'
  console.log(`${p.name}:`)
  console.log(`  ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`)
  console.log()
})
