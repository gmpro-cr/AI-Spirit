/**
 * Real-time Context Service
 * Provides personas with latest information including:
 * - Current date, time, and day
 * - Latest news headlines
 * - Current events
 * - Trending topics
 */

import { format } from 'date-fns'

/**
 * Fetch latest news headlines from a free news API
 */
async function fetchLatestNews() {
  try {
    // Using NewsAPI.org - you'll need to get a free API key from https://newsapi.org
    const apiKey = process.env.NEWS_API_KEY

    if (!apiKey) {
      console.warn('NEWS_API_KEY not set, skipping news fetch')
      return []
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) {
      console.error('News API error:', response.status)
      return []
    }

    const data = await response.json()
    return data.articles?.slice(0, 5).map(article => ({
      title: article.title,
      source: article.source.name,
      publishedAt: article.publishedAt
    })) || []
  } catch (error) {
    console.error('Error fetching news:', error.message)
    return []
  }
}

/**
 * Get current date and time information
 */
function getCurrentDateTime() {
  const now = new Date()

  return {
    date: format(now, 'dd MMMM yyyy'), // e.g., "19 December 2025"
    time: format(now, 'HH:mm'), // e.g., "14:30"
    day: format(now, 'EEEE'), // e.g., "Friday"
    month: format(now, 'MMMM'), // e.g., "December"
    year: format(now, 'yyyy'), // e.g., "2025"
    timestamp: now.toISOString(),
    timeOfDay: getTimeOfDay(now.getHours()),
    timeOfDayEn: getTimeOfDayEn(now.getHours())
  }
}

/**
 * Determine time of day
 */
// Returns the Hindi label. The English context block needs getTimeOfDayEn —
// it used to interpolate this one, which put a Devanagari word inside an
// otherwise English system prompt on every first message.
function getTimeOfDay(hour) {
  if (hour < 5) return 'रात' // Night
  if (hour < 12) return 'सुबह' // Morning
  if (hour < 17) return 'दोपहर' // Afternoon
  if (hour < 20) return 'शाम' // Evening
  return 'रात' // Night
}

function getTimeOfDayEn(hour) {
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 20) return 'evening'
  return 'night'
}

/**
 * Build context string for Indian personas (Hindi)
 */
function buildHindiContext(dateTime, news) {
  let context = `\n[वर्तमान संदर्भ - Current Context]\n`
  context += `आज की तारीख: ${dateTime.day}, ${dateTime.date}\n`
  context += `समय: ${dateTime.timeOfDay} ${dateTime.time}\n`
  context += `वर्ष: ${dateTime.year}\n`

  if (news.length > 0) {
    context += `\nआज की मुख्य खबरें:\n`
    news.forEach((article, i) => {
      context += `${i + 1}. ${article.title} (${article.source})\n`
    })
  }

  context += `\n[निर्देश: उपरोक्त जानकारी का उपयोग करें यदि उपयोगकर्ता वर्तमान घटनाओं या तारीख के बारे में पूछे]\n\n`
  return context
}

/**
 * Build context string for English personas
 */
function buildEnglishContext(dateTime, news) {
  let context = `\n[CURRENT CONTEXT]\n`
  context += `Today's Date: ${dateTime.day}, ${dateTime.date}\n`
  context += `Time: ${dateTime.time} (${dateTime.timeOfDayEn})\n`
  context += `Year: ${dateTime.year}\n`

  if (news.length > 0) {
    context += `\nLatest News Headlines:\n`
    news.forEach((article, i) => {
      context += `${i + 1}. ${article.title} (${article.source})\n`
    })
  }

  context += `\n[Use the above information if user asks about current events, date, or recent news]\n\n`
  return context
}

/**
 * Main function to get real-time context for a persona
 * @param {string} language - 'hi' for Hindi, 'en' for English
 * @param {boolean} includeNews - Whether to include news headlines
 * @returns {Promise<string>} Formatted context string
 */
export async function getRealtimeContext(language = 'en', includeNews = true) {
  try {
    // Get current date/time
    const dateTime = getCurrentDateTime()

    // Fetch news if requested
    const news = includeNews ? await fetchLatestNews() : []

    // Build context based on language
    if (language === 'hi') {
      return buildHindiContext(dateTime, news)
    } else {
      return buildEnglishContext(dateTime, news)
    }
  } catch (error) {
    console.error('Error building realtime context:', error)
    // Return basic context on error
    const dateTime = getCurrentDateTime()
    return `\n[Current Date: ${dateTime.date}, Time: ${dateTime.time}]\n\n`
  }
}

/**
 * Get a simple context string (just date/time, no news)
 */
export function getBasicContext(language = 'en') {
  const dateTime = getCurrentDateTime()

  if (language === 'hi') {
    return `\n[आज की तारीख: ${dateTime.date}, समय: ${dateTime.time}]\n\n`
  } else {
    return `\n[Today's Date: ${dateTime.date}, Time: ${dateTime.time}]\n\n`
  }
}

/**
 * Cache for context to avoid excessive API calls
 */
let contextCache = {
  data: null,
  timestamp: null,
  ttl: 3600000 // 1 hour in milliseconds
}

/**
 * Get cached context or fetch new one
 */
export async function getCachedRealtimeContext(language = 'en', includeNews = true) {
  const now = Date.now()

  // Check if cache is still valid
  if (contextCache.data && contextCache.timestamp && (now - contextCache.timestamp < contextCache.ttl)) {
    return contextCache.data[language] || contextCache.data['en']
  }

  // Fetch new context
  const contexts = {}
  contexts['en'] = await getRealtimeContext('en', includeNews)
  contexts['hi'] = await getRealtimeContext('hi', includeNews)

  // Update cache
  contextCache = {
    data: contexts,
    timestamp: now,
    ttl: 3600000
  }

  return contexts[language] || contexts['en']
}
