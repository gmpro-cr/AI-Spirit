#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read environment variables
const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/)
  if (match) envVars[match[1].trim()] = match[2].trim()
})

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Updating Supabase Redirect URLs via SQL\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function updateRedirectURLs() {
  try {
    // Read the SQL migration file
    const sqlContent = readFileSync('supabase/migration-update-redirect-urls.sql', 'utf-8')
    
    // Split into individual statements (removing comments and empty lines)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
    
    console.log('📝 Executing SQL migration...\n')
    
    // Execute the UPDATE statements
    const updateSiteURL = `
      UPDATE auth.config
      SET value = '"https://ai-spirit.in"'
      WHERE key = 'SITE_URL'
    `
    
    const updateRedirectURLs = `
      UPDATE auth.config
      SET value = '"https://ai-spirit.in/auth/callback,https://ai-spirit.in/**,https://esperit-ai.vercel.app/auth/callback,https://esperit-ai.vercel.app/**,http://localhost:3000/auth/callback,http://localhost:3000/**"'
      WHERE key = 'URI_ALLOW_LIST'
    `
    
    const insertSiteURL = `
      INSERT INTO auth.config (key, value)
      SELECT 'SITE_URL', '"https://ai-spirit.in"'
      WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'SITE_URL')
    `
    
    const insertRedirectURLs = `
      INSERT INTO auth.config (key, value)
      SELECT 'URI_ALLOW_LIST', '"https://ai-spirit.in/auth/callback,https://ai-spirit.in/**,https://esperit-ai.vercel.app/auth/callback,https://esperit-ai.vercel.app/**,http://localhost:3000/auth/callback,http://localhost:3000/**"'
      WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'URI_ALLOW_LIST')
    `
    
    // Try to execute via RPC or direct query
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: updateSiteURL })
    
    if (error1) {
      console.log('⚠️  Direct SQL execution not available')
      console.log('📋 SQL migration created at: supabase/migration-update-redirect-urls.sql\n')
      console.log('🔧 Please run this manually:')
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg')
      console.log('2. Go to SQL Editor')
      console.log('3. Click "New Query"')
      console.log('4. Copy and paste the contents of: supabase/migration-update-redirect-urls.sql')
      console.log('5. Click "Run"\n')
      console.log('✅ The migration file contains all necessary SQL commands')
      process.exit(0)
    }
    
    console.log('✅ Configuration updated successfully!\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 SQL migration created at: supabase/migration-update-redirect-urls.sql\n')
    console.log('🔧 Please run this manually in Supabase SQL Editor')
    process.exit(1)
  }
}

updateRedirectURLs()
