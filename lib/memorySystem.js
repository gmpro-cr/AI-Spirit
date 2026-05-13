import { supabase } from './supabase.js'

/**
 * PERSONA-SPECIFIC MEMORY SYSTEM
 *
 * CRITICAL RULES:
 * 1. Each persona has its OWN private memory vault
 * 2. Memories are NEVER shared between personas
 * 3. When user tells something to Persona A, ONLY Persona A remembers it
 * 4. Persona B has NO ACCESS to Persona A's memories
 *
 * EXAMPLE:
 * - User tells Elon Musk: "My name is John, I work at Google"
 * - Elon Musk remembers: "John works at Google"
 * - User talks to Birbal: Birbal has NO IDEA who John is
 * - User tells Birbal: "My name is John, I'm from Delhi"
 * - Birbal remembers: "John from Delhi" (separate memory)
 * - These memories are ISOLATED - never shared
 *
 * DATABASE STRUCTURE:
 * - conversation_memories table has: user_id + persona_slug + content
 * - Filtering by BOTH user_id AND persona_slug ensures isolation
 * - Each persona-user pair has its own memory context
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
    // Expanded list of words to skip (common verbs, adjectives, and words that appear after "I am")
    const skipWords = [
        'not', 'from', 'here', 'just', 'very', 'really', 'so', 'too',
        // Common verbs/gerunds
        'learning', 'having', 'feeling', 'looking', 'trying', 'going', 'doing', 'working',
        'thinking', 'wondering', 'hoping', 'waiting', 'getting', 'making', 'taking', 'coming',
        'asking', 'telling', 'saying', 'seeing', 'being', 'starting', 'struggling',
        // Common adjectives/states
        'confused', 'married', 'sad', 'happy', 'worried', 'scared', 'excited', 'tired',
        'interested', 'curious', 'concerned', 'stressed', 'anxious', 'afraid', 'alone',
        'new', 'old', 'young', 'single', 'divorced', 'pregnant', 'sick',
        // Common descriptors
        'student', 'developer', 'engineer', 'doctor', 'teacher', 'manager',
        // Age-related (covered by separate age pattern)
        'years'
    ]
    for (const pattern of namePatterns) {
        const match = original.match(pattern)
        if (match && match[1] && match[1].length > 1) {
            const name = match[1]
            if (!skipWords.includes(name.toLowerCase())) {
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

    // Birth Details - Critical for Astrologer persona
    // Date of Birth
    if (msg.includes('birth') || msg.includes('born') || msg.includes('dob') || msg.includes('birthday')) {
        const dobPatterns = [
            // "date of birth is 15th August 1990" or "dob: 15/08/1990"
            /(?:date of birth|dob|birth date)[:\s]+(?:is\s+)?([0-9]{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[0-9]{2,4})/i,
            /(?:date of birth|dob|birth date)[:\s]+(?:is\s+)?([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
            // Compact 8-digit format: "08091992" (DDMMYYYY)
            /(?:date of birth|dob|birth date)[:\s]+(?:is\s+)?([0-9]{8})\b/i,
            // "born on 15th August 1990"
            /born\s+(?:on\s+)?([0-9]{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[0-9]{2,4})/i,
            /born\s+(?:on\s+)?([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
            // "birthday is 15th August"
            /(?:birthday|bday)[:\s]+(?:is\s+)?([0-9]{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(?:[0-9]{2,4})?)/i,
        ]
        for (const pattern of dobPatterns) {
            const match = original.match(pattern)
            if (match && match[1]) {
                memories.push({ fact: `Date of Birth: ${match[1].trim()}`, category: 'birth_details' })
                break
            }
        }
    }

    // Time of Birth - Critical for Astrology
    if (msg.includes('time') && (msg.includes('birth') || msg.includes('born'))) {
        const tobPatterns = [
            // "time of birth is 10:30 AM"
            /(?:time of birth|birth time)[:\s]+(?:is\s+)?([0-9]{1,2}[:\.]?[0-9]{0,2}\s*(?:am|pm|AM|PM)?)/i,
            // "born at 10:30 AM"
            /born\s+(?:at\s+)?([0-9]{1,2}[:\.]?[0-9]{0,2}\s*(?:am|pm|AM|PM))/i,
        ]
        for (const pattern of tobPatterns) {
            const match = original.match(pattern)
            if (match && match[1]) {
                memories.push({ fact: `Time of Birth: ${match[1].trim()}`, category: 'birth_details' })
                break
            }
        }
    }

    // Place of Birth - Critical for Astrology
    if (msg.includes('place') && (msg.includes('birth') || msg.includes('born'))) {
        const pobPatterns = [
            // "place of birth is Mumbai" or "born in Mumbai, India"
            /(?:place of birth|birth place|birthplace)[:\s]+(?:is\s+)?([A-Z][a-zA-Z\s,]+?)(?:\.|!|$|\s+(?:and|my|i|the|at|on))/i,
            /born\s+(?:in|at)\s+([A-Z][a-zA-Z\s,]+?)(?:\.|!|$|\s+(?:and|my|i|the|at|on|time))/i,
        ]
        for (const pattern of pobPatterns) {
            const match = original.match(pattern)
            if (match && match[1] && match[1].trim().length > 2) {
                memories.push({ fact: `Place of Birth: ${match[1].trim()}`, category: 'birth_details' })
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
 * CRITICAL: Always saves with persona_slug to ensure isolation
 */
