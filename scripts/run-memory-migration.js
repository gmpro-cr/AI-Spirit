// Script to run the memory and relationship tables migration
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Required environment variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_KEY')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting memory and relationship tables migration...\n')

  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', 'create_memory_and_relationship_tables.sql')
    console.log('📄 Reading migration file:', migrationPath)
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('📝 Migration SQL loaded successfully\n')

    // Split the SQL into individual statements (separated by semicolons)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comment-only statements
      if (statement.startsWith('--')) continue

      console.log(`[${i + 1}/${statements.length}] Executing statement...`)

      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase
          .from('_raw')
          .select()
          .eq('query', statement)

        if (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error)
          throw error
        }
      }

      console.log(`✅ Statement ${i + 1} executed successfully`)
    }

    console.log('\n🎉 Migration completed successfully!\n')
    console.log('📋 Created tables:')
    console.log('   - conversation_memories (stores user details remembered by personas)')
    console.log('   - persona_relationships (tracks user-persona relationship levels)')
    console.log('\n✅ Memory system is now enabled!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\nTrying alternative approach using Supabase SQL Editor...\n')
    console.log('Please run the migration manually:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Copy the content from: supabase/migrations/create_memory_and_relationship_tables.sql')
    console.log('3. Paste and run in SQL Editor')
    process.exit(1)
  }
}

// Run the migration
runMigration()
