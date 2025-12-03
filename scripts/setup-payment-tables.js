import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setupTables() {
    try {
        console.log('📦 Setting up payment tables...\n')

        // Read the SQL migration file
        const sqlPath = join(__dirname, '../supabase/migrations/create_subscriptions_tables.sql')
        const sql = readFileSync(sqlPath, 'utf8')

        console.log('🔄 Executing SQL migration...')

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
            // If exec_sql function doesn't exist, try direct query
            const { data, error } = await supabase.from('_sql').insert({ query: sql })
            return { data, error }
        })

        if (error) {
            console.error('❌ Error executing SQL:', error.message)
            console.log('\n⚠️  You may need to run this SQL manually in Supabase SQL Editor:')
            console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n')
            console.log('SQL to execute:')
            console.log('---'.repeat(20))
            console.log(sql)
            console.log('---'.repeat(20))
            process.exit(1)
        }

        console.log('✅ Payment tables created successfully!')

        // Verify tables exist
        console.log('\n🔍 Verifying tables...')

        const { data: subscriptionsTest, error: subError } = await supabase
            .from('subscriptions')
            .select('count')
            .limit(1)

        const { data: paymentsTest, error: payError } = await supabase
            .from('payments')
            .select('count')
            .limit(1)

        if (!subError && !payError) {
            console.log('✅ Subscriptions table: Ready')
            console.log('✅ Payments table: Ready')
            console.log('\n🎉 Payment infrastructure setup complete!')
        } else {
            console.log('⚠️  Tables may not be fully accessible yet')
            if (subError) console.log('   Subscriptions error:', subError.message)
            if (payError) console.log('   Payments error:', payError.message)
        }

    } catch (error) {
        console.error('❌ Setup failed:', error.message)
        process.exit(1)
    }
}

setupTables()