async function saveMemories(userId, personaSlug, memories, supabaseClient) {
    if (!memories || memories.length === 0) {
        console.log('[Memory] No memories to save')
        return { success: false }
    }

    if (!personaSlug) {
        console.error('[Memory] ❌ CRITICAL ERROR: No persona_slug provided! Refusing to save (prevents cross-contamination)')
        return { success: false, error: 'Missing persona_slug' }
    }

    console.log('[Memory] Attempting to save', memories.length, 'memories for user:', userId, 'persona:', personaSlug)

    const data = memories.map(m => ({
        user_id: userId,
        persona_slug: personaSlug,  // REQUIRED - ensures persona isolation
        memory_type: m.category || 'fact',
        content: m.fact,
        importance: m.category === 'name' ? 10 : 7
    }))

    console.log('[Memory] Data to insert (PERSONA-SPECIFIC):', JSON.stringify(data))

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
 * Get user's memories FOR A SPECIFIC PERSONA ONLY
 * CRITICAL: Memories are NEVER shared between personas
 * Each persona has its own private memory vault
 */
export async function getUserMemories(userId, personaSlug = null, supabaseClient = supabase) {
    if (!userId) {
        console.log('[Memory] getUserMemories: No userId provided')
        return []
    }

    if (!personaSlug) {
        console.log('[Memory] ❌ NO personaSlug - REFUSING to fetch memories (prevents leakage)')
        return []
    }

    console.log('[Memory] Fetching PERSONA-SPECIFIC memories for user:', userId, 'persona:', personaSlug)

    try {
        // CRITICAL: Filter by BOTH user_id AND persona_slug
        // This ensures persona A NEVER sees persona B's memories
        const { data, error } = await supabaseClient
            .from('conversation_memories')
            .select('content, memory_type, importance')
            .eq('user_id', userId)
            .eq('persona_slug', personaSlug)  // PERSONA-SPECIFIC FILTER
            .order('importance', { ascending: false })
            .limit(20)

        if (error) {
            console.error('[Memory] Fetch error:', error.message)
            return []
        }

        console.log('[Memory] Found', data?.length || 0, 'PERSONA-SPECIFIC memories for', personaSlug)
        return data || []
    } catch (e) {
        console.error('[Memory] Exception:', e.message)
        return []
    }
}

/**
 * Sanitize a memory string to prevent prompt injection via stored content.
 * Strips characters that could break out of the prompt context.
 */
function sanitizeMemoryContent(text) {
    if (!text || typeof text !== 'string') return ''
    return text
        // Remove common prompt-injection delimiters
        .replace(/```/g, '')
        .replace(/---/g, '')
        // Strip anything that looks like a system-level instruction marker
        .replace(/\[\s*(?:INST|SYS|SYSTEM|HUMAN|ASSISTANT)\s*\]/gi, '')
        // Collapse multiple newlines into one to prevent section spoofing
        .replace(/\n{2,}/g, '\n')
        .trim()
}

/**
 * Format memories for AI context
 */
export function formatMemoriesForContext(memories, userProfile) {
    const lines = []

    if (userProfile?.preferred_name) {
        const safeName = sanitizeMemoryContent(userProfile.preferred_name)
        if (safeName) lines.push(`User's name: ${safeName}`)
    }

    const seen = new Set()
    for (const m of memories) {
        const safeContent = sanitizeMemoryContent(m.content)
        if (safeContent && !seen.has(safeContent)) {
            lines.push(`- ${safeContent}`)
            seen.add(safeContent)
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
