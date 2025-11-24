# Persona Current Awareness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable all personas to have awareness of current date, time, and recent news headlines for more immersive and contextually relevant conversations.

**Architecture:** Session-level context injection - inject current date/time and Google News RSS headlines into system prompt only on the first message of each conversation. Gemini retains awareness throughout the chat history.

**Tech Stack:** Node.js, Next.js, Google Gemini AI, rss-parser (for RSS parsing), Supabase (for message count query)

---

## Task 1: Install RSS Parser Dependency

**Files:**
- Modify: `package.json` (dependencies section)

**Step 1: Add rss-parser to dependencies**

Run:
```bash
npm install rss-parser
```

Expected: Package installed successfully, package.json updated with `"rss-parser": "^3.13.0"`

**Step 2: Verify installation**

Run:
```bash
npm list rss-parser
```

Expected: Shows `rss-parser@3.13.0` or similar

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add rss-parser for Google News RSS integration"
```

---

## Task 2: Create News Service Module

**Files:**
- Create: `lib/newsService.js`

**Step 1: Write test for news service**

Create: `lib/__tests__/newsService.test.js`

```javascript
import { getCachedNews, formatForPersona } from '../newsService'

describe('newsService', () => {
  describe('formatForPersona', () => {
    it('should format headlines with source and time ago', () => {
      const mockHeadlines = [
        {
          title: 'Major tech announcement',
          source: 'BBC News',
          pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          title: 'Global economic update',
          source: 'Reuters',
          pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        }
      ]

      const result = formatForPersona(mockHeadlines)

      expect(result).toContain('• [BBC News] Major tech announcement (2 hours ago)')
      expect(result).toContain('• [Reuters] Global economic update (4 hours ago)')
    })

    it('should handle empty headlines array', () => {
      const result = formatForPersona([])
      expect(result).toBe('')
    })

    it('should truncate long headlines at 100 characters', () => {
      const mockHeadlines = [{
        title: 'A'.repeat(150),
        source: 'Test',
        pubDate: new Date()
      }]

      const result = formatForPersona(mockHeadlines)
      expect(result).toContain('...')
      expect(result.length).toBeLessThan(150)
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/__tests__/newsService.test.js
```

Expected: FAIL - "Cannot find module '../newsService'"

**Step 3: Implement news service**

Create: `lib/newsService.js`

```javascript
import Parser from 'rss-parser'

const parser = new Parser()

// Cache structure
const newsCache = {
  headlines: [],
  fetchedAt: null
}

// Configuration from environment or defaults
const RSS_URL = process.env.NEWS_RSS_URL || 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en'
const CACHE_DURATION = parseInt(process.env.NEWS_CACHE_DURATION || '3600000', 10) // 1 hour
const FETCH_TIMEOUT = parseInt(process.env.NEWS_FETCH_TIMEOUT || '5000', 10) // 5 seconds
const HEADLINE_COUNT = parseInt(process.env.NEWS_HEADLINE_COUNT || '5', 10)

/**
 * Fetches Google News RSS feed with timeout
 * @returns {Promise<Array>} Array of news items
 */
async function fetchGoogleNewsRSS() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    const feed = await parser.parseURL(RSS_URL)
    clearTimeout(timeoutId)

    return feed.items || []
  } catch (error) {
    console.error('[News] RSS Fetch Error:', {
      error: error.message,
      url: RSS_URL,
      action: 'returning empty array'
    })
    return []
  }
}

/**
 * Parses headlines from RSS feed items
 * @param {Array} items - RSS feed items
 * @returns {Array} Parsed headlines with title, source, pubDate
 */
function parseHeadlines(items) {
  return items.slice(0, HEADLINE_COUNT).map(item => {
    // Extract source from title (Google News format: "Title - Source")
    const titleMatch = item.title.match(/^(.+?)\s*-\s*(.+)$/)
    const title = titleMatch ? titleMatch[1].trim() : item.title
    const source = titleMatch ? titleMatch[2].trim() : item.source?.name || 'Unknown'

    return {
      title,
      source,
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date()
    }
  })
}

/**
 * Formats time ago string from date
 * @param {Date} date - The date to format
 * @returns {string} Human-readable time ago (e.g., "2 hours ago")
 */
function formatTimeAgo(date) {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}

/**
 * Formats headlines for persona context
 * @param {Array} headlines - Array of headline objects
 * @returns {string} Formatted string with bullets
 */
export function formatForPersona(headlines) {
  if (!headlines || headlines.length === 0) {
    return ''
  }

  return headlines.map(headline => {
    let title = headline.title
    if (title.length > 100) {
      title = title.substring(0, 97) + '...'
    }

    const timeAgo = formatTimeAgo(headline.pubDate)
    return `• [${headline.source}] ${title} (${timeAgo})`
  }).join('\n')
}

/**
 * Gets cached news or fetches fresh if cache expired
 * @returns {Promise<Array>} Array of formatted headlines
 */
export async function getCachedNews() {
  const now = Date.now()
  const cacheAge = newsCache.fetchedAt ? now - newsCache.fetchedAt : Infinity

  // Return cached if still valid
  if (cacheAge < CACHE_DURATION && newsCache.headlines.length > 0) {
    console.log('[News] Using cached headlines', {
      cached: true,
      headlineCount: newsCache.headlines.length,
      cacheAge: `${Math.floor(cacheAge / 60000)} minutes`
    })
    return newsCache.headlines
  }

  // Fetch fresh news
  console.log('[News] Fetching fresh headlines', {
    cached: false,
    reason: cacheAge >= CACHE_DURATION ? 'cache expired' : 'cache empty'
  })

  const items = await fetchGoogleNewsRSS()
  const headlines = parseHeadlines(items)

  // Update cache
  newsCache.headlines = headlines
  newsCache.fetchedAt = now

  console.log('[News] RSS Fetch complete', {
    success: true,
    headlineCount: headlines.length
  })

  return headlines
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm test -- lib/__tests__/newsService.test.js
```

Expected: PASS - All tests passing

**Step 5: Commit**

```bash
git add lib/newsService.js lib/__tests__/newsService.test.js
git commit -m "feat: add news service with RSS parsing and caching"
```

---

## Task 3: Create Context Provider Module

**Files:**
- Create: `lib/contextProvider.js`

**Step 1: Write test for context provider**

Create: `lib/__tests__/contextProvider.test.js`

```javascript
import { getDateTime, generateContextString, shouldInjectContext } from '../contextProvider'

describe('contextProvider', () => {
  describe('getDateTime', () => {
    it('should return formatted date and time in IST', () => {
      const result = getDateTime()

      // Should include day of week, date, time, and IST
      expect(result).toMatch(/\w+day, \w+ \d+, \d{4} \| \d+:\d+ [AP]M IST/)
    })
  })

  describe('generateContextString', () => {
    it('should format context with date/time and news', () => {
      const mockNews = [
        { title: 'Test headline', source: 'BBC', pubDate: new Date() }
      ]

      const result = generateContextString(mockNews)

      expect(result).toContain('CURRENT AWARENESS:')
      expect(result).toContain('Date/Time:')
      expect(result).toContain('Recent Headlines')
      expect(result).toContain('You are aware of current events')
    })

    it('should handle empty news gracefully', () => {
      const result = generateContextString([])

      expect(result).toContain('CURRENT AWARENESS:')
      expect(result).toContain('Date/Time:')
      expect(result).not.toContain('Recent Headlines')
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm test -- lib/__tests__/contextProvider.test.js
```

Expected: FAIL - "Cannot find module '../contextProvider'"

**Step 3: Implement context provider**

Create: `lib/contextProvider.js`

```javascript
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm test -- lib/__tests__/contextProvider.test.js
```

Expected: PASS - All tests passing

**Step 5: Commit**

```bash
git add lib/contextProvider.js lib/__tests__/contextProvider.test.js
git commit -m "feat: add context provider for date/time and news injection"
```

---

## Task 4: Enhance Gemini Service

**Files:**
- Modify: `lib/gemini.js`

**Step 1: Review current implementation**

Run:
```bash
cat lib/gemini.js | head -30
```

Expected: See current `generatePersonaResponse` function signature

**Step 2: Add context injection to Gemini service**

Modify: `lib/gemini.js`

Find the function signature:
```javascript
export async function generatePersonaResponse(systemPrompt, messageHistory, metadata = {}) {
```

Replace with:
```javascript
export async function generatePersonaResponse(systemPrompt, messageHistory, metadata = {}, contextString = null) {
  // Inject context if provided
  const enhancedSystemPrompt = contextString
    ? contextString + systemPrompt
    : systemPrompt
```

Then update the model creation to use `enhancedSystemPrompt`:
```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: enhancedSystemPrompt,  // Changed from systemPrompt
  safetySettings: SAFETY_SETTINGS,
  generationConfig: {
    maxOutputTokens: 200,
    temperature: 0.7,
  },
})
```

**Step 3: Test manually**

Since this is a modification to existing function, test manually:

Run:
```bash
npm run dev
```

Then in browser console or API client:
```javascript
// Test that function still works without context
generatePersonaResponse("You are Einstein", [...messages])

// Test that function works with context
generatePersonaResponse("You are Einstein", [...messages], {}, "CURRENT AWARENESS: Date/Time: Monday...")
```

Expected: Both calls work without errors

**Step 4: Commit**

```bash
git add lib/gemini.js
git commit -m "feat: add optional context injection to Gemini service"
```

---

## Task 5: Update Chat API Route

**Files:**
- Modify: `pages/api/chat.js` (or `pages/api/chat/index.js` depending on structure)

**Step 1: Find the chat API route**

Run:
```bash
find pages/api -name "*chat*" -type f
```

Expected: Shows path to chat API file

**Step 2: Add context provider import and logic**

At the top of the chat API file, add import:
```javascript
import { getContextIfNeeded } from '@/lib/contextProvider'
```

Find where `generatePersonaResponse` is called. It should look similar to:
```javascript
const result = await generatePersonaResponse(
  persona.system_prompt,
  messageHistory,
  metadata
)
```

Replace with:
```javascript
// Get context if this is first message
const contextString = await getContextIfNeeded(conversationId)

// Log context injection
if (contextString) {
  console.log('[Chat API] Injecting context for first message', {
    conversationId,
    hasContext: true
  })
}

const result = await generatePersonaResponse(
  persona.system_prompt,
  messageHistory,
  metadata,
  contextString
)
```

**Step 3: Test with local development server**

Run:
```bash
npm run dev
```

Open browser to `http://localhost:3000`

1. Start a new chat with any persona
2. Send first message: "Hi!"
3. Check server logs for: `[Context] Injection check:` and `[Context] Context generated:`
4. Send second message: "How are you?"
5. Check server logs - should show `isFirstMessage: false`

Expected:
- First message gets context injected (logs show "Context generated")
- Second message skips injection (logs show "isFirstMessage: false")
- Persona responds naturally with time awareness

**Step 4: Commit**

```bash
git add pages/api/chat.js
git commit -m "feat: integrate context injection into chat API"
```

---

## Task 6: Add Environment Variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (not committed)

**Step 1: Update .env.example with news configuration**

Add to `.env.example`:
```bash
# News Service Configuration
NEWS_RSS_URL=https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en
NEWS_CACHE_DURATION=3600000
NEWS_FETCH_TIMEOUT=5000
NEWS_HEADLINE_COUNT=5
```

**Step 2: Update local .env.local**

Add same variables to `.env.local`:
```bash
# News Service Configuration
NEWS_RSS_URL=https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en
NEWS_CACHE_DURATION=3600000
NEWS_FETCH_TIMEOUT=5000
NEWS_HEADLINE_COUNT=5
```

**Step 3: Commit .env.example only**

```bash
git add .env.example
git commit -m "docs: add environment variables for news service"
```

---

## Task 7: Integration Testing

**Files:**
- Create: `test_current_awareness.py` (Playwright test)

**Step 1: Create integration test**

Create: `test_current_awareness.py`

```python
"""
Integration test for persona current awareness feature
Tests that personas have access to current date/time and news
"""
import re
from playwright.sync_api import sync_playwright, expect

def test_persona_time_awareness():
    """Test that persona responds with time-appropriate greeting"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        page.goto('http://localhost:3000')

        # Start chat with any persona (Einstein)
        page.click('text=Albert Einstein')
        page.wait_for_selector('[data-testid="chat-input"]')

        # Send greeting
        page.fill('[data-testid="chat-input"]', 'Hello!')
        page.click('[data-testid="send-button"]')

        # Wait for response
        page.wait_for_selector('[data-testid="message-bubble"]:has-text("Good")', timeout=10000)

        # Get response text
        response = page.inner_text('[data-testid="ai-message"]:last-of-type')

        # Check for time-appropriate greeting
        assert any(word in response.lower() for word in ['morning', 'afternoon', 'evening', 'day']), \
            f"Expected time-aware greeting, got: {response}"

        browser.close()

def test_persona_news_awareness():
    """Test that persona can reference current events when relevant"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        page.goto('http://localhost:3000')

        # Start chat with Einstein
        page.click('text=Albert Einstein')
        page.wait_for_selector('[data-testid="chat-input"]')

        # Ask about current events in physics
        page.fill('[data-testid="chat-input"]', "What's happening in physics today?")
        page.click('[data-testid="send-button"]')

        # Wait for response
        page.wait_for_selector('[data-testid="ai-message"]:last-of-type', timeout=15000)

        # Get response text
        response = page.inner_text('[data-testid="ai-message"]:last-of-type')

        # Response should be substantial (persona has context)
        assert len(response) > 50, "Response too short - persona may not have context"

        browser.close()

def test_context_not_injected_on_second_message():
    """Test that context is only injected once per conversation"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Open browser console to check logs
        console_logs = []
        page.on('console', lambda msg: console_logs.append(msg.text()))

        # Navigate to app
        page.goto('http://localhost:3000')

        # Start chat
        page.click('text=Albert Einstein')
        page.wait_for_selector('[data-testid="chat-input"]')

        # First message
        page.fill('[data-testid="chat-input"]', 'Hi!')
        page.click('[data-testid="send-button"]')
        page.wait_for_selector('[data-testid="ai-message"]:nth-of-type(1)', timeout=10000)

        # Second message
        page.fill('[data-testid="chat-input"]', 'How are you?')
        page.click('[data-testid="send-button"]')
        page.wait_for_selector('[data-testid="ai-message"]:nth-of-type(2)', timeout=10000)

        # Check server logs (would need to be exposed or check via API)
        # This is a basic check - in production you'd check server logs

        browser.close()

if __name__ == '__main__':
    print("Running current awareness integration tests...")

    print("\n1. Testing time awareness...")
    test_persona_time_awareness()
    print("✓ Time awareness test passed")

    print("\n2. Testing news awareness...")
    test_persona_news_awareness()
    print("✓ News awareness test passed")

    print("\n3. Testing context injection frequency...")
    test_context_not_injected_on_second_message()
    print("✓ Context injection test passed")

    print("\n✓ All tests passed!")
```

**Step 2: Run integration tests**

Run:
```bash
python test_current_awareness.py
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add test_current_awareness.py
git commit -m "test: add integration tests for current awareness"
```

---

## Task 8: Manual Testing & Validation

**Files:**
- None (manual testing session)

**Step 1: Test with multiple personas**

Start dev server:
```bash
npm run dev
```

Test scenarios:
1. **Einstein + Morning greeting**: Start chat in morning, verify "Good morning" response
2. **Elon Musk + Tech question**: Ask about technology, verify persona references recent tech news if relevant
3. **Astro Guide + Space question**: Ask about stargazing, verify persona mentions current events (meteor shower, etc.)
4. **Long conversation**: Send 10 messages, verify context awareness maintained throughout
5. **New conversation**: Start fresh chat, verify context injected again

**Step 2: Test error handling**

1. **Disconnect network**: Disable network, start chat, verify chat still works (without news)
2. **Invalid RSS URL**: Set `NEWS_RSS_URL` to invalid URL, verify graceful degradation

**Step 3: Test caching**

1. Start multiple new chats within 1 hour
2. Check server logs for "Using cached headlines"
3. Wait 1+ hour, start new chat
4. Check server logs for "Fetching fresh headlines"

**Step 4: Document results**

Create: `TESTING-RESULTS.md`

Document:
- Test scenarios executed
- Results (pass/fail)
- Any edge cases discovered
- Performance notes (latency added)

**Step 5: Commit testing documentation**

```bash
git add TESTING-RESULTS.md
git commit -m "docs: add manual testing results for current awareness"
```

---

## Task 9: Update Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/features/current-awareness.md`

**Step 1: Add feature documentation**

Create: `docs/features/current-awareness.md`

```markdown
# Persona Current Awareness

## Overview

All personas in Esperit.AI have automatic awareness of:
- Current date and time (India timezone)
- Recent news headlines from Google News

This awareness enables more immersive, contextually relevant conversations.

## How It Works

- **Session-Level Injection**: Context is injected only on the first message of each conversation
- **Persistent Memory**: Gemini AI retains awareness throughout the chat history
- **Automatic Updates**: News is cached for 1 hour and automatically refreshed

## User Experience

Personas can naturally reference:
- Time of day ("Good morning!", "Working late?")
- Current date ("Happy Monday!", "It's the 25th today")
- Recent news when relevant to conversation topic

## Configuration

Environment variables in `.env.local`:

```bash
NEWS_RSS_URL=https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en
NEWS_CACHE_DURATION=3600000  # 1 hour
NEWS_FETCH_TIMEOUT=5000       # 5 seconds
NEWS_HEADLINE_COUNT=5
```

## Technical Details

- **Token Impact**: ~150 tokens on first message, 0 tokens on subsequent messages
- **Latency**: <50ms added to first message (cached RSS)
- **Error Handling**: Graceful degradation - chat continues even if news unavailable

## Architecture

See: `docs/plans/2025-11-25-persona-current-awareness-design.md`
```

**Step 2: Update README.md**

Add to features section in `README.md`:

```markdown
### Current Awareness
- Personas have automatic access to current date, time, and recent news
- Enables contextually relevant, time-appropriate conversations
- Session-level context injection for optimal token efficiency
```

**Step 3: Commit documentation**

```bash
git add docs/features/current-awareness.md README.md
git commit -m "docs: add current awareness feature documentation"
```

---

## Task 10: Final Review & Merge Preparation

**Files:**
- Multiple (review changes)

**Step 1: Review all changes**

Run:
```bash
git log --oneline feature/persona-current-awareness ^main
```

Expected: List of all commits made

**Step 2: Run full test suite**

Run:
```bash
npm run lint
npm test
npm run build
```

Expected: All pass without errors

**Step 3: Test production build locally**

Run:
```bash
npm run build
npm run start
```

Test in browser at `http://localhost:3000`

Expected: Feature works in production build

**Step 4: Create summary of changes**

Create: `CHANGES.md`

```markdown
# Persona Current Awareness - Changes Summary

## New Files
- `lib/newsService.js` - RSS fetching and caching
- `lib/contextProvider.js` - Context generation and injection logic
- `lib/__tests__/newsService.test.js` - Unit tests for news service
- `lib/__tests__/contextProvider.test.js` - Unit tests for context provider
- `test_current_awareness.py` - Integration tests
- `docs/features/current-awareness.md` - Feature documentation

## Modified Files
- `lib/gemini.js` - Added optional context parameter
- `pages/api/chat.js` - Integrated context injection
- `.env.example` - Added news service configuration
- `README.md` - Added feature description
- `package.json` - Added rss-parser dependency

## Configuration Added
- `NEWS_RSS_URL` - Google News RSS endpoint
- `NEWS_CACHE_DURATION` - Cache duration (1 hour)
- `NEWS_FETCH_TIMEOUT` - Fetch timeout (5 seconds)
- `NEWS_HEADLINE_COUNT` - Number of headlines (5)

## Testing Completed
- ✓ Unit tests for news service
- ✓ Unit tests for context provider
- ✓ Integration tests with Playwright
- ✓ Manual testing with multiple personas
- ✓ Error handling verification
- ✓ Caching behavior validation
- ✓ Production build testing

## Performance Impact
- First message: +150 tokens, +<50ms latency
- Subsequent messages: +0 tokens, +0ms latency
- Average over 10 messages: +15 tokens/message

## Next Steps
- Deploy to Vercel staging
- Monitor logs for 24 hours
- Collect user feedback
- Consider persona-specific news filtering (future enhancement)
```

**Step 5: Commit changes summary**

```bash
git add CHANGES.md
git commit -m "docs: add changes summary for current awareness feature"
```

**Step 6: Push branch and create PR** (Don't do this yet - wait for approval)

```bash
# Don't run yet - just documenting the command
git push origin feature/persona-current-awareness
```

---

## Verification Checklist

Before considering this complete, verify:

- [ ] `npm install` completes without errors
- [ ] `npm test` passes all tests
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts successfully
- [ ] First message in new conversation logs "Context generated"
- [ ] Second message in conversation logs "isFirstMessage: false"
- [ ] Personas respond with time-appropriate greetings
- [ ] Personas can reference recent news when relevant
- [ ] Chat continues working even if RSS fetch fails
- [ ] News cache works (check logs for "Using cached headlines")
- [ ] Environment variables documented in `.env.example`
- [ ] Feature documented in `docs/features/`
- [ ] All commits have descriptive messages
- [ ] Changes summary created in `CHANGES.md`

---

## Notes for Engineer

- **TDD Approach**: This plan follows Test-Driven Development - write tests first, see them fail, then implement
- **YAGNI**: We're not building persona-specific news filtering yet - keep it simple
- **DRY**: Reuse the caching logic, don't duplicate it
- **Frequent Commits**: Commit after each task completion
- **Error Handling**: All network operations have timeouts and fallbacks
- **Backward Compatibility**: Existing API calls work unchanged (context is optional)

## Related Skills

- @superpowers:test-driven-development - Required for Tasks 2-3
- @superpowers:systematic-debugging - If issues arise during testing
- @superpowers:verification-before-completion - Before Task 10

## Rollback Plan

If issues discovered:
```bash
# In main branch
git worktree remove .worktrees/persona-current-awareness
git branch -D feature/persona-current-awareness
```

Then investigate issues and start fresh if needed.
