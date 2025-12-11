import { supabase } from './supabase.js'

/**
 * Simple, reliable memory system for AI personas
 * Uses AI to extract key facts from conversations
 */

/**
 * Extract memories from a conversation using Gemini AI
 * This is more reliable than regex patterns
 */
export async function extractMemoriesWithAI(userMessage, aiResponse, geminiClient) {
    const extractionPrompt = `Analyze this conversation and extract any personal facts about the user.

User said: "${userMessage}"
AI responded: "${aiResponse}"

Extract ONLY concrete personal facts the user shared (not questions or hypotheticals).
Return a JSON array of objects with "fact" and "category" fields.
Categories: name, age, location, profession, family, interest, goal, preference

Example output:
[{"fact": "User's name is John", "category": "name"}, {"fact": "Works as a software engineer", "category": "profession"}]

If no personal facts were shared, return an empty array: []
Return ONLY valid JSON, nothing else.`

    try {
        const result = await geminiClient.generateContent(extractionPrompt)
        const text = result.response.text().trim()

        // Parse JSON response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }
        return []
    } catch (error) {
        console.error('[Memory AI] Extraction error:', error.message)
        return []
    }
}

/**
 * Simple keyword-based memory extraction (fallback)
 * More reliable than complex regex
 */
export function extractMemoriesSimple(userMessage) {
    const memories = []
    const msg = userMessage.toLowerCase()

    // Name patterns
    if (msg.includes('my name is ') || msg.includes("i'm ") || msg.includes('i am ')) {
        const nameMatch = userMessage.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+)/i)
        if (nameMatch && nameMatch[1].length > 2) {
            memories.push({ fact: `User's name is ${nameMatch[1]}`, category: 'name' })
        }
    }

    // Age
    const ageMatch = userMessage.match(/i(?:'m| am)\s+(\d{1,3})\s*(?:years? old|yrs?)/i)
    if (ageMatch) {
        memories.push({ fact: `User is ${ageMatch[1]} years old`, category: 'age' })
    }

    // Location
    if (msg.includes('live in ') || msg.includes('from ')) {
        const locMatch = userMessage.match(/(?:live in|from)\s+([A-Z][a-zA-Z\s]+)/i)
        if (locMatch) {
            memories.push({ fact: `Lives in ${locMatch[1].trim()}`, category: 'location' })
        }
    }

    // Profession
    if (msg.includes('work as ') || msg.includes('i am a ') || msg.includes("i'm a ")) {
        const profMatch = userMessage.match(/(?:work as|i am a|i'm a)\s+([a-zA-Z\s]+)/i)
        if (profMatch && profMatch[1].length > 3) {
            memories.push({ fact: `Works as ${profMatch[1].trim()}`, category: 'profession' })
        }
    }

    // Interests
    if (msg.includes('love ') || msg.includes('like ') || msg.includes('enjoy ')) {
        const intMatch = userMessage.match(/(?:love|like|enjoy)\s+([a-zA-Z\s]+?)(?:\.|,|!|$)/i)
        if (intMatch && intMatch[1].length > 2) {
            memories.push({ fact: `Likes ${intMatch[1].trim()}`, category: 'interest' })
        }
    }

    return memories
}

/**
 * Save memories to database
 */
export async function saveMemories(userId, personaSlug, memories, supabaseClient = supabase) {
    if (!userId || !memories || memories.length === 0) {
        return { success: false, count: 0 }
    }

    console.log('[Memory] Saving', memories.length, 'memories for user', userId)

    const memoriesToInsert = memories.map(m => ({
        user_id: userId,
        persona_slug: personaSlug,
        memory_type: m.category || 'fact',
        content: m.fact,
        importance: m.category === 'name' ? 10 : 7,
        created_at: new Date().toISOString()
    }))

    try {
        const { data, error } = await supabaseClient
            .from('conversation_memories')
            .insert(memoriesToInsert)
            .select()

        if (error) {
            console.error('[Memory] Save error:', error.message)
            return { success: false, error: error.message }
        }

        console.log('[Memory] ✅ Saved', memoriesToInsert.length, 'memories')
        return { success: true, count: memoriesToInsert.length }
    } catch (error) {
        console.error('[Memory] Exception:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Get user's memories for context injection
 */
export async function getUserMemories(userId, personaSlug = null, supabaseClient = supabase) {
    if (!userId) return []

    try {
        const { data, error } = await supabaseClient
            .from('conversation_memories')
            .select('content, memory_type, importance')
            .eq('user_id', userId)
            .order('importance', { ascending: false })
            .limit(15)

        if (error) {
            console.error('[Memory] Fetch error:', error.message)
            return []
        }

        console.log('[Memory] Retrieved', data?.length || 0, 'memories for user')
        return data || []
    } catch (error) {
        console.error('[Memory] Exception:', error.message)
        return []
    }
}

/**
 * Format memories for AI context
 */
export function formatMemoriesForContext(memories, userProfile) {
    const lines = []

    // Add user profile info
    if (userProfile?.preferred_name) {
        lines.push(`User's name: ${userProfile.preferred_name}`)
    }

    // Add memories (deduplicated)
    const seen = new Set()
    for (const memory of memories) {
        if (!seen.has(memory.content)) {
            lines.push(`- ${memory.content}`)
            seen.add(memory.content)
        }
    }

    return lines.length > 0 ? lines.join('\n') : ''
}

/**
 * Main extraction function - called from chat API
 */
export async function extractAndSaveMemories(userId, personaSlug, conversationId, userMessage, aiResponse, supabaseClient = supabase) {
    console.log('[Memory] Processing message for user:', userId)

    if (!userId) {
        console.log('[Memory] No userId, skipping')
        return []
    }

    // Use simple extraction (more reliable than AI for basic facts)
    const memories = extractMemoriesSimple(userMessage)

    if (memories.length > 0) {
        await saveMemories(userId, personaSlug, memories, supabaseClient)
    } else {
        console.log('[Memory] No memories extracted from message')
    }

    return memories
}
