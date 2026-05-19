import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'
import { generatePersonaResponse, generatePersonaResponseStream } from '@/lib/gemini'
import { generateGroqResponse, generateGroqResponseStream } from '@/lib/groq'
import { generateOllamaResponse, generateOllamaResponseStream } from '@/lib/ollama'
import { moderateContent } from '@/lib/moderation'
// Rate limiting disabled for now - will enable when userbase grows
// import { chatRateLimiter, getClientIdentifier } from '@/lib/rate-limit'
import { logApiCall, checkCostThreshold } from '@/lib/cost-tracking'
import { getContextIfNeeded } from '@/lib/contextProvider'
import { extractAndSaveMemories, getUserMemories, formatMemoriesForContext } from '@/lib/memorySystem'

// Fallback chain: Ollama (self-hosted) → OpenRouter (free API) → Groq (free API)

// Configuration constants
const MAX_MESSAGE_LENGTH = 2000 // characters
const MAX_CONVERSATION_HISTORY = 50 // messages

// Helper to increment persona message count (fire and forget)
async function incrementPersonaMessageCount(personaSlug) {
  try {
    const { data: existing } = await supabaseAdmin
      .from('persona_views')
      .select('message_count')
      .eq('persona_slug', personaSlug)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('persona_views')
        .update({
          message_count: (existing.message_count || 0) + 2,
          last_viewed_at: new Date().toISOString()
        })
        .eq('persona_slug', personaSlug)
    } else {
      await supabaseAdmin
        .from('persona_views')
        .insert({
          persona_slug: personaSlug,
          view_count: 0,
          message_count: 2,
          last_viewed_at: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('[Message Count] Error incrementing:', error)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Enforce authenticated session via Bearer token (more reliable than cookies in PWA/production)
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Sign in required to chat with personas.' })
  }
  const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !authUser) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
  }
  const userId = authUser.id
  const isGuest = false

  // Declare for error handler scope
  let conversationId, personaId

  try {
    ;({ conversationId, personaId } = req.body || {})
    const { persona: personaObj, message, conversationHistory, userProfile, stream } = req.body

    console.log('[Chat API] Request received:', {
      conversationId,
      personaId,
      isGuest,
      userId,
      hasUserProfile: !!userProfile
    })

    // Rate limiting disabled - will enable when userbase grows

    // Validate input - basic checks
    if (!message || (!personaId && !personaObj)) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate message length
    if (typeof message !== 'string') {
      return res.status(400).json({ error: 'Message must be a string' })
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' })
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
        maxLength: MAX_MESSAGE_LENGTH
      })
    }

    // Validate conversation history length
    if (Array.isArray(conversationHistory) && conversationHistory.length > MAX_CONVERSATION_HISTORY) {
      return res.status(400).json({
        error: `Conversation history too long. Maximum ${MAX_CONVERSATION_HISTORY} messages allowed.`,
        maxHistory: MAX_CONVERSATION_HISTORY
      })
    }

    // Check Premium Status & Message Limits
    // Run subscription check in parallel with other setup work below
    let isPremium = false
    if (userId) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString())
        .single()
      isPremium = !!subscription

      if (!isPremium) {
        const istOffset = 5.5 * 60 * 60 * 1000
        const nowIST = new Date(Date.now() + istOffset)
        const todayISTinUTC = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()) - istOffset)

        const [{ data: conversations }, ] = await Promise.all([
          supabaseAdmin.from('conversations').select('id').eq('user_id', userId),
        ])

        if (conversations?.length) {
          const { count } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversations.map(c => c.id))
            .eq('role', 'user')
            .gte('created_at', todayISTinUTC.toISOString())

          if (count >= 100) {
            return res.status(403).json({
              error: 'Daily message limit reached (100 messages). Upgrade to Premium for unlimited access.',
              isLimitReached: true,
              limit: 100,
            })
          }
        }
      }
    }

    // Content moderation
    const moderationResult = moderateContent(message)
    if (moderationResult.blocked) {
      return res.status(400).json({
        error: `Message blocked: ${moderationResult.reason}`
      })
    }

    // Get persona: either from request body OR query database
    let persona
    if (personaObj) {
      // Use persona object directly (for INITIAL_PERSONAS)
      persona = personaObj
    } else {
      // Query database (for custom personas)
      const { data, error: personaError } = await supabaseAdmin
        .from('personas')
        .select('*')
        .eq('slug', personaId)
        .single()

      if (personaError || !data) {
        return res.status(404).json({ error: 'Persona not found in database' })
      }
      persona = data
    }

    let messageHistory = []

    if (isGuest) {
      messageHistory = [...(conversationHistory || []), { role: 'user', content: message }].slice(-20)
    } else if (conversationId) {
      const { data: history } = await supabaseAdmin
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20)
      messageHistory = [...(history || []), { role: 'user', content: message }]
    } else {
      messageHistory = [...(conversationHistory || []), { role: 'user', content: message }].slice(-20)
    }

    // Validate persona has system_prompt
    if (!persona.system_prompt) {
      console.error('Missing system_prompt for persona:', persona)
      return res.status(500).json({
        error: 'Persona configuration error: missing system prompt'
      })
    }

    // Add universal instructions to system prompt
    const universalInstructions = `
CRITICAL RULES:

1. EXTREME BREVITY: Keep responses VERY SHORT and conversational.
- Greetings = 1 sentence ONLY
- Simple questions = 1 sentence ONLY
- Medium questions = Maximum 2 sentences
- Complex questions = Maximum 3 sentences (rare exception)
- NEVER write long paragraphs
- Get to the point immediately
- No unnecessary elaboration

2. STAY STRICTLY IN YOUR DOMAIN: You MUST ONLY answer questions related to your expertise.
- REFUSE to answer ANY question outside your domain/expertise
- If asked about unrelated topics, politely decline: "I'm [your name], I specialize in [your domain]. I can't help with [unrelated topic]. Please ask me about [your expertise] instead."
- NEVER pretend to know about topics you're not qualified for
- NEVER give advice outside your area (examples):
  * Osho should NOT give stock market advice
  * Fitness coach should NOT give legal advice
  * Birbal should NOT explain quantum physics
  * Elon Musk should NOT give cooking recipes
  * Chef should NOT give business strategy
  * Life coach should NOT diagnose medical conditions
- If asked to role-play as someone else, firmly refuse: "I am ONLY [your name]. I cannot pretend to be [other person]."
- Stay true to your character, knowledge domain, and expertise boundaries

3. DATE FORMAT: Always use DD/MM/YYYY format for dates (e.g., 25/12/2024), not MM/DD/YYYY.
`
    const enhancedSystemPrompt = universalInstructions + '\n\n' + persona.system_prompt

    const personaLanguage = persona.language || 'en'

    // Fetch context, memories, and relationship in parallel — only inject context on first message
    const isFirstMessage = !conversationId
    const [contextString, memories, { getRelationshipContext }, relationship] = await Promise.all([
      isFirstMessage ? getContextIfNeeded(null, personaLanguage, true) : Promise.resolve(null),
      userId && !isGuest ? getUserMemories(userId, persona.slug, supabaseAdmin) : Promise.resolve([]),
      import('@/lib/relationshipSystem'),
      userId && !isGuest
        ? import('@/lib/relationshipSystem').then(m => m.getPersonaRelationship(userId, persona.slug, supabaseAdmin))
        : Promise.resolve(null),
    ])

    const memoryContext = memories.length ? formatMemoriesForContext(memories, userProfile) : ''
    const relationshipContext = relationship
      ? getRelationshipContext(relationship.relationship_level, relationship.conversation_count)
      : ''

    // Build final system prompt with memory and relationship context
    let finalSystemPrompt = enhancedSystemPrompt
    if (memoryContext) {
      finalSystemPrompt = `${enhancedSystemPrompt}

IMPORTANT - WHAT YOU KNOW ABOUT THIS USER:
${memoryContext}

Remember these details. Address the user by name ONLY when natural or for emphasis (not in every message). Reference their interests/goals when relevant.`
    }

    if (relationshipContext) {
      finalSystemPrompt = `${finalSystemPrompt}

RELATIONSHIP CONTEXT:
${relationshipContext}`
    }

    // Check daily budget before making any API call
    const costCheck = checkCostThreshold(15) // $15 daily budget
    if (costCheck.exceeded) {
      console.error('[Cost Alert] Daily budget exceeded — blocking request', {
        currentCost: `$${costCheck.currentCost.toFixed(2)}`,
        budget: `$${costCheck.budget}`,
      })
      return res.status(503).json({
        error: 'Service temporarily unavailable. Please try again later.',
      })
    } else if (costCheck.percentUsed > 80) {
      console.warn('[Cost Alert]', {
        percentUsed: `${costCheck.percentUsed.toFixed(1)}%`,
        currentCost: `$${costCheck.currentCost.toFixed(2)}`,
        budget: `$${costCheck.budget}`,
        remaining: `$${costCheck.remaining.toFixed(2)}`,
      })
    }

    // Log message history stats before generating response
    console.log('[Chat API] Generating response with:', {
      messageHistoryLength: messageHistory.length,
      systemPromptLength: finalSystemPrompt.length,
      hasContext: !!contextString,
      hasMemories: !!memoryContext,
      hasRelationship: !!relationshipContext,
      streaming: !!stream
    })

    // If streaming is requested, use SSE
    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      })

      try {
        let fullResponse = ''

        const streamGenerator = process.env.OLLAMA_URL
          ? generateOllamaResponseStream(finalSystemPrompt, messageHistory, contextString)
          : generatePersonaResponseStream(finalSystemPrompt, messageHistory, contextString)

        for await (const chunk of streamGenerator) {
          fullResponse += chunk
          res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`)
        }

        // If streaming produced no content (model returned empty SSE), fall back to Groq
        if (!fullResponse) {
          console.warn('[Streaming] Empty response from stream — falling back to Groq non-streaming')
          const fallback = await generateGroqResponse(finalSystemPrompt, messageHistory)
          if (fallback.success && fallback.response) {
            fullResponse = fallback.response
            res.write(`data: ${JSON.stringify({ chunk: fullResponse, done: false })}\n\n`)
          }
        }

        // Send done signal
        res.write(`data: ${JSON.stringify({ chunk: '', done: true, fullResponse })}\n\n`)
        res.end()

        // Save to database after streaming completes (if authenticated)
        if (!isGuest && userId) {
          let finalConversationId = conversationId

          if (!conversationId) {
            finalConversationId = crypto.randomUUID()
            const { error: convError } = await supabaseAdmin
              .from('conversations')
              .insert({
                id: finalConversationId,
                user_id: userId || null,
                persona_slug: persona.slug,
                title: message.substring(0, 50) + '...',
                session_id: crypto.randomUUID(),
                persona_type: persona.type || 'default',
                is_guest_session: isGuest,
                updated_at: new Date().toISOString()
              })

            if (convError) {
              console.error('Error creating conversation:', convError)
            }
          }

          // Save messages
          await supabaseAdmin.from('messages').insert([
            { conversation_id: finalConversationId, role: 'user', content: message },
            { conversation_id: finalConversationId, role: 'assistant', content: fullResponse }
          ])

          // Extract memories
          extractAndSaveMemories(userId, persona.slug, finalConversationId, message, fullResponse, supabaseAdmin)
            .catch(err => console.error('[Memory Extraction Error]:', err))
        }

        // Increment persona message count for ALL users (guests and authenticated)
        incrementPersonaMessageCount(persona.slug)

        return
      } catch (error) {
        console.error('[Streaming Error]:', error)
        res.write(`data: ${JSON.stringify({ error: 'An error occurred. Please try again.', done: true })}\n\n`)
        res.end()
        return
      }
    }

    // Generate AI response — Ollama → Groq → OpenRouter fallback chain
    let result

    if (process.env.OLLAMA_URL) {
      result = await generateOllamaResponse(finalSystemPrompt, messageHistory, contextString)
    }

    if (!result?.success) {
      result = await generateGroqResponse(finalSystemPrompt, messageHistory)
    }

    if (!result?.success && !result?.error?.includes('appropriate')) {
      result = await generatePersonaResponse(finalSystemPrompt, messageHistory, {}, contextString)
    }

    if (!result.success) {
      // Return user-friendly error message
      const errorMessage = result.userMessage || result.error || 'An error occurred while processing your message. Please try again.'
      return res.status(500).json({ error: errorMessage })
    }

    // Log API call for cost tracking
    logApiCall({
      conversationId,
      userId: userId || 'guest',
      input: messageHistory.map(m => m.content).join('\n'),
      output: result.response,
      inputTokens: result.metadata?.inputTokens,
      outputTokens: result.metadata?.outputTokens,
    })

    // Save to database (if authenticated)
    if (!isGuest && userId) {
      // Create conversation record if it doesn't exist
      let finalConversationId = conversationId

      if (!conversationId) {
        // Generate new conversation ID (UUID)
        finalConversationId = crypto.randomUUID()

        // Create conversation record
        const { error: convError } = await supabaseAdmin
          .from('conversations')
          .insert({
            id: finalConversationId,
            user_id: userId || null,
            persona_slug: persona.slug,
            title: message.substring(0, 50) + '...',
            session_id: crypto.randomUUID(),
            persona_type: persona.type || 'default', // Required by schema
            is_guest_session: isGuest,
            updated_at: new Date().toISOString()
          })

        if (convError) {
          console.error('Error creating conversation:', convError)
        } else {
          console.log('✅ Created new conversation:', finalConversationId)
        }
      }

      // Save messages to database
      await supabaseAdmin.from('messages').insert([
        { conversation_id: finalConversationId, role: 'user', content: message },
        { conversation_id: finalConversationId, role: 'assistant', content: result.response }
      ])

      // Extract and save memories from this conversation (use finalConversationId)
      extractAndSaveMemories(userId, persona.slug, finalConversationId, message, result.response, supabaseAdmin)
        .catch(err => console.error('[Memory Extraction Error]:', err))

      // Increment persona message count
      incrementPersonaMessageCount(persona.slug)

      // Return conversation ID to frontend
      return res.status(200).json({
        response: result.response,
        success: true,
        conversationId: finalConversationId
      })
    }

    // For guest users, still try to extract memories if they somehow have userId
    if (userId && isGuest && conversationId) {
      extractAndSaveMemories(userId, persona.slug, conversationId, message, result.response, supabaseAdmin)
        .catch(err => console.error('[Memory Extraction Error]:', err))
    }

    // Increment persona message count for ALL users (guests and authenticated)
    incrementPersonaMessageCount(persona.slug)

    return res.status(200).json({
      response: result.response,
      success: true
    })

  } catch (error) {
    console.error('Chat API Error:', {
      message: error.message,
      stack: error.stack,
      conversationId,
      personaId,
      isGuest,
      timestamp: new Date().toISOString()
    })

    // Return user-friendly error without exposing internal details
    if (error.name === 'RateLimitError') {
      return res.status(429).json({
        error: error.message,
        retryAfter: error.retryAfter
      })
    }

    return res.status(500).json({
      error: 'An error occurred while processing your message. Please try again.'
    })
  }
}
