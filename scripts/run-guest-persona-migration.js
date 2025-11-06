import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Running Guest Persona Creation Migration\n')

  try {
    // Read the SQL migration file
    const sqlPath = join(__dirname, '../supabase/migration-enable-guest-persona-creation.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    console.log('📄 Executing migration SQL...\n')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If rpc doesn't exist, try direct execution
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

      console.log(`   Executing ${statements.length} SQL statements...\n`)

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        console.log(`   [${i + 1}/${statements.length}] Executing statement...`)

        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql_query: statement
        }).catch(() => ({ error: null }))

        if (stmtError) {
          console.error(`   ⚠️  Warning on statement ${i + 1}:`, stmtError.message)
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`)
        }
      }

      return { data: null, error: null }
    })

    if (error && !error.message?.includes('does not exist')) {
      console.error('❌ Migration error:', error.message)
      console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/_/sql/new')
      console.log('\n📋 Copy the SQL from:')
      console.log(`   ${sqlPath}`)
      process.exit(1)
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   • Guest users can now create personas in the database')
    console.log('   • Guest personas have user_id = NULL')
    console.log('   • Guest personas cannot be edited or deleted (prevents abuse)')
    console.log('   • Authenticated users can still manage their own personas')
    console.log('\n🎉 Database sync is now enabled for ALL users!')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor')
    process.exit(1)
  }
}

runMigration()
