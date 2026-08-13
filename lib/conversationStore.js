/**
 * Local conversation store.
 *
 * Every screen that shows past chats (side panel, /chats) reads the same
 * localStorage keys the chat page writes. Two problems this module fixes:
 *
 *   1. The title used to be rebuilt from the *newest* user message on every
 *      send, so it read as a last-message preview and two conversations with
 *      the same persona were indistinguishable. The title is now derived once,
 *      from the opening message, and preserved from then on.
 *   2. Readers loaded localStorage once on mount and never heard about writes,
 *      so a conversation started in the current session never appeared in the
 *      side panel. Writes now announce themselves.
 */

export const CONVERSATIONS_KEY = 'esperit_conversations'
export const CONVERSATIONS_EVENT = 'aispirit:conversations-updated'

const MAX_CONVERSATIONS = 50
const MAX_TITLE_LENGTH = 48

const conversationKey = (id) => `esperit_conversation_${id}`

const isBrowser = () => typeof window !== 'undefined'

/** Condense the opening message into something readable in a 240px sidebar. */
export function deriveTitle(text = '') {
  const cleaned = String(text).replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'New conversation'
  if (cleaned.length <= MAX_TITLE_LENGTH) return cleaned
  // Prefer cutting at a word boundary rather than mid-word.
  const clipped = cleaned.slice(0, MAX_TITLE_LENGTH)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${(lastSpace > 24 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`
}

export function listConversations() {
  if (!isBrowser()) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error reading conversations:', error)
    return []
  }
}

export function loadConversation(id) {
  if (!isBrowser() || !id) return null
  try {
    const raw = localStorage.getItem(conversationKey(id))
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Error reading conversation:', error)
    return null
  }
}

function announce() {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(CONVERSATIONS_EVENT))
}

/**
 * Persist a conversation and its list entry.
 * `firstUserMessage` only seeds the title when the entry is new.
 */
export function saveConversation({ id, persona, messages, firstUserMessage }) {
  if (!isBrowser() || !id) return null

  const now = new Date().toISOString()

  try {
    localStorage.setItem(
      conversationKey(id),
      JSON.stringify({
        id,
        personaSlug: persona?.slug,
        personaName: persona?.name,
        messages,
        updatedAt: now,
      })
    )

    const list = listConversations()
    const existingIndex = list.findIndex((c) => c.id === id)
    const existing = existingIndex >= 0 ? list[existingIndex] : null

    const meta = {
      id,
      personaSlug: persona?.slug,
      personaName: persona?.name,
      personaImage: persona?.image_url,
      // Title is set once and kept — that is what makes two chats with the
      // same persona tellable apart.
      title: existing?.title || deriveTitle(firstUserMessage || messages?.find((m) => m.role === 'user')?.content),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      messageCount: Array.isArray(messages) ? messages.length : existing?.messageCount || 0,
    }

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1)
    }
    // Most recently used first.
    list.unshift(meta)

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list.slice(0, MAX_CONVERSATIONS)))
    announce()
    return meta
  } catch (error) {
    console.error('Error saving conversation:', error)
    return null
  }
}

export function renameConversation(id, title) {
  if (!isBrowser() || !id) return
  const trimmed = String(title || '').trim()
  if (!trimmed) return
  try {
    const list = listConversations().map((c) => (c.id === id ? { ...c, title: trimmed } : c))
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list))
    announce()
  } catch (error) {
    console.error('Error renaming conversation:', error)
  }
}

export function deleteConversation(id) {
  if (!isBrowser() || !id) return
  try {
    const list = listConversations().filter((c) => c.id !== id)
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list))
    localStorage.removeItem(conversationKey(id))
    announce()
  } catch (error) {
    console.error('Error deleting conversation:', error)
  }
}

/**
 * Call `callback` whenever the list changes — in this tab (custom event) or in
 * another one (native storage event). Returns an unsubscribe function.
 */
export function subscribeToConversations(callback) {
  if (!isBrowser()) return () => {}

  const handleLocal = () => callback(listConversations())
  const handleStorage = (event) => {
    if (!event.key || event.key === CONVERSATIONS_KEY) callback(listConversations())
  }

  window.addEventListener(CONVERSATIONS_EVENT, handleLocal)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(CONVERSATIONS_EVENT, handleLocal)
    window.removeEventListener('storage', handleStorage)
  }
}
