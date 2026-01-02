#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAstroGuideMemories() {
    console.log('🔍 Checking memories for Astro Guide persona...\n')

    // Get all memories grouped by persona
    const { data: allMemories, error } = await supabase
        .from('conversation_memories')
        .select('persona_slug, content, memory_type, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error:', error.message)
        return
    }

    // Group by persona
    const byPersona = {}
    for (const m of allMemories) {
        const slug = m.persona_slug || 'NO_PERSONA'
        if (!byPersona[slug]) byPersona[slug] = []
        byPersona[slug].push(m)
    }

    console.log('📊 Memories by Persona:')
    console.log('---')
    for (const [persona, memories] of Object.entries(byPersona)) {
        console.log(`\n${persona}: ${memories.length} memories`)
        if (memories.length <= 5) {
            memories.forEach(m => console.log(`  - [${m.memory_type}] ${m.content}`))
        } else {
            memories.slice(0, 5).forEach(m => console.log(`  - [${m.memory_type}] ${m.content}`))
            console.log(`  ... and ${memories.length - 5} more`)
        }
    }

    // Specifically check astro-guide
    console.log('\n\n🔮 ASTRO-GUIDE SPECIFIC:')
    const astroMemories = byPersona['astro-guide'] || []
    if (astroMemories.length === 0) {
        console.log('❌ NO memories found for astro-guide!')
        console.log('   This means birth details were NEVER saved with persona_slug = "astro-guide"')
        console.log('   Possible issues:')
        console.log('   1. extractAndSaveMemories() not called for astro-guide')
        console.log('   2. persona.slug not being passed correctly')
        console.log('   3. User not authenticated when chatting')
    } else {
        console.log(`✅ Found ${astroMemories.length} memories:`)
        astroMemories.forEach(m => console.log(`  - [${m.memory_type}] ${m.content}`))
    }
}

checkAstroGuideMemories()
