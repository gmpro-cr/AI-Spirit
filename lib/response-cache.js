/**
 * Response Caching System
 * 
 * Caches Gemini API responses to reduce API calls and costs
 * Implements in-memory LRU cache with TTL
 */

import crypto from 'crypto'

class ResponseCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 500 // Maximum cache entries
    this.ttl = options.ttl || 60 * 60 * 1000 // 1 hour default TTL
    this.cache = new Map()
    this.accessOrder = [] // For LRU eviction
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSaved: 0, // Estimated cost saved
    }
  }

  /**
   * Generate cache key from conversation context
   */
  generateKey(personaId, message, conversationHistory = []) {
    // Create a deterministic key based on persona, message, and recent context
    const contextWindow = conversationHistory.slice(-3) // Last 3 messages for context
    const keyData = {
      personaId,
      message: message.toLowerCase().trim(),
      context: contextWindow.map(m => ({
        role: m.role,
        content: m.content.substring(0, 100), // First 100 chars
      })),
    }
    
    const dataString = JSON.stringify(keyData)
    return crypto.createHash('sha256').update(dataString).digest('hex')
  }

  /**
   * Get cached response if available
   */
  get(key) {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      this.stats.misses++
      return null
    }

    // Update access order (LRU)
    this.updateAccessOrder(key)
    this.stats.hits++
    
    // Estimate cost saved (assuming $0.075 per 1M tokens, avg 500 tokens)
    const avgTokens = 500
    const costPerToken = 0.075 / 1_000_000
    this.stats.totalSaved += avgTokens * costPerToken

    console.log('[Cache] ✅ HIT', {
      key: key.substring(0, 8),
      age: `${Math.floor((Date.now() - entry.createdAt) / 1000)}s`,
      hitRate: `${((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1)}%`,
    })

    return entry.data
  }

  /**
   * Store response in cache
   */
  set(key, data) {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.accessOrder[0]
      this.cache.delete(oldestKey)
      this.accessOrder.shift()
      this.stats.evictions++
      
      console.log('[Cache] Evicted oldest entry', {
        key: oldestKey.substring(0, 8),
        cacheSize: this.cache.size,
      })
    }

    const entry = {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.ttl,
      accessCount: 1,
    }

    this.cache.set(key, entry)
    this.accessOrder.push(key)

    console.log('[Cache] ➕ SET', {
      key: key.substring(0, 8),
      cacheSize: this.cache.size,
      ttl: `${this.ttl / 1000}s`,
    })
  }

  /**
   * Update LRU access order
   */
  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.push(key)
    }
  }

  /**
   * Remove from access order
   */
  removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now()
    let cleared = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        this.removeFromAccessOrder(key)
        cleared++
      }
    }

    if (cleared > 0) {
      console.log(`[Cache] Cleared ${cleared} expired entries`)
    }

    return cleared
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size
    this.cache.clear()
    this.accessOrder = []
    console.log(`[Cache] Cleared all ${size} entries`)
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 
      ? (this.stats.hits / totalRequests) * 100 
      : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate.toFixed(2)}%`,
      evictions: this.stats.evictions,
      estimatedSavings: `$${this.stats.totalSaved.toFixed(4)}`,
      memoryUsage: `${Math.floor(this.getMemoryUsage() / 1024)} KB`,
    }
  }

  /**
   * Estimate memory usage
   */
  getMemoryUsage() {
    let totalSize = 0
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2 // Key size (UTF-16)
      totalSize += JSON.stringify(entry.data).length * 2 // Data size
      totalSize += 50 // Metadata overhead
    }
    return totalSize
  }
}

// Create singleton cache instance
const cache = new ResponseCache({
  maxSize: 500, // Store up to 500 responses
  ttl: 60 * 60 * 1000, // 1 hour TTL
})

// Clean up expired entries every 10 minutes
setInterval(() => {
  cache.clearExpired()
}, 10 * 60 * 1000)

/**
 * Helper function to cache API responses
 */
export async function getCachedResponse(personaId, message, conversationHistory, generateFn) {
  const cacheKey = cache.generateKey(personaId, message, conversationHistory)
  
  // Try to get from cache first
  const cached = cache.get(cacheKey)
  if (cached) {
    return {
      ...cached,
      fromCache: true,
    }
  }

  // Generate new response
  const response = await generateFn()
  
  // Cache the response
  cache.set(cacheKey, response)
  
  return {
    ...response,
    fromCache: false,
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats()
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear()
}

export default cache
