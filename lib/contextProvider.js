import { supabase } from './supabase'
import { getCachedRealtimeContext, getBasicContext } from './realtimeContext'

/**
 * Gets current date and time formatted for India timezone (deprecated - use realtimeContext)
 * @returns {string} Formatted date/time string
 */
export function getDateTime() {
  const now = new Date()

  // Format for India timezone (IST)
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }

  const formatted = new Intl.DateTimeFormat('en-IN', options).format(now)
  return `${formatted} IST (Indian Standard Time)`
}

/**
 * Generates context string with real-time information
 * @param {string} language - 'en' or 'hi'
 * @param {boolean} includeNews - Whether to include news headlines
 * @returns {Promise<string>} Formatted context string
 */
export async function generateContextString(language = 'en', includeNews = true) {
  try {
    // Use the new enhanced real-time context service
    const context = await getCachedRealtimeContext(language, includeNews)
    return context
  } catch (error) {
    console.error('[Context] Error generating context:', error)
    // Fallback to basic context
    return getBasicContext(language)
  }
}

/**
 * Checks if context should be injected for this message
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<boolean>} True if this is the first message
 */
export async function shouldInjectContext(conversationId) {
  if (!conversationId) {
    return false
  }

  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    if (error) {
      console.error('[Context] Error checking message count:', error)
      return false
    }

    const isFirstMessage = count === 0

    console.log('[Context] Injection check:', {
      conversationId,
      messageCount: count,
      isFirstMessage
    })

    return isFirstMessage
  } catch (error) {
    console.error('[Context] Error in shouldInjectContext:', error)
    return false
  }
}

/**
 * Gets context for injection if needed
 * @param {string|null} conversationId - The conversation ID. Pass null to always get context.
 * @param {string} language - 'en' or 'hi' for language-specific context
 * @param {boolean} includeNews - Whether to include news headlines (default: true)
 * @returns {Promise<string|null>} Context string or null if not needed
 */
export async function getContextIfNeeded(conversationId, language = 'en', includeNews = true) {
  // If conversationId is null, always inject context (for always-on updates)
  // Otherwise, check if this is the first message
  const shouldInject = conversationId === null ? true : await shouldInjectContext(conversationId)

  if (!shouldInject) {
    return null
  }

  try {
    const context = await generateContextString(language, includeNews)

    console.log('[Context] Real-time context generated:', {
      conversationId: conversationId || 'always-on',
      language,
      includeNews,
      contextLength: context.length
    })

    return context
  } catch (error) {
    console.error('[Context] Error generating context:', error)
    // Return basic context as fallback
    return getBasicContext(language)
  }
}
