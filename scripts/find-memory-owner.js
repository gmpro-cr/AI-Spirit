#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findMemoryOwner() {
  console.log('🔍 Finding who owns the 16 memories...\n')
  
  // Get all memories
  const { data: memories } = await supabase
    .from('conversation_memories')
    .select('user_id')
  
  // Get unique user IDs
  const userIds = [...new Set(memories.map(m => m.user_id))]
  
  console.log('Total memories:', memories.length)
  console.log('Owned by', userIds.length, 'user(s)\n')
  
  // Get all users
  const { data: allUsers } = await supabase.auth.admin.listUsers()
  
  console.log('Total users in system:', allUsers.users.length, '\n')
  
  // Check memories per user
  for (const uid of userIds) {
    const userMemories = memories.filter(m => m.user_id === uid)
    const user = allUsers.users.find(u => u.id === uid)
    
    console.log('User:', uid)
    console.log('  Email:', user?.email || 'NO EMAIL')
    console.log('  Memories:', userMemories.length)
    console.log('  Created:', user?.created_at || 'UNKNOWN')
    console.log('')
  }
  
  // List all users and their memory counts
  console.log('All users and their memory counts:')
  for (const user of allUsers.users) {
    const count = memories.filter(m => m.user_id === user.id).length
    console.log(`  ${user.email}: ${count} memories`)
  }
}

findMemoryOwner()
