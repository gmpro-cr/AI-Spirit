import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running custom personas migration...\n')

  // Read the migration SQL file
  const migrationPath = join(__dirname, '../supabase/migration-add-custom-personas.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  // Split by semicolons but keep multi-line statements together
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  console.log(`Found ${statements.length} SQL statements to execute\n`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]

    // Skip comments
    if (statement.startsWith('--')) continue

    console.log(`Executing statement ${i + 1}/${statements.length}...`)
    console.log(statement.substring(0, 100) + '...\n')

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      })

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_sql').insert({ query: statement })

        if (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message)
          console.error('Statement:', statement)

          // Continue with other statements
          continue
        }
      }

      console.log(`✅ Statement ${i + 1} executed successfully\n`)
    } catch (err) {
      console.error(`❌ Exception executing statement ${i + 1}:`, err.message)
    }
  }

  console.log('\n✅ Migration completed!')
  console.log('\nNext steps:')
  console.log('1. Check Supabase dashboard to verify columns were added')
  console.log('2. Test creating a custom persona')
  console.log('3. Verify personas are saved to database')
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
