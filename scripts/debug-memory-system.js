import { supabaseAdmin } from '../lib/supabase.js'

async function debugMemorySystem() {
    console.log('=== Memory System Debug ===\n')

    // 1. Check if conversation_memories table exists
    console.log('1. Checking if conversation_memories table exists...')
    const { data: memories, error: memError } = await supabaseAdmin
        .from('conversation_memories')
        .select('*')
        .limit(5)

    if (memError) {
        console.error('❌ Error accessing conversation_memories table:', memError.message)
        console.log('\n⚠️  The table might not exist. Need to create it.\n')
    } else {
        console.log('✅ Table exists!')
        console.log(`   Found ${memories?.length || 0} sample memories`)
        if (memories && memories.length > 0) {
            console.log('   Sample memory:', JSON.stringify(memories[0], null, 2))
        }
    }

    // 2. Check conversations table
    console.log('\n2. Checking recent conversations...')
    const { data: conversations, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('id, user_id, persona_slug, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

    if (convError) {
        console.error('❌ Error accessing conversations:', convError.message)
    } else {
        console.log(`✅ Found ${conversations?.length || 0} recent conversations`)
        if (conversations && conversations.length > 0) {
            conversations.forEach((conv, i) => {
                console.log(`   ${i + 1}. ${conv.persona_slug} - "${conv.title}" (${conv.created_at})`)
            })
        }
    }

    // 3. Check messages table
    console.log('\n3. Checking recent messages...')
    const { data: messages, error: msgError } = await supabaseAdmin
        .from('messages')
        .select('conversation_id, role, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

    if (msgError) {
        console.error('❌ Error accessing messages:', msgError.message)
    } else {
        console.log(`✅ Found ${messages?.length || 0} recent messages`)
        if (messages && messages.length > 0) {
            messages.forEach((msg, i) => {
                const preview = msg.content.substring(0, 50)
                console.log(`   ${i + 1}. [${msg.role}] ${preview}...`)
            })
        }
    }

    // 4. Check if there are any users with memories
    if (!memError && memories && memories.length > 0) {
        console.log('\n4. Checking memory distribution by user...')
        const { data: memStats, error: statsError } = await supabaseAdmin
            .from('conversation_memories')
            .select('user_id, persona_slug')

        if (!statsError && memStats) {
            const userCounts = {}
            const personaCounts = {}

            memStats.forEach(m => {
                userCounts[m.user_id] = (userCounts[m.user_id] || 0) + 1
                personaCounts[m.persona_slug] = (personaCounts[m.persona_slug] || 0) + 1
            })

            console.log('   Memories by user:')
            Object.entries(userCounts).forEach(([userId, count]) => {
                console.log(`     - ${userId}: ${count} memories`)
            })

            console.log('   Memories by persona:')
            Object.entries(personaCounts).forEach(([persona, count]) => {
                console.log(`     - ${persona}: ${count} memories`)
            })
        }
    }

    console.log('\n=== Debug Complete ===')
    process.exit(0)
}

debugMemorySystem()
