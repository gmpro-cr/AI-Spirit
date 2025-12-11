import { supabase } from './supabase.js'

/**
 * Extract memories from a conversation
 * This is a simple keyword-based extraction for now
 * Can be enhanced with AI-based extraction later
 */
export async function extractAndSaveMemories(userId, personaSlug, conversationId, userMessage, aiResponse, supabaseClient = supabase) {
    console.log('[Memory System] extractAndSaveMemories called:', {
        userId: userId || 'MISSING',
        personaSlug,
        conversationId,
        userMessageLength: userMessage?.length,
        userMessagePreview: userMessage?.substring(0, 100)
    })

    if (!userId) {
        console.log('[Memory System] ❌ Skipping - no userId')
        return // Only save memories for authenticated users
    }

    const memories = []

    // Extract from user message
    const userText = userMessage.toLowerCase()

    // Common stopwords to ignore for names
    const stopWords = new Set(['not', 'just', 'only', 'very', 'so', 'too', 'here', 'there', 'now', 'then', 'sorry', 'sure', 'ok', 'okay', 'yes', 'no', 'interested', 'looking', 'trying', 'planning', 'hoping', 'going', 'gonna', 'wanna'])

    // Pattern 1: "My name is X" or "I'm X" or "I am X"
    const namePatterns = [
        /(?:my name is|i'm called|i am|call me)\s+([a-z]+)/i,
        /(?:i'm|i am)\s+([a-z]+)(?:\s|$)/i
    ]

    for (const pattern of namePatterns) {
        const match = userMessage.match(pattern)
        if (match && match[1] && match[1].length > 2) {
            const name = match[1].toLowerCase()
            if (!stopWords.has(name)) {
                memories.push({
                    type: 'fact',
                    content: `User's name is ${match[1]}`,
                    importance: 10
                })
                break
            }
        }
    }

    // Pattern 2: "I love/like X" or "I enjoy X"
    const interestPatterns = [
        /i (?:love|like|enjoy|am interested in)\s+([^.,!?]+)/gi
    ]

    for (const pattern of interestPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3 && !match[1].toLowerCase().includes('not')) {
                memories.push({
                    type: 'preference',
                    content: `Likes ${match[1].trim()}`,
                    importance: 7
                })
            }
        }
    }

    // Pattern 3: "I want to X" or "My goal is X"
    const goalPatterns = [
        /i (?:want to|plan to|hope to|am trying to)\s+([^.,!?]+)/gi,
        /my goal is (?:to\s+)?([^.,!?]+)/gi
    ]

    for (const pattern of goalPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3) {
                memories.push({
                    type: 'goal',
                    content: `Goal: ${match[1].trim()}`,
                    importance: 8
                })
            }
        }
    }

    // Pattern 4: "I work as X" or "I'm a X"
    const professionPatterns = [
        /i (?:work as|am a|work in)\s+([^.,!?]+)/gi
    ]

    for (const pattern of professionPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3) {
                memories.push({
                    type: 'fact',
                    content: `Works as ${match[1].trim()}`,
                    importance: 8
                })
            }
        }
    }

    // Pattern 5: "I live in X" or "I'm from X"
    const locationPatterns = [
        /i (?:live in|am from|am based in)\s+([^.,!?]+)/gi
    ]

    for (const pattern of locationPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 2) {
                memories.push({
                    type: 'fact',
                    content: `Lives in ${match[1].trim()}`,
                    importance: 7
                })
            }
        }
    }

    // Pattern 6: Birth details (important for Astro Guide)
    const birthPatterns = [
        /(?:was|am) born (?:in|on|at)\s+([^.,!?]+)/gi,
        /my birth(?:date|day) is\s+([^.,!?]+)/gi,
        /date of birth is\s+([^.,!?]+)/gi,
        /dob is\s+([^.,!?]+)/gi
    ]

    for (const pattern of birthPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3) {
                memories.push({
                    type: 'fact',
                    content: `Born: ${match[1].trim()}`,
                    importance: 9
                })
            }
        }
    }

    // Pattern 7: Family details
    const familyPatterns = [
        /i have (?:a |an )?(\d+)?\s*(?:son|daughter|child|children|kid|kids)/gi,
        /my (?:wife|husband|spouse|partner) is (?:named )?([^.,!?]+)/gi,
        /my (?:wife|husband|spouse|partner) (?:works as|is a) ([^.,!?]+)/gi,
        /i'm (?:married|single|divorced|widowed)/gi,
        /my (?:mother|father|mom|dad|brother|sister|sibling) is ([^.,!?]+)/gi,
        /i have (?:a |an )?([^.,!?]+) (?:mother|father|mom|dad|brother|sister)/gi
    ]

    for (const pattern of familyPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            const fullMatch = match[0]
            if (fullMatch && fullMatch.length > 5) {
                memories.push({
                    type: 'fact',
                    content: `Family: ${fullMatch.trim()}`,
                    importance: 8
                })
            }
        }
    }

    // Pattern 8: Health & Medical
    const healthPatterns = [
        /i (?:have|suffer from|am diagnosed with) ([^.,!?]+)/gi,
        /i'm allergic to ([^.,!?]+)/gi,
        /i take ([^.,!?]+) (?:medication|medicine|pills)/gi,
        /my (?:height|weight) is ([^.,!?]+)/gi,
        /i (?:exercise|work out|train) ([^.,!?]+)/gi
    ]

    for (const pattern of healthPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3) {
                memories.push({
                    type: 'fact',
                    content: `Health: ${match[0].trim()}`,
                    importance: 7
                })
            }
        }
    }

    // Pattern 9: Education
    const educationPatterns = [
        /i (?:studied|study|am studying) ([^.,!?]+)/gi,
        /i (?:graduated from|went to|attended) ([^.,!?]+) (?:university|college|school)/gi,
        /i have a (?:degree|diploma|certification) in ([^.,!?]+)/gi,
        /my major (?:is|was) ([^.,!?]+)/gi
    ]

    for (const pattern of educationPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3) {
                memories.push({
                    type: 'fact',
                    content: `Education: ${match[0].trim()}`,
                    importance: 7
                })
            }
        }
    }

    // Pattern 10: Hobbies & Activities
    const hobbyPatterns = [
        /i (?:play|practice) ([^.,!?]+)/gi,
        /i'm (?:into|passionate about) ([^.,!?]+)/gi,
        /my hobby is ([^.,!?]+)/gi,
        /i (?:collect|build|create|make) ([^.,!?]+)/gi,
        /i spend (?:my )?(?:free )?time ([^.,!?]+)/gi
    ]

    for (const pattern of hobbyPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3 && !match[1].toLowerCase().includes('not')) {
                memories.push({
                    type: 'preference',
                    content: `Hobby: ${match[0].trim()}`,
                    importance: 6
                })
            }
        }
    }

    // Pattern 11: Career & Work
    const careerPatterns = [
        /i work at ([^.,!?]+)/gi,
        /my company is ([^.,!?]+)/gi,
        /i'm (?:a |an )?([^.,!?]+) at ([^.,!?]+)/gi,
        /my (?:job title|position|role) is ([^.,!?]+)/gi,
        /i've been working (?:for|at) ([^.,!?]+)/gi,
        /my salary is ([^.,!?]+)/gi,
        /i earn ([^.,!?]+)/gi
    ]

    for (const pattern of careerPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[0] && match[0].length > 5) {
                memories.push({
                    type: 'fact',
                    content: `Career: ${match[0].trim()}`,
                    importance: 8
                })
            }
        }
    }

    // Pattern 12: Food & Dietary Preferences
    const foodPatterns = [
        /i'm (?:a )?(?:vegetarian|vegan|pescatarian|carnivore)/gi,
        /i (?:don't|do not) eat ([^.,!?]+)/gi,
        /my favorite food is ([^.,!?]+)/gi,
        /i (?:love|hate) ([^.,!?]+) food/gi
    ]

    for (const pattern of foodPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[0] && match[0].length > 5) {
                memories.push({
                    type: 'preference',
                    content: `Food: ${match[0].trim()}`,
                    importance: 6
                })
            }
        }
    }

    // Pattern 13: Pets
    const petPatterns = [
        /i have (?:a |an )?([^.,!?]+) (?:dog|cat|pet|bird|fish)/gi,
        /my (?:dog|cat|pet) is (?:named |called )?([^.,!?]+)/gi
    ]

    for (const pattern of petPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[0] && match[0].length > 5) {
                memories.push({
                    type: 'fact',
                    content: `Pet: ${match[0].trim()}`,
                    importance: 6
                })
            }
        }
    }

    // Pattern 14: Languages
    const languagePatterns = [
        /i speak ([^.,!?]+)/gi,
        /i'm (?:fluent in|learning) ([^.,!?]+)/gi,
        /my (?:native|mother) language is ([^.,!?]+)/gi
    ]

    for (const pattern of languagePatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 2) {
                memories.push({
                    type: 'fact',
                    content: `Language: ${match[0].trim()}`,
                    importance: 7
                })
            }
        }
    }

    // Pattern 15: Beliefs & Values
    const beliefPatterns = [
        /i'm (?:a )?(?:christian|muslim|hindu|buddhist|atheist|agnostic|spiritual)/gi,
        /i believe in ([^.,!?]+)/gi,
        /my religion is ([^.,!?]+)/gi
    ]

    for (const pattern of beliefPatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[0] && match[0].length > 5) {
                memories.push({
                    type: 'fact',
                    content: `Belief: ${match[0].trim()}`,
                    importance: 7
                })
            }
        }
    }

    // Pattern 16: Age
    const agePatterns = [
        /i'm (\d+) years old/gi,
        /i am (\d+) years old/gi,
        /my age is (\d+)/gi
    ]

    for (const pattern of agePatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1]) {
                memories.push({
                    type: 'fact',
                    content: `Age: ${match[1]} years old`,
                    importance: 8
                })
            }
        }
    }

    // Pattern 17: Challenges & Problems
    const challengePatterns = [
        /i'm struggling with ([^.,!?]+)/gi,
        /i have (?:a )?problem with ([^.,!?]+)/gi,
        /i'm worried about ([^.,!?]+)/gi,
        /i'm afraid of ([^.,!?]+)/gi
    ]

    for (const pattern of challengePatterns) {
        const matches = [...userMessage.matchAll(pattern)]
        for (const match of matches) {
            if (match[1] && match[1].length > 3) {
                memories.push({
                    type: 'fact',
                    content: `Challenge: ${match[0].trim()}`,
                    importance: 7
                })
            }
        }
    }

    // Save memories to database
    console.log('[Memory System] Extracted memories:', memories.length, memories.map(m => m.content))

    if (memories.length > 0) {
        try {
            const memoriesToInsert = memories.map(memory => ({
                user_id: userId,
                persona_slug: personaSlug,
                memory_type: memory.type,
                content: memory.content,
                importance: memory.importance,
                conversation_id: conversationId,
                context: `From conversation: "${userMessage.substring(0, 100)}..."`
            }))

            const { error } = await supabaseClient
                .from('conversation_memories')
                .insert(memoriesToInsert)

            if (error) {
                console.error('Error saving memories:', error)
            } else {
                console.log(`✅ Saved ${memories.length} memories for user`)
            }
        } catch (error) {
            console.error('Error in memory extraction:', error)
        }
    }

    return memories
}

