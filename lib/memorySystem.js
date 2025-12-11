import { supabase } from './supabase.js'

/**
 * Simple, reliable memory system for AI personas
 * Extracts personal facts from user messages and stores in database
 */

/**
 * Extract personal facts from user message
 */
function extractMemories(userMessage) {
    const memories = []
    const msg = userMessage.toLowerCase()
    const original = userMessage

    console.log('[Memory] Extracting from:', msg.substring(0, 100))

    // Name detection
    const namePatterns = [
        /my name is\s+([A-Za-z]+)/i,
        /(?:i'm|i am)\s+([A-Z][a-z]+)(?:\s|,|\.|\!|$)/,
        /call me\s+([A-Za-z]+)/i,
    ]
    for (const pattern of namePatterns) {
        const match = original.match(pattern)
        if (match && match[1] && match[1].length > 1) {
            const name = match[1]
            // Skip common words
            if (!['not', 'from', 'here', 'just', 'very', 'really', 'so', 'too'].includes(name.toLowerCase())) {
                memories.push({ fact: `User's name is ${name}`, category: 'name' })
                break
            }
        }
    }

    // Age
    const agePatterns = [
        /i(?:'m| am)\s+(\d{1,2})\s*(?:years? old|yrs?|yo)/i,
        /(\d{1,2})\s*years? old/i,
        /age\s*(?:is)?\s*(\d{1,2})/i,
    ]
    for (const pattern of agePatterns) {
        const match = original.match(pattern)
        if (match && match[1]) {
            memories.push({ fact: `User is ${match[1]} years old`, category: 'age' })
            break
        }
    }

    // Birthday
    if (msg.includes('birthday') || msg.includes('born') || msg.includes('dob')) {
        const bdayPatterns = [
            /(?:birthday|born|dob|birth date)[:\s]+(?:is\s+)?(.+?)(?:\.|,|!|$)/i,
            /(?:birthday|born|dob|birth date)[:\s]+(.+)/i,
        ]
        for (const pattern of bdayPatterns) {
            const match = original.match(pattern)
            if (match && match[1]) {
                memories.push({ fact: `Birthday: ${match[1].trim()}`, category: 'birthday' })
                break
            }
        }
    }

    // Location
    if (msg.includes('from') || msg.includes('live') || msg.includes('based')) {
        const locPatterns = [
            /(?:i'm from|i am from|from)\s+([A-Z][a-zA-Z\s,]+)/i,
            /(?:live in|based in|living in)\s+([A-Z][a-zA-Z\s,]+)/i,
        ]
        for (const pattern of locPatterns) {
            const match = original.match(pattern)
            if (match && match[1]) {
                memories.push({ fact: `Location: ${match[1].trim()}`, category: 'location' })
                break
            }
        }
    }

    // Profession
    if (msg.includes('work') || msg.includes('job') || msg.includes('i am a') || msg.includes("i'm a")) {
        const profPatterns = [
            /(?:work as|working as)\s+(?:a |an )?([a-zA-Z\s]+?)(?:\s+at|\s+in|\.|,|!|$)/i,
            /(?:i am a|i'm a)\s+([a-zA-Z\s]+?)(?:\s+at|\s+in|\.|,|!|$)/i,
            /my (?:job|profession) is\s+([a-zA-Z\s]+)/i,
        ]
        for (const pattern of profPatterns) {
            const match = original.match(pattern)
            if (match && match[1] && match[1].trim().length > 2) {
                memories.push({ fact: `Profession: ${match[1].trim()}`, category: 'profession' })
                break
            }
        }
    }

    // Interests & Hobbies
    if (msg.includes('love') || msg.includes('like') || msg.includes('enjoy') || msg.includes('hobby')) {
        const intPatterns = [
            /(?:i love|i like|i enjoy)\s+([a-zA-Z\s]+?)(?:\.|,|!|$)/i,
            /my hobby is\s+([a-zA-Z\s]+)/i,
            /into\s+([a-zA-Z\s]+?)(?:\.|,|!|$)/i,
        ]
        for (const pattern of intPatterns) {
            const match = original.match(pattern)
            if (match && match[1] && match[1].trim().length > 2) {
                memories.push({ fact: `Interest: ${match[1].trim()}`, category: 'interest' })
                break
            }
        }
    }

    // Family
    if (msg.includes('married') || msg.includes('wife') || msg.includes('husband') ||
        msg.includes('children') || msg.includes('kids') || msg.includes('daughter') || msg.includes('son')) {
        const famPatterns = [
            /(?:i have|i've got)\s+(\d+)?\s*(children|kids|sons?|daughters?)/i,
            /(?:my wife|my husband|i'm married)/i,
        ]
        for (const pattern of famPatterns) {
            const match = original.match(pattern)
            if (match) {
                memories.push({ fact: `Family: ${match[0].trim()}`, category: 'family' })
                break
            }
        }
    }

    console.log('[Memory] Extracted:', memories.length, 'facts:', memories.map(m => m.fact))
    return memories
}

/**
 * Save memories to database
 */
async function saveMemories(userId, personaSlug, memories, supabaseClient) {
    if (!memories || memories.length === 0) {
        console.log('[Memory] No memories to save')
        return { success: false }
    }

    console.log('[Memory] Attempting to save', memories.length, 'memories for user:', userId)

    const data = memories.map(m => ({
        user_id: userId,
        persona_slug: personaSlug || 'general',
        memory_type: m.category || 'fact',
        content: m.fact,
        importance: m.category === 'name' ? 10 : 7
    }))

    console.log('[Memory] Data to insert:', JSON.stringify(data))

    try {
        const { data: result, error } = await supabaseClient
            .from('conversation_memories')
            .insert(data)
            .select()

        if (error) {
            console.error('[Memory] ❌ Database error:', error.message, error.details, error.hint)
            return { success: false, error: error.message }
        }

        console.log('[Memory] ✅ Successfully saved', data.length, 'memories. Result:', result)
        return { success: true, count: data.length }
    } catch (e) {
        console.error('[Memory] ❌ Exception:', e.message)
        return { success: false, error: e.message }
    }
}

/**
 * Get user's memories
 */
export async function getUserMemories(userId, personaSlug = null, supabaseClient = supabase) {
    if (!userId) {
        console.log('[Memory] getUserMemories: No userId provided')
        return []
    }

    console.log('[Memory] Fetching memories for user:', userId)

    try {
        const { data, error } = await supabaseClient
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
    } catch (e) {
        console.error('[Memory] Exception:', e.message)
        return []
    }
}

/**
 * Format memories for AI context
 */
export function formatMemoriesForContext(memories, userProfile) {
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

    const result = lines.join('\n')
    console.log('[Memory] Context for AI:', result || '(empty)')
    return result
}

/**
 * Main function - called from chat API
 */
export async function extractAndSaveMemories(userId, personaSlug, conversationId, userMessage, aiResponse, supabaseClient = supabase) {
    console.log('[Memory] ========== EXTRACTION START ==========')
    console.log('[Memory] userId:', userId)
    console.log('[Memory] personaSlug:', personaSlug)
    console.log('[Memory] message:', userMessage?.substring(0, 100))

    if (!userId) {
        console.log('[Memory] ❌ No userId - skipping (user not authenticated)')
        return []
    }

    if (!userMessage) {
        console.log('[Memory] ❌ No message - skipping')
        return []
    }

    // Extract memories from message
    const memories = extractMemories(userMessage)

    if (memories.length > 0) {
        console.log('[Memory] Found', memories.length, 'memories, saving...')
        const result = await saveMemories(userId, personaSlug, memories, supabaseClient)
        console.log('[Memory] Save result:', result)
    } else {
        console.log('[Memory] No personal info detected in message')
    }

    console.log('[Memory] ========== EXTRACTION END ==========')
    return memories
}
