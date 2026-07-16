import { supabase } from './supabase.js'
import { stripReasoning, looksLikeLeakedReasoning } from './gemini.js'

// Memory categories the extractor may assign (kept in sync with saveMemories / retrieval)
const MEMORY_TYPES = ['name', 'age', 'birth_details', 'location', 'profession', 'interest', 'family', 'fact']

// Free OpenRouter models used for fact extraction, non-reasoning first (best at
// clean JSON). Same provider the chat uses. gpt-oss-120b:free was dropped
// 2026-07 (404, paid-only now). Nemotron stays LAST: it returns empty facts
// for extraction and leaks reasoning into summaries — it's a dead-end backstop.
const EXTRACTION_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
]
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

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
 * @deprecated Replaced by extractMemoriesLLM (Gemini). Kept for reference only —
 * this regex extractor produced false positives and missed natural phrasing.
 * No longer called by extractAndSaveMemories.
 */
// eslint-disable-next-line no-unused-vars
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
 * Parse the model's JSON reply into [{ fact, category }] (saveMemories shape).
 * Tolerant of code fences, {"facts":[...]} vs bare-array, and junk around JSON.
 */
function parseFactsJSON(text) {
    if (!text || typeof text !== 'string') return []
    let raw = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()

    let obj
    try {
        obj = JSON.parse(raw)
    } catch (e) {
        // Fall back to the first JSON object/array embedded in the text
        const m = raw.match(/[\[{][\s\S]*[\]}]/)
        if (!m) return []
        try { obj = JSON.parse(m[0]) } catch (e2) { return [] }
    }

    const arr = Array.isArray(obj) ? obj : Array.isArray(obj?.facts) ? obj.facts : []
    const out = []
    for (const item of arr.slice(0, 5)) {
        const content = sanitizeMemoryContent(item?.content)
        if (!content || content.length < 2) continue
        const category = MEMORY_TYPES.includes(item?.memory_type) ? item.memory_type : 'fact'
        out.push({ fact: content, category })
    }
    return out
}

/**
 * Extract durable personal facts from a user message using an LLM (OpenRouter —
 * the same provider the chat uses, so no extra API key is required).
 *
 * Replaces the brittle regex extractor: it understands natural phrasing,
 * ignores greetings/questions/opinions, and — given the facts already known
 * for this persona — returns ONLY new/changed facts (dedup).
 *
 * Returns array of { fact, category } (same shape saveMemories expects).
 * Never throws: on any failure (incl. all free models rate-limited) it logs and
 * returns [] — extraction is fire-and-forget and self-heals on the next message.
 */
async function extractMemoriesLLM(userMessage, existingMemories = []) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
        console.log('[Memory] No OPENROUTER_API_KEY — skipping LLM extraction')
        return []
    }

    const trimmed = (userMessage || '').trim()
    // Skip trivial messages ("hi", "ok") — no durable facts, saves quota
    if (trimmed.length < 4) return []

    const known = existingMemories.length
        ? existingMemories.map(m => `- ${m.content}`).join('\n')
        : '(nothing known yet)'

    const systemPrompt = `You extract durable personal facts about the USER from their message, so an AI persona can remember them across conversations.

Reply ONLY with JSON of the exact shape: {"facts":[{"content":"<concise fact>","memory_type":"<type>"}]}
- memory_type must be one of: ${MEMORY_TYPES.join(', ')}
- Only include stable facts the user states about THEMSELVES: name, age, birth details, location, profession, interests, family, or similar.
- Ignore greetings, questions, opinions about the persona, transient moods, and anything not about the user.
- Never include anything already known (or a paraphrase of it).
- If nothing new and durable, reply {"facts":[]}.
- Maximum 5 facts.`

    const userPrompt = `ALREADY KNOWN about this user (never repeat these):
${known}

USER'S LATEST MESSAGE:
"""${trimmed}"""`

    for (const model of EXTRACTION_MODELS) {
        try {
            const res = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://ai-spirit.in',
                    'X-Title': 'AI Spirit',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0,
                    max_tokens: 512,
                    reasoning: { exclude: true },
                    // NOTE: deliberately NOT using response_format:json_object —
                    // it makes the small nemotron model return empty {"facts":[]}.
                    // parseFactsJSON() is robust to plain / fenced / embedded JSON.
                }),
            })

            if (res.status === 429) {
                console.warn(`[Memory] extraction rate-limited on ${model}, trying next...`)
                continue
            }
            if (!res.ok) {
                console.error(`[Memory] extraction HTTP ${res.status} on ${model}`)
                continue
            }

            const data = await res.json()
            const text = data.choices?.[0]?.message?.content || ''
            const facts = parseFactsJSON(text)
            console.log('[Memory] LLM extracted', facts.length, 'facts via', model, ':', facts.map(f => f.fact))
            return facts
        } catch (e) {
            console.error(`[Memory] extraction error on ${model}:`, e.message)
            continue
        }
    }

    console.warn('[Memory] all extraction models unavailable — skipping this turn')
    return []
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
export async function extractAndSaveMemories(userId, personaSlug, conversationId, userMessage, aiResponse, existingMemories = [], supabaseClient = supabase) {
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

    // Extract memories from message via Gemini (dedups against existingMemories)
    const memories = await extractMemoriesLLM(userMessage, existingMemories)

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

/**
 * CONVERSATION SUMMARIES — layer 3 of the memory system.
 * Each conversation gets a rolling ~80-word summary so a persona can recall
 * WHAT was discussed in earlier chats, not just durable facts about the user.
 * Same user_id + persona_slug isolation rules as conversation_memories.
 */
const SUMMARY_MIN_MESSAGES = 4      // don't summarize tiny conversations
const SUMMARY_REFRESH_EVERY = 6     // re-summarize after this many new messages

// Untagged reasoning leaks specific to the summarize task (Nemotron restates
// the instructions before writing the summary). A real summary never
// references the prompt's own constraints.
const SUMMARY_LEAK_PATTERNS = [
    /^we need to\b/i,
    /^let'?s craft\b/i,
    /max(?:imum)?\s*80 words/i,
    /no preamble/i,
    /only the summary text/i,
    /^the summary (should|must)\b/i,
]

async function summarizeTranscriptLLM(transcript) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey || !transcript) return null

    const systemPrompt = `You summarize a conversation between a user and an AI persona so the persona can recall it in future chats.
Reply with ONLY the summary text (no preamble, no quotes). Maximum 80 words.
Cover: topics discussed, anything the user shared or asked for, decisions or advice given, emotional tone, and any open threads to follow up on.
Write in third person ("The user ...").`

    for (const model of EXTRACTION_MODELS) {
        try {
            const res = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://ai-spirit.in',
                    'X-Title': 'AI Spirit',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: transcript },
                    ],
                    temperature: 0,
                    max_tokens: 256,
                    reasoning: { exclude: true },
                }),
            })

            if (res.status === 429) {
                console.warn(`[Summary] rate-limited on ${model}, trying next...`)
                continue
            }
            if (!res.ok) {
                console.error(`[Summary] HTTP ${res.status} on ${model}`)
                continue
            }

            const data = await res.json()
            // Nemotron leaks untagged chain-of-thought into content despite
            // reasoning.exclude — same bug as chat replies. Strip tagged
            // reasoning, and fall through to the next model on untagged leaks.
            const text = stripReasoning(data.choices?.[0]?.message?.content || '').trim()
            if (text && (looksLikeLeakedReasoning(text) || SUMMARY_LEAK_PATTERNS.some(re => re.test(text)))) {
                console.warn(`[Summary] leaked reasoning from ${model}, trying next...`)
                continue
            }
            if (text) {
                console.log(`[Summary] generated via ${model}:`, text.slice(0, 120))
                return text
            }
        } catch (e) {
            console.error(`[Summary] error on ${model}:`, e.message)
            continue
        }
    }

    console.warn('[Summary] all models unavailable — skipping this turn')
    return null
}

