# Real-Time Knowledge System for AI Personas

This document explains how all personas in AI-Spirit have access to the latest information and can stay updated with current events.

## Overview

All personas now have **automatic access to**:
- ✅ Current date, time, and day
- ✅ Latest news headlines from India
- ✅ Current events awareness
- ✅ Contextual information based on their language (Hindi/English)

## How It Works

### 1. Real-Time Context Service (`lib/realtimeContext.js`)

This service provides:
- **Current DateTime**: Formatted for Indian timezone (IST)
- **News Headlines**: Top 5 latest headlines from NewsAPI
- **Language Support**: Automatically formats context in Hindi or English
- **Caching**: Results cached for 1 hour to optimize API usage

### 2. Context Injection (`lib/contextProvider.js`)

Every conversation automatically receives:
```
[CURRENT CONTEXT]
Today's Date: Friday, 19 December 2025
Time: 14:30 (afternoon)
Year: 2025

Latest News Headlines:
1. [News Title] (Source)
2. [News Title] (Source)
...

[Use the above information if user asks about current events, date, or recent news]
```

For Hindi personas (like Birbal):
```
[वर्तमान संदर्भ - Current Context]
आज की तारीख: Friday, 19 December 2025
समय: दोपहर 14:30
वर्ष: 2025

आज की मुख्य खबरें:
1. [समाचार शीर्षक] (स्रोत)
...
```

### 3. Automatic Integration

The chat API (`pages/api/chat.js`) automatically:
1. Detects persona's language
2. Fetches latest context
3. Injects it into the conversation
4. Makes it available to ALL personas

## Setup Instructions

### Step 1: Get News API Key (Optional but Recommended)

1. Visit [NewsAPI.org](https://newsapi.org/register)
2. Sign up for a free account
3. Get your API key
4. Add to your `.env.local`:
   ```env
   NEWS_API_KEY=your_api_key_here
   ```

**Free Tier Limits:**
- 100 requests per day
- Perfect for development
- 1-hour caching reduces API calls

### Step 2: Without News API

The system works WITHOUT News API too!
- It will still provide date/time information
- Personas will be aware of current date
- News headlines won't be available
- No errors - graceful fallback

## Features

### ✅ Always Current

Personas know:
- Exact current date and time
- Day of the week
- Current year
- Time of day (morning/afternoon/evening/night)

### ✅ News Aware

With NEWS_API_KEY configured:
- Latest 5 headlines from India
- Source attribution
- Published timestamps
- Updates every hour

### ✅ Language Smart

- **English personas**: Get context in English
- **Hindi personas**: Get context in Hindi (Devanagari)
- Automatic detection based on persona configuration

### ✅ Performance Optimized

- **Caching**: 1-hour cache prevents excessive API calls
- **Fallback**: Works without news API
- **Error Handling**: Graceful degradation
- **Efficient**: Minimal impact on response time

## Usage Examples

### Example 1: User asks about today's date

**User**: "What's today's date?"

**Persona** (has real-time context):
> "Today is Friday, 19th December 2025."

### Example 2: User asks about current events

**User**: "What's happening in the news today?"

**Persona** (with NEWS_API_KEY):
> "Here are today's top headlines from India:
> 1. [Latest news story]
> 2. [Another headline]
> ..."

**Persona** (without NEWS_API_KEY):
> "I don't have access to live news feeds, but I can help you with other questions!"

### Example 3: Hindi Persona (Birbal)

**User**: "आज की तारीख क्या है?"

**Birbal** (receives Hindi context):
> "आज शुक्रवार, 19 दिसंबर 2025 है।"

## Architecture

```
User Message
    ↓
Chat API
    ↓
Detect Persona Language (en/hi)
    ↓
getCachedRealtimeContext(language, includeNews=true)
    ↓
Check Cache (valid for 1 hour)
    ↓
If expired:
    - Fetch current date/time
    - Fetch latest news (if NEWS_API_KEY)
    - Format in correct language
    - Cache result
    ↓
Inject Context into System Prompt
    ↓
Generate AI Response
```

## Configuration

### Environment Variables

```env
# Optional - for news headlines
NEWS_API_KEY=your_api_key_from_newsapi_org

# These are optional (have defaults)
NEWS_CACHE_DURATION=3600000  # 1 hour in ms
NEWS_HEADLINE_COUNT=5         # Number of headlines
```

### Supported Languages

- `en`: English (default)
- `hi`: Hindi (हिंदी)

More languages can be added in `lib/realtimeContext.js`

## Benefits

### For Users:
- ✅ Personas give accurate, current information
- ✅ Can discuss today's events
- ✅ No outdated responses
- ✅ Better conversation experience

### For Developers:
- ✅ Easy to maintain
- ✅ Automatic updates
- ✅ No manual intervention needed
- ✅ Scalable architecture

### For Personas:
- ✅ Always contextually aware
- ✅ Can reference current events naturally
- ✅ More helpful and relevant
- ✅ Enhanced credibility

## Troubleshooting

### Issue: Personas don't mention news

**Solution**: Check if NEWS_API_KEY is set in `.env.local`

```bash
# Check your .env.local
grep NEWS_API_KEY .env.local
```

### Issue: API rate limit exceeded

**Solution**:
1. Free tier has 100 requests/day
2. Caching should prevent this
3. Check console for errors
4. Consider upgrading NewsAPI plan

### Issue: Wrong language context

**Solution**: Check persona language setting in `data/personas.js`

```javascript
{
  name: "Persona Name",
  language: "hi" // or "en"
}
```

## Future Enhancements

Potential improvements:
- [ ] Weather information
- [ ] Trending topics
- [ ] Stock market updates
- [ ] Sports scores
- [ ] Multiple news sources
- [ ] User location-based news
- [ ] Category-specific news (tech, business, sports)
- [ ] News in more languages (Marathi, Tamil, etc.)

## API Reference

### `getCachedRealtimeContext(language, includeNews)`

**Parameters:**
- `language` (string): 'en' or 'hi'
- `includeNews` (boolean): Whether to fetch news headlines

**Returns:** Promise<string> - Formatted context string

**Example:**
```javascript
const context = await getCachedRealtimeContext('en', true)
```

### `getBasicContext(language)`

**Parameters:**
- `language` (string): 'en' or 'hi'

**Returns:** string - Basic date/time context (no news)

**Example:**
```javascript
const context = getBasicContext('hi')
// Returns: "[आज की तारीख: ...]"
```

## Credits

- News powered by [NewsAPI.org](https://newsapi.org)
- Date formatting by [date-fns](https://date-fns.org)
- Built for AI-Spirit by Claude Code

---

**Last Updated**: December 19, 2025
**Version**: 1.0.0
