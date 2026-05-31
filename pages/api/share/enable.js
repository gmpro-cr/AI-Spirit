// Mark a conversation public so /share/<id> works.
// POST { conversationId }  Authorization: Bearer <supabase-access-token>
//
// Verifies the requesting user owns the conversation before flipping is_public.

import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Sign in required to share conversations.' })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid session. Please sign in again.' })
  }

  const { conversationId } = req.body || {}
  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'conversationId is required.' })
  }

  // Verify ownership
  const { data: conversation, error: fetchError } = await supabaseAdmin
    .from('conversations')
    .select('id, user_id, is_public')
    .eq('id', conversationId)
    .single()

  if (fetchError || !conversation) {
    return res.status(404).json({ error: 'Conversation not found.' })
  }

  if (conversation.user_id !== user.id) {
    return res.status(403).json({ error: 'You can only share conversations you own.' })
  }

  // Idempotent — flipping an already-public conversation is fine.
  const { error: updateError } = await supabaseAdmin
    .from('conversations')
    .update({
      is_public: true,
      shared_at: conversation.is_public ? undefined : new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (updateError) {
    console.error('[Share] Update failed:', updateError)
    return res.status(500).json({ error: 'Could not enable sharing.' })
  }

  return res.status(200).json({
    success: true,
    shareUrl: `/share/${conversationId}`,
  })
}