/**
 * Create or refresh the summary for a conversation. Cheap no-op when the
 * conversation is too short or the stored summary is still fresh.
 * MUST be awaited by the caller — fire-and-forget dies on Vercel.
 */
export async function updateConversationSummary(userId, personaSlug, conversationId, supabaseClient = supabase) {
    if (!userId || !personaSlug || !conversationId) return null

    try {
        const { data: msgs, error } = await supabaseClient
            .from('messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(60)

        if (error) {
            console.error('[Summary] messages fetch error:', error.message)
            return null
        }
        if (!msgs || msgs.length < SUMMARY_MIN_MESSAGES) return null

        const { data: existing } = await supabaseClient
            .from('conversation_summaries')
            .select('message_count')
            .eq('conversation_id', conversationId)
            .maybeSingle()

        const prevCount = existing?.message_count || 0
        if (prevCount > 0 && msgs.length - prevCount < SUMMARY_REFRESH_EVERY) return null

        const transcript = msgs
            .map(m => `${m.role === 'user' ? 'User' : 'Persona'}: ${String(m.content).slice(0, 400)}`)
            .join('\n')
            .slice(-8000)

        const summary = await summarizeTranscriptLLM(transcript)
        if (!summary) return null

        const { error: upsertError } = await supabaseClient
            .from('conversation_summaries')
            .upsert({
                conversation_id: conversationId,
                user_id: userId,
                persona_slug: personaSlug,
                summary,
                message_count: msgs.length,
                updated_at: new Date().toISOString(),
            })

        if (upsertError) {
            console.error('[Summary] upsert error:', upsertError.message)
            return null
        }

        console.log('[Summary] saved for conversation', conversationId, `(${msgs.length} msgs)`)
        return summary
    } catch (e) {
        console.error('[Summary] exception:', e.message)
        return null
    }
}

/**
 * Fetch recent conversation summaries for this user+persona pair.
 * Excludes the current conversation — its verbatim history is already in the prompt.
 */
export async function getConversationSummaries(userId, personaSlug, excludeConversationId = null, supabaseClient = supabase, limit = 3) {
    if (!userId || !personaSlug) return []

    try {
        let query = supabaseClient
            .from('conversation_summaries')
            .select('summary, updated_at')
            .eq('user_id', userId)
            .eq('persona_slug', personaSlug)
            .order('updated_at', { ascending: false })
            .limit(limit)

        if (excludeConversationId) query = query.neq('conversation_id', excludeConversationId)

        const { data, error } = await query
        if (error) {
            console.error('[Summary] fetch error:', error.message)
            return []
        }
        return data || []
    } catch (e) {
        console.error('[Summary] fetch exception:', e.message)
        return []
    }
}

/**
 * Format past-conversation summaries for the system prompt.
 */
export function formatSummariesForContext(summaries) {
    if (!summaries || summaries.length === 0) return ''
    const lines = []
    for (const s of summaries) {
        const safe = sanitizeMemoryContent(s.summary)
        if (!safe) continue
        const date = s.updated_at ? new Date(s.updated_at).toISOString().slice(0, 10) : ''
        lines.push(`- ${date ? `[${date}] ` : ''}${safe}`)
    }
    return lines.join('\n')
}
