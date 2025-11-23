import { supabaseAdmin } from '@/lib/supabase'
import { generatePersonaResponse } from '@/lib/gemini'
import { generateGroqResponse } from '@/lib/groq'
import { moderateContent } from '@/lib/moderation'
// Rate limiting disabled for now - will enable when userbase grows
// import { chatRateLimiter, getClientIdentifier } from '@/lib/rate-limit'
import { logApiCall, checkCostThreshold } from '@/lib/cost-tracking'

// Fallback system: Gemini first, then Groq if rate limited

// Configuration constants
const MAX_MESSAGE_LENGTH = 2000 // characters
const MAX_CONVERSATION_HISTORY = 50 // messages

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { conversationId, personaId, persona: personaObj, message, conversationHistory, isGuest } = req.body

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
      const { data, error: personaError} = await supabaseAdmin
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
    } else {
      // Load conversation history from database
      if (conversationId) {
        const { data: history } = await supabaseAdmin
          .from('messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(20)

        messageHistory = [...(history || []), { role: 'user', content: message }]
      } else {
        // Fallback: use conversation history from frontend (for authenticated users without conversationId)
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
`
    const enhancedSystemPrompt = universalInstructions + '\n\n' + persona.system_prompt

    // Generate AI response - try Gemini first, fallback to Groq if rate limited
    let result = await generatePersonaResponse(enhancedSystemPrompt, messageHistory)

    // If Gemini fails with rate limit, try Groq
    if (!result.success && result.error?.includes('busy')) {
      console.log('[Fallback] Gemini rate limited, trying Groq...')
      result = await generateGroqResponse(enhancedSystemPrompt, messageHistory)
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
    if (!isGuest && conversationId) {
      await supabaseAdmin.from('messages').insert([
        { conversation_id: conversationId, role: 'user', content: message },
        { conversation_id: conversationId, role: 'assistant', content: result.response }
      ])
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
