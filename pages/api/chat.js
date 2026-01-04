import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'
import { generatePersonaResponse, generatePersonaResponseStream } from '@/lib/gemini'
import { generateGroqResponse } from '@/lib/groq'
import { moderateContent } from '@/lib/moderation'
// Rate limiting disabled for now - will enable when userbase grows
// import { chatRateLimiter, getClientIdentifier } from '@/lib/rate-limit'
import { logApiCall, checkCostThreshold } from '@/lib/cost-tracking'
import { getContextIfNeeded } from '@/lib/contextProvider'
import { extractAndSaveMemories, getUserMemories, formatMemoriesForContext } from '@/lib/memorySystem'

// Fallback system: Gemini first, then Groq if rate limited

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

  try {
    const { conversationId, personaId, persona: personaObj, message, conversationHistory, isGuest, userId, userProfile, stream } = req.body

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
    if (userId) {
      // 1. Check if user is premium
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString())
        .single()

      const isPremium = !!subscription

      if (!isPremium) {
        // 2. Count messages sent today by this user (using IST timezone UTC+5:30)
        const now = new Date()

        // Get IST midnight (subtract 5:30 from UTC to get IST midnight in UTC)
        const istOffset = 5.5 * 60 * 60 * 1000 // 5 hours 30 minutes in milliseconds
        const nowIST = new Date(now.getTime() + istOffset)
        const istMidnight = new Date(Date.UTC(
          nowIST.getUTCFullYear(),
          nowIST.getUTCMonth(),
          nowIST.getUTCDate(),
          0, 0, 0, 0
        ))
        // Convert IST midnight back to UTC
        const todayISTinUTC = new Date(istMidnight.getTime() - istOffset)

        // We need to join conversations to get user's messages
        // But Supabase JS client join syntax can be complex, so we'll use a two-step approach or RPC if available
        // Simpler approach: Get all conversation IDs for this user
        const { data: conversations } = await supabaseAdmin
          .from('conversations')
          .select('id')
          .eq('user_id', userId)

        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id)

          const { count, error: countError } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .eq('role', 'user')
            .gte('created_at', todayISTinUTC.toISOString())

          if (!countError && count >= 100) {
            return res.status(403).json({
              error: 'Daily message limit reached (100 messages). Upgrade to Premium for unlimited access.',
              isLimitReached: true,
              limit: 100
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

    // Guest mode: use conversation history from frontend
    if (isGuest) {
      // Use the conversation history sent from frontend + current message
      messageHistory = [
        ...(conversationHistory || []),
        { role: 'user', content: message }
      ]
      // Limit to last 20 messages for performance
      messageHistory = messageHistory.slice(-20)
      console.log('[Chat API] Guest mode - using frontend history:', messageHistory.length, 'messages')
    } else {
      // Load conversation history from database
      if (conversationId) {
        console.log('[Chat API] Loading history from database for conversationId:', conversationId)
        const { data: history, error: historyError } = await supabaseAdmin
          .from('messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(20)

        if (historyError) {
          console.error('[Chat API] Error loading history:', historyError)
        }

        console.log('[Chat API] Loaded', (history || []).length, 'messages from database')
        messageHistory = [...(history || []), { role: 'user', content: message }]
        console.log('[Chat API] Total message history:', messageHistory.length, 'messages')
      } else {
        // Fallback: use conversation history from frontend (for authenticated users without conversationId)
        console.log('[Chat API] No conversationId - using frontend history')
        messageHistory = [
          ...(conversationHistory || []),
          { role: 'user', content: message }
        ]
        messageHistory = messageHistory.slice(-20)
      }
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

    // DEBUG: Check what we're working with
    console.log('[DEBUG] Context injection check:', {
      isGuest,
      conversationId,
      hasConversationHistory: !!conversationHistory,
      conversationHistoryLength: conversationHistory?.length
    })

    // ALWAYS inject current context (date/time + latest news) so personas have up-to-date information
    // This ensures they can discuss recent events and know the current date/time
    // Detect persona language for context formatting
    const personaLanguage = persona.language || 'en'
    const contextString = await getContextIfNeeded(null, personaLanguage, true) // Pass null to always get context

    // Log context injection
    if (contextString) {
      console.log('[Chat API] Injecting real-time context', {
        conversationId,
        language: personaLanguage,
        hasContext: true,
        contextLength: contextString.length
      })
    }

    // Get user memories for authenticated users
    let memoryContext = ''
    let relationshipContext = ''

    // DEBUG: Log memory system check
    console.log('[Memory System] Pre-check:', {
      userId,
      isGuest,
      willFetchMemories: userId && !isGuest
    })

    if (userId && !isGuest) {
      const memories = await getUserMemories(userId, persona.slug, supabaseAdmin)
      console.log('[Memory System] Retrieved memories:', {
        memoriesCount: memories.length,
        userId,
        personaSlug: persona.slug
      })

      memoryContext = formatMemoriesForContext(memories, userProfile)
      console.log('[Memory System] Formatted context:', {
        contextLength: memoryContext.length,
        isEmpty: !memoryContext
      })

      if (memoryContext) {
        console.log('[Memory System] Injecting user memories:', {
          userId,
          personaSlug: persona.slug,
          memoriesCount: memories.length
        })
      } else {
        console.log('[Memory System] ❌ Memory context is empty despite having', memories.length, 'memories')
      }

      // Get relationship level and context
      const { getPersonaRelationship, getRelationshipContext } = await import('@/lib/relationshipSystem')
      const relationship = await getPersonaRelationship(userId, persona.slug, supabaseAdmin)

      if (relationship) {
        relationshipContext = getRelationshipContext(relationship.relationship_level, relationship.conversation_count)
        console.log('[Relationship System] Injecting relationship context:', {
          userId,
          personaSlug: persona.slug,
          level: relationship.relationship_level,
          conversations: relationship.conversation_count
        })
      }
    }

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

        for await (const chunk of generatePersonaResponseStream(finalSystemPrompt, messageHistory, contextString)) {
          fullResponse += chunk
          res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`)
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

          // Increment persona message count
          incrementPersonaMessageCount(persona.slug)
        }

        return
      } catch (error) {
        console.error('[Streaming Error]:', error)
        res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming failed', done: true })}\n\n`)
        res.end()
        return
      }
    }

    // Generate AI response - try Gemini first, fallback to Groq if rate limited
    let result = await generatePersonaResponse(finalSystemPrompt, messageHistory, {}, contextString)

    // If Gemini fails (rate limit, overload, or any technical error), try Groq
    // We only skip fallback if it was a safety/moderation block
    if (!result.success && !result.error?.includes('appropriate')) {
      console.log('[Fallback] Gemini failed:', result.error, '- trying Groq...')
      // Prepend context to system prompt for Groq as well
      const groqSystemPrompt = contextString ? contextString + finalSystemPrompt : finalSystemPrompt
      result = await generateGroqResponse(groqSystemPrompt, messageHistory)

      // If Groq also succeeded, log that we used the fallback
      if (result.success) {
        console.log('[Fallback] ✅ Groq succeeded after Gemini failure')
      }
    }

    if (!result.success) {
      // Return user-friendly error message
      const errorMessage = result.userMessage || result.error || 'An error occurred while processing your message. Please try again.'
      return res.status(500).json({ error: errorMessage })
    }

    // Log API call for cost tracking
    logApiCall({
      conversationId,
      userId: 'guest',
      input: messageHistory.map(m => m.content).join('\n'),
      output: result.response,
      inputTokens: result.metadata?.inputTokens,
      outputTokens: result.metadata?.outputTokens,
    })

    // Check if daily budget exceeded (log warning)
    const costCheck = checkCostThreshold(15) // $15 daily budget
    if (costCheck.percentUsed > 80) {
      console.warn('[Cost Alert]', {
        percentUsed: `${costCheck.percentUsed.toFixed(1)}%`,
        currentCost: `$${costCheck.currentCost.toFixed(2)}`,
        budget: `$${costCheck.budget}`,
        remaining: `$${costCheck.remaining.toFixed(2)}`,
      })
    }

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
