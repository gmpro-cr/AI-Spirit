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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('📦 Reading SQL migration file...')
    const sqlFile = join(__dirname, 'setup-chats-table.sql')
    const sql = readFileSync(sqlFile, 'utf-8')

    console.log('🚀 Running migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If exec_sql RPC doesn't exist, try direct execution
      console.log('📝 Trying direct SQL execution...')
      const statements = sql.split(';').filter(s => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          })

          if (stmtError) {
            console.error('❌ Error executing statement:', stmtError.message)
            throw stmtError
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Verifying tables...')

    // Verify chats table
    const { data: chatsCheck, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(0)

    if (!chatsError) {
      console.log('✅ chats table created')
    } else {
      console.log('❌ chats table check failed:', chatsError.message)
    }

    // Verify messages table
    const { data: messagesCheck, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(0)

    if (!messagesError) {
      console.log('✅ messages table created')
    } else {
      console.log('❌ messages table check failed:', messagesError.message)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
