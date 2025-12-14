#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Simulate what getUserMemories does
async function testGetUserMemories(userId) {
  console.log('[Memory] Fetching memories for user:', userId)
  
  const { data, error } = await supabase
    .from('conversation_memories')
    .select('content, memory_type, importance')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('[Memory] Fetch error:', error.message)
    return []
  }
  
  console.log('[Memory] Found', data?.length || 0, 'memories')
  return data || []
}

// Format memories like the system does
function formatMemoriesForContext(memories, userProfile) {
  const lines = []
  
  if (userProfile?.preferred_name) {
    lines.push(`User's name: ${userProfile.preferred_name}`)
  }
  
  const seen = new Set()
  for (const m of memories) {
    if (!seen.has(m.content)) {
      lines.push(`- ${m.content}`)
      seen.add(m.content)
    }
  }
  
  return lines.join('\n')
}

async function test() {
  // Use your user ID
  const userId = 'f7ddbd3c-089b-4068-8722-de0fea30d335'
  
  console.log('🧪 Testing Memory Retrieval\n')
  console.log('Testing getUserMemories function...\n')
  
  const memories = await testGetUserMemories(userId)
  
  console.log('\nMemories returned:')
  memories.forEach((m, i) => {
    console.log(`  ${i+1}. [${m.memory_type}] ${m.content}`)
  })
  
  console.log('\nFormatted memory context that would be injected:')
  console.log('---')
  const formatted = formatMemoriesForContext(memories, null)
  console.log(formatted)
  console.log('---')
  
  if (memories.length > 0) {
    console.log('\n✅ Memory retrieval WORKS - memories are being fetched')
    console.log('\n❓ If personas still don\'t remember, the issue is:')
    console.log('   1. Memories not being injected into prompt (check logs)')
    console.log('   2. AI ignoring the memory context')
    console.log('   3. Frontend not passing userId correctly')
  } else {
    console.log('\n❌ Memory retrieval FAILED - no memories returned')
  }
}

test()
