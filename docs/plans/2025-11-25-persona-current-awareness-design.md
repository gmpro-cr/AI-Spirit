# Persona Current Awareness Design

**Date:** November 25, 2025  
**Status:** Approved  
**Author:** Design Session with User

## Overview

This design enables all personas in Esperit.AI to have awareness of current date, time, and recent news headlines, allowing them to have more immersive, contextually relevant, and time-appropriate conversations with users.

## Goals

1. **Natural Time Awareness**: Personas can reference current date, time, day of week naturally in conversations
2. **Current Affairs Awareness**: Personas can naturally reference recent news when relevant to the conversation
3. **Immersive Experience**: Users feel like they're talking to personas who are "alive" and aware of the current world
4. **Zero User Friction**: No commands or special actions required - awareness is automatic

## Key Requirements

- All personas should have current context awareness
- Date/time always available, news headlines available for reference
- Minimal token usage increase (optimize for cost)
- No frontend changes required
- Works across all personas automatically
- Graceful degradation if news service fails
- Free news source (no API costs)

## Architecture

### High-Level Flow

```
User sends first message in conversation
         ↓
API route receives message
         ↓
Check: Is this message #1? (query messages table)
         ↓
    [YES] → Inject current context into system prompt
         ↓
    [NO] → Skip injection (context already in history)
         ↓
Generate Gemini response with enhanced prompt
         ↓
Return response to user
```

### Session-Level Context Injection

**Why Session-Level?**
- **Token Efficiency**: Only add ~150 tokens to first message, 0 tokens for subsequent messages
- **Persistent Memory**: Gemini retains context throughout conversation (32K token window)
- **Cost Effective**: 10-message conversation = ~15 tokens/message average (vs 150/message if injected every time)

**Implementation Logic:**
1. First message of conversation → Inject full context
2. Messages 2-N → No injection (Gemini remembers from history)
3. Optional: Refresh if conversation spans 3+ hours (detect time gap)

### Components

#### 1. News Service (`lib/newsService.js`)

**Purpose**: Fetch and parse Google News RSS feed

**Functions:**
- `fetchGoogleNewsRSS()` - Fetches RSS using `rss-parser` npm package
- `parseHeadlines(feed)` - Extracts titles, sources, pubDate
- `formatForPersona(headlines)` - Formats as bullet list with time ago
- `getCachedNews()` - Returns cached news or fetches fresh

**Caching Strategy:**
- In-memory cache with 1-hour TTL
- Cache structure: `{ headlines: [...], fetchedAt: timestamp }`
- Reduces redundant fetches across concurrent users

**Error Handling:**
- Network timeout: 5 seconds max
- Parse failure: Return empty array
- RSS unavailable: Log error, continue without news
- Never block chat on news failure

#### 2. Context Provider (`lib/contextProvider.js`)

**Purpose**: Generate context strings for injection

**Functions:**
- `getDateTime()` - Returns formatted current date/time (India timezone)
- `generateContextString()` - Combines date/time + news into prompt format
- `shouldInjectContext(conversationId)` - Checks if this is first message

**Date/Time Format:**
```
Current Date & Time: Monday, November 25, 2025 | 9:30 PM IST (Indian Standard Time)
```

**News Format:**
```
Recent Headlines (as of 9:30 PM):
• [BBC News] Major tech announcement today (2 hours ago)
• [Reuters] Global economic update (4 hours ago)
• [TechCrunch] AI breakthrough revealed (1 hour ago)
• [Space.com] Rare planetary alignment this week (5 hours ago)
• [ISRO] Moon mission timeline announced (7 hours ago)
```

**Context Injection Format:**
```
CURRENT AWARENESS:
Date/Time: Monday, November 25, 2025 | 9:30 PM IST
Recent Headlines:
• [Source] Headline (time ago)
• [Source] Headline (time ago)
...

You are aware of current events and can reference them naturally if relevant to the conversation.

---
[Original persona system prompt continues...]
```

#### 3. Enhanced Gemini Service (`lib/gemini.js`)

**Modifications:**
- Add optional `conversationId` parameter to `generatePersonaResponse()`
- Call `shouldInjectContext(conversationId)` to check if first message
- If true, call `generateContextString()` and prepend to `systemPrompt`
- Pass enhanced prompt to Gemini model

**Backward Compatibility:**
- If `conversationId` not provided, skip context injection
- Existing API calls continue to work

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User sends message                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  API Route: /api/chat                                       │
│  - Receives message                                         │
│  - Extracts conversationId                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Context Provider: shouldInjectContext()                    │
│  - Query messages table                                     │
│  - Count messages in conversation                           │
│  - Return true if count === 0                               │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    First msg?      Not first msg?
         │               │
         ▼               ▼
    ┌─────────┐     ┌─────────┐
    │ Inject  │     │  Skip   │
    │ Context │     │         │
    └────┬────┘     └────┬────┘
         │               │
         └───────┬───────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Generate Context String (if injecting)                     │
