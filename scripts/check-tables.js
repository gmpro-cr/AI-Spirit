#!/usr/bin/env node

/**
 * Check if payment tables exist in Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables!')
  console.log('Required:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL')
  console.log('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔍 Checking database tables...\n')
console.log('Supabase URL:', supabaseUrl)
console.log('')

async function checkTables() {
  try {
    // Check subscriptions table
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(1)

    if (subError) {
      console.log('❌ Subscriptions table: NOT FOUND')
      console.log('   Error:', subError.message)
      console.log('   Code:', subError.code)
    } else {
      console.log('✅ Subscriptions table: EXISTS')
    }

    // Check payments table
    const { data: payData, error: payError } = await supabase
      .from('payments')
      .select('count')
      .limit(1)

    if (payError) {
      console.log('❌ Payments table: NOT FOUND')
      console.log('   Error:', payError.message)
      console.log('   Code:', payError.code)
    } else {
      console.log('✅ Payments table: EXISTS')
    }

    console.log('')

    if (subError || payError) {
      console.log('⚠️  Database tables are missing!')
      console.log('')
      console.log('To create them, run:')
      console.log('  node scripts/create-payment-tables.js')
      console.log('')
      console.log('Or create them manually in Supabase SQL Editor:')
      console.log('  https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql')
      process.exit(1)
    } else {
      console.log('✅ All required tables exist!')
      process.exit(0)
    }
  } catch (err) {
    console.error('❌ Error checking tables:', err.message)
    process.exit(1)
  }
}

checkTables()
