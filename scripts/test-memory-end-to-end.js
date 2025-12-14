#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testMemorySystem() {
  console.log('🧪 Testing Memory System End-to-End\n')
  console.log('=' .repeat(60))
  
  // Test 1: Check if we can get a user ID
  console.log('\n1. Getting authenticated user...')
  const { data: users, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
  
  if (userError || !users.users?.length) {
    console.error('❌ No users found. Memory system requires authenticated users.')
    return
  }
  
  const userId = users.users[0].id
  console.log('✅ Found user:', userId)
  
  // Test 2: Check what memories exist for this user
  console.log('\n2. Fetching memories for this user...')
  const { data: allMemories, error: memError } = await supabase
    .from('conversation_memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (memError) {
    console.error('❌ Error fetching memories:', memError.message)
    return
  }
  
  console.log('✅ Total memories for this user:', allMemories.length)
  
  if (allMemories.length > 0) {
    console.log('\nMemories breakdown by persona:')
    const byPersona = {}
    allMemories.forEach(m => {
      if (!byPersona[m.persona_slug]) byPersona[m.persona_slug] = []
      byPersona[m.persona_slug].push(m)
    })
    
    Object.entries(byPersona).forEach(([persona, mems]) => {
      console.log(`   📌 ${persona}: ${mems.length} memories`)
    })
  }
  
  // Test 3: Simulate what happens during a chat
  console.log('\n3. Simulating memory retrieval during chat...')
  
  if (allMemories.length === 0) {
    console.log('⚠️  No memories to retrieve. User needs to chat more.')
  } else {
    // Pick a persona that has memories
    const personaWithMemories = Object.keys(
      allMemories.reduce((acc, m) => ({ ...acc, [m.persona_slug]: true }), {})
    )[0]
    
    console.log(`   Testing with persona: ${personaWithMemories}`)
    
    const { data: personaMemories } = await supabase
      .from('conversation_memories')
      .select('content, memory_type, importance')
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .limit(20)
    
    console.log(`   ✅ Retrieved ${personaMemories.length} memories`)
    console.log('\n   Top 5 memories that would be injected into chat:')
    personaMemories.slice(0, 5).forEach((m, i) => {
      console.log(`      ${i+1}. [${m.memory_type}] ${m.content.substring(0, 80)}`)
    })
  }
  
  // Test 4: Check persona relationships
  console.log('\n4. Checking persona relationships...')
  const { data: relationships } = await supabase
    .from('persona_relationships')
    .select('*')
    .eq('user_id', userId)
    .order('conversation_count', { ascending: false })
    .limit(5)
  
  console.log(`   ✅ User has ${relationships.length} persona relationships`)
  if (relationships.length > 0) {
    console.log('\n   Top personas by conversation count:')
    relationships.forEach((rel, i) => {
      console.log(`      ${i+1}. ${rel.persona_slug}: ${rel.conversation_count} chats, level ${rel.relationship_level}`)
    })
  }
  
  // Test 5: Check what the chat API would log
  console.log('\n5. Checking what chat API would log...')
  console.log('   Looking for [Memory] logs in recent production activity...')
  console.log('   (Run: vercel logs https://ai-spirit.in --since 30m | grep Memory)')
  
  console.log('\n' + '=' .repeat(60))
  console.log('\n📊 DIAGNOSIS:\n')
  
  if (allMemories.length === 0) {
    console.log('❌ MEMORY EXTRACTION NOT WORKING')
    console.log('   - No memories stored despite tables existing')
    console.log('   - User may be chatting as guest (not authenticated)')
    console.log('   - Or memory extraction patterns may not be matching')
  } else {
    console.log('✅ MEMORY EXTRACTION IS WORKING')
    console.log(`   - ${allMemories.length} memories extracted and stored`)
    console.log(`   - Tracking ${relationships.length} persona relationships`)
    
    // Check quality
    const poorQuality = allMemories.filter(m => 
      m.content.includes('User\'s name is') || 
      m.content.length < 20 ||
      m.content.includes('undefined')
    ).length
    
    if (poorQuality > allMemories.length / 2) {
      console.log('\n⚠️  MEMORY QUALITY ISSUES DETECTED')
      console.log(`   - ${poorQuality}/${allMemories.length} memories are low quality`)
      console.log('   - Extraction patterns need improvement')
    }
    
    console.log('\n❓ MEMORY RETRIEVAL STATUS: UNKNOWN')
    console.log('   - Need to check production logs for [Memory] messages')
    console.log('   - Or test by chatting with a persona and asking it to remember')
  }
  
  console.log('\n💡 NEXT STEPS:')
  console.log('   1. Check production logs: vercel logs --since 30m | grep -i memory')
  console.log('   2. Test manually: Chat with a persona, tell it your name, close chat')
  console.log('      Then reopen and ask "do you remember my name?"')
  console.log('   3. If retrieval works but quality is poor, improve extraction patterns')
}

testMemorySystem()
