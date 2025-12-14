#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMemoryTables() {
  console.log('🔍 Checking Memory System Status\n')
  console.log('=' .repeat(60))

  try {
    // Test 1: Check if conversation_memories table exists
    console.log('\n1. Testing conversation_memories table...')
    const { data: memories, error: memError, count } = await supabase
      .from('conversation_memories')
      .select('*', { count: 'exact', head: false })
      .limit(5)

    if (memError) {
      console.error('❌ conversation_memories table ERROR:', memError.message)
      console.error('   Code:', memError.code)
      console.error('   Details:', memError.details)
      console.error('   Hint:', memError.hint)
      console.log('\n⚠️  DIAGNOSIS: The conversation_memories table likely does NOT exist!')
      console.log('   Run: node scripts/run-memory-migration.js')
    } else {
      console.log('✅ conversation_memories table EXISTS')
      console.log(`   Total memories stored: ${count || 0}`)
      if (memories && memories.length > 0) {
        console.log('   Sample memories:')
        memories.forEach((mem, i) => {
          console.log(`   ${i + 1}. [${mem.memory_type}] ${mem.content.substring(0, 60)}...`)
        })
      } else {
        console.log('   No memories stored yet (this is normal for new users)')
      }
    }

    // Test 2: Check if persona_relationships table exists
    console.log('\n2. Testing persona_relationships table...')
    const { data: relationships, error: relError, count: relCount } = await supabase
      .from('persona_relationships')
      .select('*', { count: 'exact', head: false })
      .limit(5)

    if (relError) {
      console.error('❌ persona_relationships table ERROR:', relError.message)
      console.log('\n⚠️  DIAGNOSIS: The persona_relationships table likely does NOT exist!')
      console.log('   Run: node scripts/run-memory-migration.js')
    } else {
      console.log('✅ persona_relationships table EXISTS')
      console.log(`   Total relationships: ${relCount || 0}`)
      if (relationships && relationships.length > 0) {
        console.log('   Sample relationships:')
        relationships.forEach((rel, i) => {
          console.log(`   ${i + 1}. Persona: ${rel.persona_slug}, Level: ${rel.relationship_level}, Chats: ${rel.conversation_count}`)
        })
      }
    }

    // Test 3: Check users table
    console.log('\n3. Testing auth.users access...')
    const { data: users, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })

    if (userError) {
      console.error('❌ Cannot access users:', userError.message)
    } else {
      console.log(`✅ Auth system accessible (${users.users?.length || 0} user(s) found in sample)`)
    }

    console.log('\n' + '=' .repeat(60))
    console.log('\n📊 SUMMARY:')

    if (memError || relError) {
      console.log('\n❌ MEMORY SYSTEM IS NOT SET UP')
      console.log('\n🔧 FIX: Run the migration to create tables:')
      console.log('   node scripts/run-memory-migration.js')
      console.log('\nOR manually run the SQL from:')
      console.log('   supabase/migrations/create_memory_and_relationship_tables.sql')
      console.log('   in the Supabase Dashboard → SQL Editor')
    } else {
      console.log('\n✅ MEMORY SYSTEM IS WORKING')
      console.log('   Tables exist and are accessible')
      console.log(`   ${count || 0} memories stored`)
      console.log(`   ${relCount || 0} relationships tracked`)
    }

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message)
    console.error(error)
  }
}

checkMemoryTables()
