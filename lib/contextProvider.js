import { supabase } from './supabase'
import { getCachedNews, formatForPersona } from './newsService'

/**
 * Gets current date and time formatted for India timezone
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
 * Generates context string to inject into system prompt
 * @param {Array} headlines - Array of news headlines
 * @returns {string} Formatted context string
 */
export function generateContextString(headlines) {
  const dateTime = getDateTime()
  const newsFormatted = formatForPersona(headlines)

  let context = `CURRENT AWARENESS:\nDate/Time: ${dateTime}`

  if (newsFormatted) {
    // Extract just the time portion for "as of" message
    const timeMatch = dateTime.match(/(\d+:\d+ [AP]M)/)
    const time = timeMatch ? timeMatch[1] : 'now'

    context += `\nRecent Headlines (as of ${time}):\n${newsFormatted}`
  }

  context += '\n\nYou are aware of current events and can reference them naturally if relevant to the conversation.\n\n---\n\n'

  return context
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
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<string|null>} Context string or null if not needed
 */
export async function getContextIfNeeded(conversationId) {
  const shouldInject = await shouldInjectContext(conversationId)

  if (!shouldInject) {
    return null
  }

  try {
    const headlines = await getCachedNews()
    const context = generateContextString(headlines)

    console.log('[Context] Context generated:', {
      conversationId,
      dateTime: true,
      newsCount: headlines.length
    })

    return context
  } catch (error) {
    console.error('[Context] Error generating context:', error)
    // Return just date/time if news fails
    const dateTime = getDateTime()
    return `CURRENT AWARENESS:\nDate/Time: ${dateTime}\n\n---\n\n`
  }
}
