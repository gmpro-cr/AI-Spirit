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

// Extract project ref from URL (e.g., exdjsvknudvfkabnifrg from https://exdjsvknudvfkabnifrg.supabase.co)
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1]

console.log('🔧 Updating Supabase Authentication Configuration\n')
console.log(`Project: ${PROJECT_REF}`)
console.log(`URL: ${SUPABASE_URL}\n`)

// Configuration to update
const authConfig = {
  SITE_URL: 'https://ai-spirit.in',
  URI_ALLOW_LIST: [
    'https://ai-spirit.in/auth/callback',
    'https://ai-spirit.in/**',
    'https://esperit-ai.vercel.app/auth/callback',
    'https://esperit-ai.vercel.app/**',
    'http://localhost:3000/auth/callback',
    'http://localhost:3000/**'
  ].join(',')
}

console.log('📝 New Configuration:')
console.log(`   Site URL: ${authConfig.SITE_URL}`)
console.log(`   Allowed Redirect URLs:`)
authConfig.URI_ALLOW_LIST.split(',').forEach(url => {
  console.log(`     - ${url}`)
})
console.log()

// Update using Supabase Management API
async function updateAuthConfig() {
  try {
    console.log('🔄 Updating authentication configuration...\n')
    
    // Use Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify(authConfig)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to update configuration')
      console.error(`Status: ${response.status} ${response.statusText}`)
      console.error(`Response: ${errorText}`)
      
      // Try alternative method using SQL
      console.log('\n💡 Trying alternative method using database update...\n')
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      
      // Update auth.config table
      const { data, error } = await supabase.rpc('update_auth_config', {
        site_url: authConfig.SITE_URL,
        redirect_urls: authConfig.URI_ALLOW_LIST
      })
      
      if (error) {
        console.error('❌ Alternative method also failed:', error)
        console.log('\n⚠️  Manual Update Required')
        console.log('Please update these settings manually in Supabase Dashboard:')
        console.log('1. Go to: https://supabase.com/dashboard/project/' + PROJECT_REF)
        console.log('2. Navigate to: Authentication → URL Configuration')
        console.log(`3. Set Site URL: ${authConfig.SITE_URL}`)
        console.log('4. Add Redirect URLs:')
        authConfig.URI_ALLOW_LIST.split(',').forEach(url => {
          console.log(`   - ${url}`)
        })
        process.exit(1)
      }
      
      console.log('✅ Configuration updated via database!')
      return
    }

    const result = await response.json()
    console.log('✅ Authentication configuration updated successfully!\n')
    console.log('📋 Updated Settings:')
    console.log(`   Site URL: ${authConfig.SITE_URL}`)
    console.log('   Redirect URLs: Configured')
    console.log('\n🎉 Your application will now maintain ai-spirit.in domain after sign-in!')
    
  } catch (error) {
    console.error('❌ Error updating configuration:', error.message)
    console.log('\n⚠️  Manual Update Required')
    console.log('Please update these settings manually in Supabase Dashboard:')
    console.log('1. Go to: https://supabase.com/dashboard/project/' + PROJECT_REF)
    console.log('2. Navigate to: Authentication → URL Configuration')
    console.log(`3. Set Site URL: ${authConfig.SITE_URL}`)
    console.log('4. Add Redirect URLs:')
    authConfig.URI_ALLOW_LIST.split(',').forEach(url => {
      console.log(`   - ${url}`)
    })
    process.exit(1)
  }
}

updateAuthConfig()
