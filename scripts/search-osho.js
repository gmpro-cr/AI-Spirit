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

async function searchOsho() {
  console.log('🔍 Searching for Osho personas (case-insensitive)...\n')

  // Search for any persona with "osho" in the name
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .ilike('name', '%osho%')

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('❌ No Osho personas found in database.')
    console.log('\n📋 Checking all personas with "O" starting letter...\n')
    
    // Check personas starting with O
    const { data: oData, error: oError } = await supabase
      .from('personas')
      .select('id, name, slug, avatar_url')
      .ilike('name', 'o%')
      .order('name')

    if (oError) {
      console.error('Error:', oError)
    } else if (oData && oData.length > 0) {
      oData.forEach(p => {
        console.log(`Name: ${p.name}`)
        console.log(`Slug: ${p.slug}`)
        console.log(`Avatar: ${p.avatar_url}`)
        console.log(`ID: ${p.id}\n`)
      })
    } else {
      console.log('No personas starting with "O" found.')
    }
  } else {
    console.log(`✅ Found ${data.length} Osho persona(s):\n`)
    data.forEach(p => {
      console.log(`Name: ${p.name}`)
      console.log(`Slug: ${p.slug}`)
      console.log(`Avatar: ${p.avatar_url}`)
      console.log(`ID: ${p.id}`)
      console.log(`Category: ${p.category}`)
      console.log(`Language: ${p.language}\n`)
    })
  }
}

searchOsho()