│  1. Get current date/time from getDateTime()                │
│  2. Get cached news from getCachedNews()                    │
│  3. Format into context string                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Gemini Service: generatePersonaResponse()                  │
│  - Prepend context to systemPrompt (if provided)            │
│  - Create chat with enhanced prompt                         │
│  - Generate response                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Return response to user                                    │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### News Source: Google News RSS

**Why Google News RSS?**
- Free, no API key required
- Reliable, maintained by Google
- Good coverage of major news sources
- Simple RSS format, easy to parse
- Regional support (India-specific feed available)

**RSS URL:**
```
https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en
```

**RSS Parser:**
- Use `rss-parser` npm package
- Lightweight, well-maintained
- Simple API: `await parser.parseURL(url)`

### Database Query

**Check First Message:**
```sql
SELECT COUNT(*) FROM messages 
WHERE conversation_id = $1
```

**If count = 0**: This is the first message, inject context  
**If count > 0**: Skip injection

### Token Usage Analysis

**Context Size:**
- Date/Time: ~30 tokens
- News headlines (5): ~120 tokens
- Instructions: ~20 tokens
- **Total per injection: ~170 tokens**

**Cost Analysis:**
- 10-message conversation:
  - Old approach (inject every message): 1,700 tokens
  - New approach (inject once): 170 tokens
  - **Savings: 90%**

- 50-message conversation:
  - Old approach: 8,500 tokens
  - New approach: 170 tokens
  - **Savings: 98%**

### Caching Strategy

**In-Memory Cache:**
```javascript
const newsCache = {
  headlines: [],
  fetchedAt: null,
  CACHE_DURATION: 3600000 // 1 hour in ms
}
```

**Benefits:**
- Multiple users share same news fetch
- Reduces RSS endpoint load
- Fresh enough (hourly updates)
- Zero infrastructure (no Redis needed)

**Limitation:**
- Cache resets on server restart
- Not shared across serverless instances (Vercel)
- Acceptable: RSS fetch is fast (~200ms)

## Edge Cases & Error Handling

### 1. RSS Fetch Fails
- **Cause**: Network issue, Google News down
- **Handling**: Log error, return empty headlines array
- **User Impact**: Chat continues, just without news awareness
- **Message**: No error shown to user

### 2. RSS Parsing Fails
- **Cause**: Unexpected RSS format, malformed XML
- **Handling**: Catch parse error, return empty array
- **User Impact**: None, chat proceeds normally

### 3. Empty News Feed
- **Cause**: RSS returns no items
- **Handling**: Format as "No recent headlines available"
- **User Impact**: Persona knows there are no headlines

### 4. Very Long Headlines
- **Cause**: Some sources have lengthy titles
- **Handling**: Truncate at 100 characters with "..."
- **User Impact**: Headlines remain readable

### 5. Special Characters in RSS
- **Cause**: HTML entities, emojis, Unicode
- **Handling**: `rss-parser` handles entity decoding automatically
- **User Impact**: Clean text in context

### 6. Network Timeout
- **Cause**: Slow RSS response
- **Handling**: 5-second timeout, then skip news
- **User Impact**: Chat not blocked, proceeds without news

### 7. Stale Context in Long Conversations
- **Cause**: User returns to conversation after many hours
- **Handling**: Context remains from first message
- **User Impact**: Acceptable - personas won't claim "breaking news" since they'll say "earlier I read..." or "today I saw..."
- **Future Enhancement**: Could refresh if time gap > 3 hours detected

### 8. Guest Users
- **Handling**: Full access to context features
- **Reason**: No additional cost per user, improves experience

### 9. Multilingual News
- **Current**: English news from Google News India
- **Future**: Could add language detection and fetch region-specific feeds
- **Impact**: Personas respond in user's language regardless

## Testing Strategy

### Unit Tests

**Context Provider:**
- `getDateTime()` returns correct format
- `generateContextString()` formats properly
- `shouldInjectContext()` correctly identifies first message

**News Service:**
- `fetchGoogleNewsRSS()` successfully fetches and parses
- `formatForPersona()` creates correct bullet format
- `getCachedNews()` respects cache TTL
- Error handling returns empty array on failure

### Integration Tests

1. **First Message Test:**
   - Send first message to new conversation
   - Verify context injected into system prompt
   - Verify Gemini receives enhanced prompt

2. **Subsequent Message Test:**
   - Send second message to same conversation
   - Verify no context injection
   - Verify response quality maintained

3. **RSS Fetch Test:**
   - Mock RSS feed response
   - Verify parsing extracts correct data
   - Verify formatting matches expected output

4. **Error Handling Test:**
   - Mock RSS fetch failure
   - Verify chat continues without news
   - Verify no error shown to user

### Manual Testing Scenarios

