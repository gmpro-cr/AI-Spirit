#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMemories() {
  console.log('📝 All Stored Memories:\n')
  
  const { data: memories, error } = await supabase
    .from('conversation_memories')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Total memories:', memories.length, '\n')
  
  // Group by persona
  const byPersona = {}
  memories.forEach(m => {
    if (!byPersona[m.persona_slug]) byPersona[m.persona_slug] = []
    byPersona[m.persona_slug].push(m)
  })
  
  Object.entries(byPersona).forEach(([persona, mems]) => {
    console.log('Persona:', persona, '(' + mems.length, 'memories)')
    mems.forEach((m, i) => {
      console.log('  ', i+1 + '.', '[' + m.memory_type + ']', m.content.substring(0, 100))
    })
    console.log('')
  })
}

checkMemories()
