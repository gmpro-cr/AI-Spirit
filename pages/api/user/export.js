/**
 * User Data Export API (GDPR Compliance)
 * 
 * Allows users to export all their data in JSON format.
 * This is required for GDPR compliance (Right to Data Portability).
 */

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    console.log(`[Data Export] Starting export for user: ${userId}`)

    const exportData = {
      exportMetadata: {
        userId,
        exportDate: new Date().toISOString(),
        format: 'JSON',
        version: '1.0',
      },
      user: null,
      conversations: [],
      messages: [],
      personas: [],
      statistics: {
        totalConversations: 0,
        totalMessages: 0,
        totalPersonas: 0,
        accountCreated: null,
        lastActivity: null,
      },
    }

    // 1. Export user profile
    try {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError
      
      exportData.user = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      }
      
      exportData.statistics.accountCreated = userData.created_at
      
      console.log(`[Data Export] Exported user profile`)
    } catch (error) {
      console.error('[Data Export] Error exporting user profile:', error)
      // Continue even if user profile fails
      exportData.user = { error: error.message }
    }

    // 2. Export conversations
    try {
      const { data: conversations, error: conversationsError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (conversationsError) throw conversationsError
      
      exportData.conversations = conversations || []
      exportData.statistics.totalConversations = conversations?.length || 0
      
      console.log(`[Data Export] Exported ${conversations?.length || 0} conversations`)
    } catch (error) {
      console.error('[Data Export] Error exporting conversations:', error)
      exportData.conversations = [{ error: error.message }]
    }

    // 3. Export messages
    try {
      // Get all conversation IDs
      const conversationIds = exportData.conversations
        .filter(c => c.id)
        .map(c => c.id)

      if (conversationIds.length > 0) {
        const { data: messages, error: messagesError } = await supabaseAdmin
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError
        
        exportData.messages = messages || []
        exportData.statistics.totalMessages = messages?.length || 0
        
        // Calculate last activity
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1]
          exportData.statistics.lastActivity = lastMessage.created_at
        }
        
        console.log(`[Data Export] Exported ${messages?.length || 0} messages`)
      }
    } catch (error) {
      console.error('[Data Export] Error exporting messages:', error)
      exportData.messages = [{ error: error.message }]
    }

    // 4. Export user-created personas (if any)
    try {
      const { data: personas, error: personasError } = await supabaseAdmin
        .from('personas')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (personasError) throw personasError
      
      exportData.personas = personas || []
      exportData.statistics.totalPersonas = personas?.length || 0
      
      console.log(`[Data Export] Exported ${personas?.length || 0} personas`)
    } catch (error) {
      console.error('[Data Export] Error exporting personas:', error)
      exportData.personas = [{ error: error.message }]
    }

    // Calculate data size
    const dataSize = JSON.stringify(exportData).length
    exportData.exportMetadata.sizeBytes = dataSize
    exportData.exportMetadata.sizeKB = (dataSize / 1024).toFixed(2)

    console.log(`[Data Export] ✅ Export completed for user: ${userId}`)
    console.log(`[Data Export] Total size: ${exportData.exportMetadata.sizeKB} KB`)
    console.log(`[Data Export] Stats: ${exportData.statistics.totalConversations} conversations, ${exportData.statistics.totalMessages} messages`)

    // Determine format based on query parameter
    const format = req.query.format || 'json'

    if (format === 'download') {
      // Send as downloadable file
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="esperit-data-export-${userId}-${Date.now()}.json"`)
      return res.status(200).send(JSON.stringify(exportData, null, 2))
    } else {
      // Send as JSON response
      return res.status(200).json(exportData)
    }

  } catch (error) {
    console.error('[Data Export] Fatal error:', error)
    return res.status(500).json({
      error: 'Failed to export data',
      message: error.message,
    })
  }
}
