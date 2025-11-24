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
