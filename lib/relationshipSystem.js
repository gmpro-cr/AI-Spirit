/**
 * Relationship System
 * Tracks and manages user-persona relationship depth
 */

/**
 * Get relationship level name and description
 */
export function getRelationshipInfo(level) {
    const levels = {
        1: {
            name: 'Acquaintance',
            description: 'Just getting to know each other',
            color: 'gray',
            icon: '👋'
        },
        2: {
            name: 'Friend',
            description: 'Building a connection',
            color: 'blue',
            icon: '🤝'
        },
        3: {
            name: 'Close Friend',
            description: 'Deep understanding developing',
            color: 'purple',
            icon: '💙'
        },
        4: {
            name: 'Trusted Advisor',
            description: 'Strong bond established',
            color: 'indigo',
            icon: '⭐'
        },
        5: {
            name: 'Life Partner',
            description: 'Mastery level connection',
            color: 'gold',
            icon: '👑'
        }
    }

    return levels[level] || levels[1]
}

/**
 * Calculate relationship level from conversation count
 */
export function calculateRelationshipLevel(conversationCount) {
    if (conversationCount >= 51) return 5
    if (conversationCount >= 31) return 4
    if (conversationCount >= 16) return 3
    if (conversationCount >= 6) return 2
    return 1
}

/**
 * Get progress to next level
 */
export function getProgressToNextLevel(conversationCount) {
    const thresholds = [0, 6, 16, 31, 51]
    const currentLevel = calculateRelationshipLevel(conversationCount)

    if (currentLevel === 5) {
        return { percentage: 100, remaining: 0, nextThreshold: 51 }
    }

    const currentThreshold = thresholds[currentLevel - 1]
    const nextThreshold = thresholds[currentLevel]
    const progress = conversationCount - currentThreshold
    const total = nextThreshold - currentThreshold
    const percentage = Math.round((progress / total) * 100)
    const remaining = nextThreshold - conversationCount

    return { percentage, remaining, nextThreshold }
}

/**
 * Get relationship context for AI prompt
 */
export function getRelationshipContext(level, conversationCount) {
    const info = getRelationshipInfo(level)

    const contexts = {
        1: `This is one of your first conversations with this user (${conversationCount} total). Be welcoming but professional. Introduce yourself and your expertise.`,
        2: `You've had ${conversationCount} conversations with this user. You're becoming familiar. Reference general patterns you've noticed, but stay somewhat formal.`,
        3: `You've had ${conversationCount} deep conversations with this user. You know them well. Be more casual and personalized. Reference specific past topics naturally.`,
        4: `You've had ${conversationCount} conversations with this user. You're a trusted advisor. Be proactive with insights. Challenge them when needed. Use inside references.`,
        5: `You've had ${conversationCount} conversations with this user. You're life partners in this journey. Be deeply personal. Anticipate their needs. Celebrate milestones together.`
    }

    return contexts[level] || contexts[1]
}

/**
 * Fetch user's relationship with a persona
 */
export async function getPersonaRelationship(userId, personaSlug, supabase) {
    if (!userId) return null

    try {
        const { data, error } = await supabase
            .from('persona_relationships')
            .select('*')
            .eq('user_id', userId)
            .eq('persona_slug', personaSlug)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('[Relationship] Error fetching:', error)
            return null
        }

        return data
    } catch (err) {
        console.error('[Relationship] Exception:', err)
        return null
    }
}

/**
 * Fetch all user's persona relationships
 */
export async function getAllPersonaRelationships(userId, supabase) {
    if (!userId) return []

    try {
        const { data, error } = await supabase
            .from('persona_relationships')
            .select('*')
            .eq('user_id', userId)
            .order('conversation_count', { ascending: false })

        if (error) {
            console.error('[Relationship] Error fetching all:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('[Relationship] Exception:', err)
        return []
    }
}