/**
 * Get relevant memories for a user and persona
 * By default, memories are shared across ALL personas (cross-persona memory)
 * This makes conversations feel more continuous and personalized
 */
export async function getUserMemories(userId, personaSlug = null, supabaseClient = supabase) {
    if (!userId) return []

    try {
        let query = supabaseClient
            .from('conversation_memories')
            .select('*')
            .eq('user_id', userId)
            .order('importance', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(20)

        // Note: We intentionally DON'T filter by persona_slug by default
        // This allows memories to be shared across all personas
        // Example: If you tell Einstein your name, Gandhi will also know it
        // This creates a more cohesive and personalized experience

        const { data, error } = await query

        if (error) {
            console.error('Error fetching memories:', error)
            return []
        }

        // Update last_accessed_at for retrieved memories
        if (data && data.length > 0) {
            const memoryIds = data.map(m => m.id)
            await supabaseClient
                .from('conversation_memories')
                .update({ last_accessed_at: new Date().toISOString() })
                .in('id', memoryIds)
        }

        return data || []
    } catch (error) {
        console.error('Error in getUserMemories:', error)
        return []
    }
}

/**
 * Format memories for AI context
 */
export function formatMemoriesForContext(memories, userProfile) {
    if (!memories || memories.length === 0) {
        if (userProfile?.preferred_name) {
            return `User's name: ${userProfile.preferred_name}`
        }
        return ''
    }

    const lines = []

    // Add user profile info first
    if (userProfile) {
        if (userProfile.preferred_name) {
            lines.push(`- User's name: ${userProfile.preferred_name}`)
        }
        if (userProfile.interests && userProfile.interests.length > 0) {
            lines.push(`- Interests: ${userProfile.interests.join(', ')}`)
        }
        if (userProfile.goals && userProfile.goals.length > 0) {
            lines.push(`- Goals: ${userProfile.goals.join(', ')}`)
        }
    }

    // Add conversation memories
    const uniqueMemories = new Map()
    for (const memory of memories) {
        // Avoid duplicates
        if (!uniqueMemories.has(memory.content)) {
            uniqueMemories.set(memory.content, memory)
        }
    }

    for (const memory of uniqueMemories.values()) {
        lines.push(`- ${memory.content}`)
    }

    return lines.join('\n')
}
