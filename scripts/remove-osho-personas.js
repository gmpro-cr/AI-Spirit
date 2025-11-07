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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function removeOshoPersonas() {
  console.log('🔍 Searching for Osho personas...\n')

  // Find Osho personas
  const { data: oshoPersonas, error: searchError } = await supabase
    .from('personas')
    .select('id, name, slug')
    .or('name.ilike.%osho%')

  if (searchError) {
    console.error('❌ Error searching for personas:', searchError)
    process.exit(1)
  }

  if (!oshoPersonas || oshoPersonas.length === 0) {
    console.log('✅ No Osho personas found in database.')
    process.exit(0)
  }

  console.log(`📋 Found ${oshoPersonas.length} Osho persona(s):\n`)
  oshoPersonas.forEach(p => {
    console.log(`  • ${p.name} (${p.slug})`)
  })
  console.log()

  // Delete the personas
  const personaIds = oshoPersonas.map(p => p.id)
  
  console.log('🗑️  Removing Osho personas from database...\n')
  
  const { error: deleteError } = await supabase
    .from('personas')
    .delete()
    .in('id', personaIds)

  if (deleteError) {
    console.error('❌ Error deleting personas:', deleteError)
    process.exit(1)
  }

  console.log('✅ Successfully removed Osho personas from database!')
  console.log('✅ Removed personas:', oshoPersonas.map(p => p.name).join(', '))
  console.log('\n💡 The UI will automatically update on next page load.')
}

removeOshoPersonas()
