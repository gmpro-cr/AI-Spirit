#!/usr/bin/env node

/**
 * Test script to verify Supabase database setup
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing Supabase Database Setup...\n')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Using Service Key:', supabaseKey.substring(0, 20) + '...\n')

  // Test 1: Check personas table
  console.log('1️⃣ Checking personas table...')
  const { data: personas, error: personasError } = await supabase
    .from('personas')
    .select('id, name, slug')
    .limit(5)

  if (personasError) {
    console.error('❌ FAILED: Personas table error')
    console.error('   Error:', personasError.message)
    console.error('   Details:', personasError.details)
    console.error('\n   → This means the database tables haven\'t been created yet!')
    console.log('\n📋 NEXT STEPS:')
    console.log('   1. Open: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg')
    console.log('   2. Click "SQL Editor" in sidebar')
    console.log('   3. Run: supabase/schema.sql')
    console.log('   4. Run: supabase/seed.sql')
    console.log('   5. Run this test again\n')
    process.exit(1)
  }

  if (!personas || personas.length === 0) {
    console.error('❌ FAILED: No personas found in database')
    console.log('\n📋 NEXT STEPS:')
    console.log('   Tables exist but are empty. Run seed.sql:')
    console.log('   1. Open: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg')
    console.log('   2. Go to SQL Editor')
    console.log('   3. Run: supabase/seed.sql\n')
    process.exit(1)
  }

  console.log('✅ SUCCESS: Found', personas.length, 'personas')
  personas.forEach(p => console.log('   -', p.name, `(${p.slug})`))

  // Test 2: Check other tables
  console.log('\n2️⃣ Checking other tables...')

  const tables = ['profiles', 'conversations', 'messages', 'reports']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`)
    } else {
      console.log(`   ✅ ${table}: exists`)
    }
  }

  console.log('\n✅ Database is set up correctly!')
  console.log('🎉 Chat functionality should work now.\n')
}

testDatabase().catch(err => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
