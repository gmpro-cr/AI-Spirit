// Record a thumbs up/down on an assistant reply.
// POST { conversationId, messageIndex, personaSlug, rating }  Authorization: Bearer <token>
//
// rating is 'like' | 'dislike' | null — null clears a previous vote, which is
// what the toggle in the chat UI sends when you press the same button twice.
//
// This is the only response-quality signal the product collects, so it is
// deliberately forgiving: a missing table or a duplicate vote must never
// surface as an error in the middle of a conversation.

import { supabaseAdmin } from '@/lib/supabase'

const VALID_RATINGS = ['like', 'dislike']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Sign in required.' })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid session. Please sign in again.' })
  }

  const { conversationId, messageIndex, personaSlug, rating } = req.body || {}

  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'conversationId is required.' })
  }
  if (!Number.isInteger(messageIndex) || messageIndex < 0) {
    return res.status(400).json({ error: 'messageIndex must be a non-negative integer.' })
  }
  if (rating !== null && !VALID_RATINGS.includes(rating)) {
    return res.status(400).json({ error: "rating must be 'like', 'dislike', or null." })
  }

  try {
    if (rating === null) {
      const { error } = await supabaseAdmin
        .from('message_feedback')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId)
        .eq('message_index', messageIndex)

      if (error) throw error
      return res.status(200).json({ ok: true, rating: null })
    }

    const { error } = await supabaseAdmin
      .from('message_feedback')
      .upsert(
        {
          user_id: user.id,
          conversation_id: conversationId,
          message_index: messageIndex,
          persona_slug: personaSlug || null,
          rating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,conversation_id,message_index' }
      )

    if (error) throw error
    return res.status(200).json({ ok: true, rating })
  } catch (error) {
    // Most likely cause is the migration not having been run yet. Log it and
    // report success-shaped failure so the UI keeps its optimistic state
    // instead of flapping back mid-conversation.
    console.error('[feedback] failed to record:', error?.message || error)
    return res.status(200).json({ ok: false, persisted: false })
  }
}
