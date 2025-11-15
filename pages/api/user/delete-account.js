/**
 * User Account Deletion API (GDPR Compliance)
 * 
 * Allows users to permanently delete their account and all associated data.
 * This is required for GDPR compliance (Right to Erasure).
 */

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the authenticated user
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' })
    }

    const userId = user.id
    console.log(`[Delete Account] Starting deletion for user: ${userId}`)

    // Confirmation check (optional but recommended)
    const { confirmation } = req.body
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({
        error: 'Account deletion requires confirmation',
        required: 'Please send { confirmation: "DELETE MY ACCOUNT" } in the request body',
      })
    }

    // Start deletion process
    const deletionResults = {
      userId,
      timestamp: new Date().toISOString(),
      deletedData: {},
      errors: [],
    }

    // 1. Delete user's messages
    try {
      const { data: conversations } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('user_id', userId)

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id)

        const { error: messagesError, count: messagesCount } = await supabaseAdmin
          .from('messages')
          .delete({ count: 'exact' })
          .in('conversation_id', conversationIds)

        if (messagesError) throw messagesError
        deletionResults.deletedData.messages = messagesCount || 0
        console.log(`[Delete Account] Deleted ${messagesCount} messages`)
      } else {
        deletionResults.deletedData.messages = 0
      }
    } catch (error) {
      deletionResults.errors.push({ table: 'messages', error: error.message })
      console.error('[Delete Account] Error deleting messages:', error)
    }

    // 2. Delete user's conversations
    try {
      const { error: conversationsError, count: conversationsCount } = await supabaseAdmin
        .from('conversations')
        .delete({ count: 'exact' })
        .eq('user_id', userId)

      if (conversationsError) throw conversationsError
      deletionResults.deletedData.conversations = conversationsCount || 0
      console.log(`[Delete Account] Deleted ${conversationsCount} conversations`)
    } catch (error) {
      deletionResults.errors.push({ table: 'conversations', error: error.message })
      console.error('[Delete Account] Error deleting conversations:', error)
    }

    // 3. Delete user's created personas (if any)
    try {
      const { error: personasError, count: personasCount } = await supabaseAdmin
        .from('personas')
        .delete({ count: 'exact' })
        .eq('created_by', userId)

      if (personasError) throw personasError
      deletionResults.deletedData.personas = personasCount || 0
      console.log(`[Delete Account] Deleted ${personasCount} personas`)
    } catch (error) {
      deletionResults.errors.push({ table: 'personas', error: error.message })
      console.error('[Delete Account] Error deleting personas:', error)
    }

    // 4. Delete user profile (this will cascade to auth)
    try {
      const { error: userError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId)

      if (userError) throw userError
      deletionResults.deletedData.user = 1
      console.log(`[Delete Account] Deleted user profile`)
    } catch (error) {
      deletionResults.errors.push({ table: 'users', error: error.message })
      console.error('[Delete Account] Error deleting user profile:', error)
    }

    // 5. Delete auth user (Supabase auth)
    try {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (authDeleteError) throw authDeleteError
      deletionResults.deletedData.auth = 1
      console.log(`[Delete Account] Deleted auth user`)
    } catch (error) {
      deletionResults.errors.push({ table: 'auth', error: error.message })
      console.error('[Delete Account] Error deleting auth user:', error)
    }

    // Check if deletion was successful
    const hasErrors = deletionResults.errors.length > 0
    const totalDeleted = Object.values(deletionResults.deletedData).reduce((a, b) => a + b, 0)

    if (hasErrors) {
      console.error('[Delete Account] Completed with errors:', deletionResults.errors)
      return res.status(207).json({
        success: false,
        message: 'Account deletion completed with some errors',
        results: deletionResults,
      })
    }

    console.log(`[Delete Account] ✅ Successfully deleted account for user: ${userId}`)
    console.log(`[Delete Account] Total items deleted: ${totalDeleted}`)

    return res.status(200).json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted',
      results: deletionResults,
    })

  } catch (error) {
    console.error('[Delete Account] Fatal error:', error)
    return res.status(500).json({
      error: 'Failed to delete account',
      message: error.message,
    })
  }
}
