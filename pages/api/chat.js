import { supabaseAdmin } from '@/lib/supabase'
import { generatePersonaResponse } from '@/lib/gemini'
import { moderateContent } from '@/lib/moderation'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { conversationId, personaId, persona: personaObj, message, conversationHistory, isGuest } = req.body

    // Validate input
    if (!message || (!personaId && !personaObj)) {
      return res.status(400).json({ error: 'Missing required fields' })
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
      const { data: history } = await supabaseAdmin
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20)

      messageHistory = [...(history || []), { role: 'user', content: message }]
    }

    // Generate AI response
    const result = await generatePersonaResponse(persona.system_prompt, messageHistory)

    if (!result.success) {
      return res.status(500).json({ error: result.error })
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
    console.error('Chat API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
