/**
 * Covers the two behaviours the chat list depends on:
 *  - a conversation's title is derived once and never rewritten by later turns
 *  - every write announces itself so open lists refresh
 */

import {
  saveConversation,
  listConversations,
  loadConversation,
  deleteConversation,
  renameConversation,
  subscribeToConversations,
  deriveTitle,
  CONVERSATIONS_KEY,
} from '@/lib/conversationStore'

// Minimal localStorage + event target, since the suite runs in node.
class MemoryStorage {
  constructor() { this.store = new Map() }
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null }
  setItem(k, v) { this.store.set(k, String(v)) }
  removeItem(k) { this.store.delete(k) }
  clear() { this.store.clear() }
}

const listeners = new Map()

beforeEach(() => {
  listeners.clear()
  global.localStorage = new MemoryStorage()
  global.window = {
    localStorage: global.localStorage,
    dispatchEvent: (event) => {
      ;(listeners.get(event.type) || []).forEach((fn) => fn(event))
      return true
    },
    addEventListener: (type, fn) => {
      listeners.set(type, [...(listeners.get(type) || []), fn])
    },
    removeEventListener: (type, fn) => {
      listeners.set(type, (listeners.get(type) || []).filter((f) => f !== fn))
    },
  }
  global.Event = class { constructor(type) { this.type = type } }
})

afterEach(() => {
  delete global.window
  delete global.localStorage
  delete global.Event
})

const persona = { slug: 'osho', name: 'Osho', image_url: '/osho.png' }

describe('deriveTitle', () => {
  it('keeps short messages intact', () => {
    expect(deriveTitle('What is meditation?')).toBe('What is meditation?')
  })

  it('truncates on a word boundary', () => {
    const title = deriveTitle(
      'Tell me everything you know about the nature of consciousness and the mind'
    )
    expect(title.length).toBeLessThanOrEqual(49)
    expect(title.endsWith('…')).toBe(true)
    expect(title).not.toMatch(/\s…$/)
  })

  it('collapses whitespace', () => {
    expect(deriveTitle('  hello\n\n  there ')).toBe('hello there')
  })

  it('falls back when there is no text', () => {
    expect(deriveTitle('')).toBe('New conversation')
  })
})

describe('saveConversation', () => {
  it('titles a new conversation from its opening message', () => {
    saveConversation({
      id: 'c1',
      persona,
      messages: [{ role: 'user', content: 'What is meditation?' }],
      firstUserMessage: 'What is meditation?',
    })

    const [entry] = listConversations()
    expect(entry.title).toBe('What is meditation?')
    expect(entry.personaName).toBe('Osho')
  })

  it('keeps the original title when later turns are saved', () => {
    saveConversation({
      id: 'c1',
      persona,
      messages: [{ role: 'user', content: 'What is meditation?' }],
      firstUserMessage: 'What is meditation?',
    })

    saveConversation({
      id: 'c1',
      persona,
      messages: [
        { role: 'user', content: 'What is meditation?' },
        { role: 'assistant', content: 'Watching the mind.' },
        { role: 'user', content: 'and what about dynamic meditation' },
      ],
      firstUserMessage: 'and what about dynamic meditation',
    })

    const entries = listConversations()
    expect(entries).toHaveLength(1)
    // The old code rebuilt the title from the newest message on every send.
    expect(entries[0].title).toBe('What is meditation?')
    expect(entries[0].messageCount).toBe(3)
  })

  it('preserves createdAt while advancing updatedAt', async () => {
    saveConversation({ id: 'c1', persona, messages: [{ role: 'user', content: 'hi' }] })
    const first = listConversations()[0]

    await new Promise((r) => setTimeout(r, 5))
    saveConversation({ id: 'c1', persona, messages: [{ role: 'user', content: 'hi' }] })
    const second = listConversations()[0]

    expect(second.createdAt).toBe(first.createdAt)
    expect(new Date(second.updatedAt) >= new Date(first.updatedAt)).toBe(true)
  })

  it('moves the most recently used conversation to the top', () => {
    saveConversation({ id: 'a', persona, messages: [{ role: 'user', content: 'first' }] })
    saveConversation({ id: 'b', persona, messages: [{ role: 'user', content: 'second' }] })
    expect(listConversations().map((c) => c.id)).toEqual(['b', 'a'])

    saveConversation({ id: 'a', persona, messages: [{ role: 'user', content: 'first' }] })
    expect(listConversations().map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('distinguishes two conversations with the same persona', () => {
    saveConversation({ id: 'a', persona, messages: [{ role: 'user', content: 'about grief' }] })
    saveConversation({ id: 'b', persona, messages: [{ role: 'user', content: 'about desire' }] })

    const titles = listConversations().map((c) => c.title)
    expect(new Set(titles).size).toBe(2)
  })

  it('round-trips the message body', () => {
    const messages = [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
    ]
    saveConversation({ id: 'c1', persona, messages })
    expect(loadConversation('c1').messages).toEqual(messages)
  })
})

describe('subscribeToConversations', () => {
  it('notifies listeners on save, rename and delete', () => {
    const seen = []
    const unsubscribe = subscribeToConversations((list) => seen.push(list.length))

    saveConversation({ id: 'a', persona, messages: [{ role: 'user', content: 'hi' }] })
    renameConversation('a', 'Renamed')
    deleteConversation('a')

    expect(seen).toEqual([1, 1, 0])
    unsubscribe()

    saveConversation({ id: 'b', persona, messages: [{ role: 'user', content: 'hi' }] })
    expect(seen).toHaveLength(3)
  })
})

describe('deleteConversation', () => {
  it('removes both the list entry and the stored messages', () => {
    saveConversation({ id: 'a', persona, messages: [{ role: 'user', content: 'hi' }] })
    deleteConversation('a')
    expect(listConversations()).toEqual([])
    expect(loadConversation('a')).toBeNull()
  })
})

describe('listConversations', () => {
  it('survives corrupt storage', () => {
    localStorage.setItem(CONVERSATIONS_KEY, '{not json')
    expect(listConversations()).toEqual([])
  })
})