**Scenario 1: Time Awareness**
- Start new chat with any persona
- Send greeting: "Hello!"
- Expected: Persona responds with time-appropriate greeting
  - Morning: "Good morning!"
  - Evening: "Good evening!"
  - Night: "Still up?"

**Scenario 2: News Reference**
- Start chat with Einstein
- Ask about physics
- Expected: Einstein may naturally reference recent physics news if relevant

**Scenario 3: Natural Integration**
- Start chat with Astro Guide
- Ask about stargazing
- Expected: Persona references current astronomical events from news

**Scenario 4: Multi-message Conversation**
- Continue conversation from Scenario 1
- Send 5 more messages
- Expected: Persona retains time/news awareness without re-injection

**Scenario 5: RSS Failure**
- Disconnect network during chat start
- Send first message
- Expected: Chat proceeds normally, just without news

## Configuration

### Environment Variables

Add to `.env.local` and `.env.example`:

```bash
# News Service Configuration
NEWS_RSS_URL=https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en
NEWS_CACHE_DURATION=3600000  # 1 hour in milliseconds
NEWS_FETCH_TIMEOUT=5000       # 5 seconds in milliseconds
NEWS_HEADLINE_COUNT=5         # Number of headlines to include
```

### Logging

Add structured logging for monitoring:

```javascript
console.log('[Context] Injection:', {
  conversationId,
  isFirstMessage: true,
  dateTime: true,
  newsCount: 5
})

console.log('[News] RSS Fetch:', {
  success: true,
  cached: true,
  headlineCount: 5,
  duration: '245ms'
})

console.error('[News] RSS Error:', {
  error: error.message,
  url: RSS_URL,
  action: 'continuing without news'
})
```

## Deployment Strategy

### Phase 1: Development
1. Create `lib/newsService.js`
2. Create `lib/contextProvider.js`
3. Modify `lib/gemini.js`
4. Add environment variables
5. Local testing

### Phase 2: Testing
1. Run unit tests
2. Manual testing with multiple personas
3. Test error scenarios (network failure, timeout)
4. Verify token usage is as expected

### Phase 3: Staging
1. Deploy to Vercel preview
2. Test with real Google News RSS
3. Monitor logs for errors
4. Verify caching works across requests

### Phase 4: Production
1. Add environment variables to Vercel production
2. Deploy to production
3. Monitor for 24 hours
4. Check error rates
5. Verify user experience improvements

### Rollback Plan
- Remove context injection call from API route
- Chat functionality reverts to previous behavior
- No data loss or breaking changes

## Success Metrics

### Quantitative
- Token usage increase: Target < 20 tokens/message average
- RSS fetch success rate: Target > 99%
- Chat response latency: Target < +50ms impact
- Error rate: Target < 0.1%

### Qualitative
- User feedback: Personas feel more "alive"
- Conversation quality: More contextually relevant responses
- Natural integration: News referenced when appropriate, not forced

## Future Enhancements

### Phase 2 Features (Post-MVP)
1. **Persona-Specific News**: Filter news by persona domain
   - Einstein: Science news
   - Elon Musk: Tech & business
   - Sports icons: Sports news

2. **Context Refresh**: Refresh context if conversation spans > 3 hours
   - Detect time gap between messages
   - Re-inject updated context

3. **Regional News**: Language-specific news feeds
   - Detect user's language preference
   - Fetch appropriate regional feed

4. **Trending Topics**: Add trending hashtags/topics
   - From Twitter API or Google Trends
   - Give personas awareness of viral topics

5. **Weather Context**: Add current weather for user's location
   - Use IP-based geolocation
   - Add to context: "Weather: 28°C, Sunny in Mumbai"

## Dependencies

### New NPM Packages
- `rss-parser`: ^3.13.0 - For parsing Google News RSS

### Existing Dependencies
- `@google/generative-ai`: Already installed
- `@supabase/supabase-js`: Already installed

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Google News RSS changes format | High | Low | Monitor RSS structure, add schema validation |
| RSS endpoint rate limiting | Medium | Low | Hourly cache reduces requests, implement exponential backoff |
| Token costs increase significantly | High | Low | Session-level injection keeps costs minimal |
| Context confuses AI responses | Medium | Low | Clear formatting, test with multiple personas |
| News not relevant to personas | Low | Medium | Acceptable - personas ignore if not relevant |
| Cache memory usage grows | Low | Low | Fixed size (5 headlines), 1-hour TTL limits growth |

## Conclusion

This design provides personas with current awareness in a cost-effective, reliable, and user-friendly manner. By injecting context only once per conversation, we achieve a 90%+ reduction in token overhead compared to per-message injection. The use of free Google News RSS eliminates API costs, and graceful error handling ensures chat functionality is never compromised.

The implementation is backward-compatible, requires no frontend changes, and automatically enhances all personas without individual modifications. Users will experience more immersive, contextually relevant conversations with personas who feel truly "alive" and aware of the current world.
