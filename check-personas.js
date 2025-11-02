#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/)
  if (match) envVars[match[1].trim()] = match[2].trim()
})

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await supabase
  .from('personas')
  .select('id, name, slug')
  .order('name')

if (error) {
  console.error('Error:', error)
} else {
  console.log('\n📋 Personas in Database:\n')
  data.forEach(p => {
    console.log(`ID:   ${p.id}`)
    console.log(`Name: ${p.name}`)
    console.log(`Slug: ${p.slug}`)
    console.log('')
  })
}
