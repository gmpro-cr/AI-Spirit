import { supabase } from './supabase.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Comprehensive memory system for AI personas
 * Uses Gemini AI to extract ALL personal facts from conversations
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Extract ALL personal information from user message using AI
 */
async function extractWithAI(userMessage) {
    if (!process.env.GEMINI_API_KEY) {
        console.log('[Memory] No Gemini API key, using fallback')
        return extractMemoriesSimple(userMessage)
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `You are a memory extraction system. Extract ALL personal facts from what the user said.

User message: "${userMessage}"

Extract ANY personal information including but not limited to:
- Name, nickname
- Age, birthday, birth date, birth time, birth place
- Location, city, country, where they live
- Job, profession, company, work
- Family (spouse, children, parents, siblings)
- Interests, hobbies, likes, dislikes
- Goals, plans, dreams
- Health conditions, diet preferences
- Education, qualifications
- Pets, possessions
- Religion, beliefs
- Any other personal details

Return a JSON array. Each item has "fact" (the information) and "type" (category).
If nothing personal was shared, return empty array [].

Example: User says "I'm John, 25, from Mumbai. I love cricket."
Output: [{"fact":"User's name is John","type":"name"},{"fact":"User is 25 years old","type":"age"},{"fact":"User is from Mumbai","type":"location"},{"fact":"User loves cricket","type":"interest"}]

IMPORTANT: Return ONLY the JSON array, nothing else.`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            console.log('[Memory AI] Extracted:', parsed.length, 'facts')
            return parsed.map(p => ({ fact: p.fact, category: p.type || 'fact' }))
        }
        return []
    } catch (error) {
        console.error('[Memory AI] Error:', error.message)
        return extractMemoriesSimple(userMessage)
    }
}

/**
 * Simple keyword-based extraction (fallback)
 */
function extractMemoriesSimple(userMessage) {
    const memories = []
    const msg = userMessage.toLowerCase()

    // Name
    const nameMatch = userMessage.match(/(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+)/i)
    if (nameMatch) memories.push({ fact: `User's name is ${nameMatch[1]}`, category: 'name' })

    // Age
    const ageMatch = userMessage.match(/i(?:'m| am)\s+(\d{1,3})\s*(?:years? old|yrs?)/i)
    if (ageMatch) memories.push({ fact: `User is ${ageMatch[1]} years old`, category: 'age' })

    // Location
    const locMatch = userMessage.match(/(?:live in|from|based in)\s+([A-Z][a-zA-Z\s,]+)/i)
    if (locMatch) memories.push({ fact: `Lives in ${locMatch[1].trim()}`, category: 'location' })

    // Profession
    const profMatch = userMessage.match(/(?:work as|i am a|i'm a|working as)\s+([a-zA-Z\s]+?)(?:\s+at|\s+in|\.|,|$)/i)
    if (profMatch) memories.push({ fact: `Works as ${profMatch[1].trim()}`, category: 'profession' })

    // Birthday
    const bdayMatch = userMessage.match(/(?:birthday|born on|dob|birth date)[:\s]+([^.,!]+)/i)
    if (bdayMatch) memories.push({ fact: `Birthday: ${bdayMatch[1].trim()}`, category: 'birthday' })

    // Interests
    const intMatch = userMessage.match(/(?:love|like|enjoy|into)\s+([a-zA-Z\s]+?)(?:\.|,|!|$)/i)
    if (intMatch && intMatch[1].length > 2) memories.push({ fact: `Likes ${intMatch[1].trim()}`, category: 'interest' })

    // Family
    if (msg.includes('married') || msg.includes('wife') || msg.includes('husband') || msg.includes('children') || msg.includes('kids')) {
        const famMatch = userMessage.match(/(?:i have|my|i'm)\s*([^.,!]+(?:wife|husband|married|children|kids|son|daughter)[^.,!]*)/i)
        if (famMatch) memories.push({ fact: `Family: ${famMatch[1].trim()}`, category: 'family' })
    }

    return memories
}

/**
 * Save memories to database
 */
async function saveMemories(userId, personaSlug, memories, supabaseClient) {
    if (!memories || memories.length === 0) return { success: false }

    console.log('[Memory] Saving', memories.length, 'memories')

    const data = memories.map(m => ({
        user_id: userId,
        persona_slug: personaSlug,
        memory_type: m.category || 'fact',
        content: m.fact,
        importance: m.category === 'name' ? 10 : 7
    }))

    try {
        const { error } = await supabaseClient
            .from('conversation_memories')
            .insert(data)

        if (error) {
            console.error('[Memory] Save error:', error.message)
            return { success: false }
        }
        console.log('[Memory] ✅ Saved successfully')
        return { success: true }
    } catch (e) {
        console.error('[Memory] Exception:', e.message)
        return { success: false }
    }
}

/**
 * Get user's memories
 */
export async function getUserMemories(userId, personaSlug = null, supabaseClient = supabase) {
    if (!userId) return []

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

    return lines.join('\n')
}

/**
 * Main function - called from chat API
 */
export async function extractAndSaveMemories(userId, personaSlug, conversationId, userMessage, aiResponse, supabaseClient = supabase) {
    console.log('[Memory] Processing for user:', userId, '| Message:', userMessage.substring(0, 50))

    if (!userId) {
        console.log('[Memory] Skipping - no user')
        return []
    }

    // Use AI to extract comprehensive memories
    const memories = await extractWithAI(userMessage)

    if (memories.length > 0) {
        await saveMemories(userId, personaSlug, memories, supabaseClient)
    } else {
        console.log('[Memory] No personal info found in message')
    }

    return memories
}
