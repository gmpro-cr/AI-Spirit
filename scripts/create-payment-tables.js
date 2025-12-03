#!/usr/bin/env node

/**
 * Script to create payment tables in Supabase
 * Run with: node scripts/create-payment-tables.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 Creating Payment Tables in Supabase\n')

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!')
    console.error('Required:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nMake sure .env.local is set up correctly.')
    process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

console.log('✅ Connected to Supabase:', supabaseUrl)
console.log('')

// Read SQL file
const sqlPath = join(__dirname, '../supabase/migrations/create_subscriptions_tables.sql')
const sql = readFileSync(sqlPath, 'utf8')

// Split SQL into individual statements
const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

async function createTables() {
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'
        const preview = statement.substring(0, 60).replace(/\s+/g, ' ')

        console.log(`${i + 1}/${statements.length} Executing: ${preview}...`)

        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                sql_query: statement
            }).catch(async () => {
                // Fallback: try direct query
                return await supabase.from('_raw').select('*').limit(0)
            })

            if (error) {
                // Some errors are expected (like "already exists")
                if (error.message.includes('already exists') ||
                    error.message.includes('does not exist') ||
                    error.code === 'PGRST204') {
                    console.log('   ℹ️  Skipped (already exists or not needed)')
                    successCount++
                } else {
                    console.log('   ⚠️  Warning:', error.message.substring(0, 80))
                    errorCount++
                }
            } else {
                console.log('   ✅ Success')
                successCount++
            }
        } catch (err) {
            console.log('   ⚠️  Error:', err.message.substring(0, 80))
            errorCount++
        }
    }

    console.log('')
    console.log('═'.repeat(60))
    console.log(`✅ Completed: ${successCount} successful, ${errorCount} errors`)
    console.log('═'.repeat(60))
    console.log('')

    // Verify tables exist
    console.log('🔍 Verifying tables...\n')

    const { data: subscriptionsData, error: subError } = await supabase
        .from('subscriptions')
        .select('count')
        .limit(1)

    if (subError) {
        console.log('❌ Subscriptions table: NOT FOUND')
        console.log('   Error:', subError.message)
        console.log('\n⚠️  You need to run the SQL manually in Supabase SQL Editor:')
        console.log('   https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql')
        return false
    } else {
        console.log('✅ Subscriptions table: EXISTS')
    }

    const { data: paymentsData, error: payError } = await supabase
        .from('payments')
        .select('count')
        .limit(1)

    if (payError) {
        console.log('❌ Payments table: NOT FOUND')
        console.log('   Error:', payError.message)
        return false
    } else {
        console.log('✅ Payments table: EXISTS')
    }

    console.log('')
    console.log('🎉 Success! Payment tables are ready.')
    console.log('')
    console.log('Next steps:')
    console.log('1. Test payment flow at: https://ai-spirit.in/pricing')
    console.log('2. Setup Razorpay webhook (see RAZORPAY-SETUP-GUIDE.md)')
    console.log('')

    return true
}

createTables()
    .then((success) => {
        process.exit(success ? 0 : 1)
    })
    .catch((err) => {
        console.error('\n❌ Fatal error:', err.message)
        console.error('\nPlease run the SQL manually in Supabase SQL Editor:')
        console.error('https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql')
        console.error('\nSQL file location:')
        console.error(sqlPath)
        process.exit(1)
    })
