import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'
import { generatePersonaResponse } from '@/lib/gemini'
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { conversationId, personaId, persona: personaObj, message, conversationHistory, isGuest, userId, userProfile } = req.body

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

1. BREVITY: Keep responses SHORT and conversational.
- Greetings = 1 sentence max
- Simple questions = 1-2 sentences
- Complex questions = 2-3 sentences max
- Match the user's message length

2. STAY IN CHARACTER: You are ONLY this persona. Never pretend to be someone else.
- If asked to act as another person/expert, politely refuse: "I am [your name], not an [other role]. Let me share my perspective instead."
- If asked about topics outside your expertise, redirect: "That's not my area. I focus on [your domain]. Want to discuss that?"
- Don't give advice you're not qualified for (e.g., Osho shouldn't give astrology readings, fitness coach shouldn't give medical diagnoses)
- Stay true to your knowledge domain and personality

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

    // Get context if this is first message (works for both authenticated and guest users)
    // Note: Frontend sends conversationHistory with current user message already included
    // So first message for guest = length 1, not 0
    const contextString = isGuest
      ? ((conversationHistory?.length === 1) ? await getContextIfNeeded(null) : null)
      : await getContextIfNeeded(conversationId)

    // Log context injection
    if (contextString) {
      console.log('[Chat API] Injecting context for first message', {
        conversationId,
        hasContext: true
      })
    }

    // Get user memories for authenticated users
    let memoryContext = ''
    if (userId && !isGuest) {
      const memories = await getUserMemories(userId, persona.slug, supabaseAdmin)
      memoryContext = formatMemoriesForContext(memories, userProfile)

      if (memoryContext) {
        console.log('[Memory System] Injecting user memories:', {
          userId,
          personaSlug: persona.slug,
          memoriesCount: memories.length
        })
      }
    }

    // Build final system prompt with memory context
    let finalSystemPrompt = enhancedSystemPrompt
    if (memoryContext) {
      finalSystemPrompt = `${enhancedSystemPrompt}

IMPORTANT - WHAT YOU KNOW ABOUT THIS USER:
${memoryContext}

Remember these details in your responses. Address the user by name and reference their interests/goals when relevant.`
    }

    // Generate AI response - try Gemini first, fallback to Groq if rate limited
    let result = await generatePersonaResponse(finalSystemPrompt, messageHistory, {}, contextString)

    // If Gemini fails with rate limit, try Groq
    if (!result.success && result.error?.includes('busy')) {
      console.log('[Fallback] Gemini rate limited, trying Groq...')
      // Prepend context to system prompt for Groq as well
      const groqSystemPrompt = contextString ? contextString + finalSystemPrompt : finalSystemPrompt
      result = await generateGroqResponse(groqSystemPrompt, messageHistory)
    }

    if (!result.success) {
      return res.status(500).json({ error: result.error })
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
