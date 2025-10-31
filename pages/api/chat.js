import { supabaseAdmin } from '@/lib/supabase'
import { generatePersonaResponse } from '@/lib/gemini'
import { moderateContent } from '@/lib/moderation'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { conversationId, personaId, message, isGuest } = req.body

    // Validate input
    if (!message || !personaId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Content moderation
    const moderationResult = moderateContent(message)
    if (moderationResult.blocked) {
      return res.status(400).json({
        error: `Message blocked: ${moderationResult.reason}`
      })
    }

    // Get persona
    const { data: persona, error: personaError } = await supabaseAdmin
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .single()

    if (personaError || !persona) {
      return res.status(404).json({ error: 'Persona not found' })
    }

    let messageHistory = []

    // Guest mode: no database, limited context
    if (isGuest) {
      messageHistory = [{ role: 'user', content: message }]
    } else {
      // Load conversation history
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
