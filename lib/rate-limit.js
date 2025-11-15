// Simple in-memory rate limiter
// For production, consider using Redis or Vercel KV for distributed rate limiting

const rateLimitMap = new Map()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.resetTime > 0) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export class RateLimitError extends Error {
  constructor(message, retryAfter) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

/**
 * Rate limiter configuration
 * @param {Object} options
 * @param {number} options.interval - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.limit - Maximum requests per interval (default: 10)
 */
export function createRateLimiter(options = {}) {
  const interval = options.interval || 60 * 1000 // 1 minute default
  const limit = options.limit || 10 // 10 requests per minute default

  return {
    /**
     * Check if request is allowed
     * @param {string} identifier - Unique identifier (user ID, IP address, etc.)
     * @returns {Object} { allowed: boolean, remaining: number, resetTime: number }
     */
    check(identifier) {
      const now = Date.now()
      const key = identifier

      if (!rateLimitMap.has(key)) {
        // First request from this identifier
        rateLimitMap.set(key, {
          count: 1,
          resetTime: now + interval,
        })
        return { allowed: true, remaining: limit - 1, resetTime: now + interval }
      }

      const record = rateLimitMap.get(key)

      // Check if the time window has expired
      if (now > record.resetTime) {
        // Reset the counter
        record.count = 1
        record.resetTime = now + interval
        rateLimitMap.set(key, record)
        return { allowed: true, remaining: limit - 1, resetTime: record.resetTime }
      }

      // Check if limit exceeded
      if (record.count >= limit) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000) // seconds
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime,
          retryAfter,
        }
      }

      // Increment counter
      record.count++
      rateLimitMap.set(key, record)
      return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime }
    },

    /**
     * Reset rate limit for an identifier
     * @param {string} identifier
     */
    reset(identifier) {
      rateLimitMap.delete(identifier)
    },
  }
}

// Pre-configured rate limiters for different endpoints
export const chatRateLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 10, // 10 messages per minute
})

export const apiRateLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 30, // 30 API calls per minute
})

export const authRateLimiter = createRateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 auth attempts per 15 minutes
})

/**
 * Get client identifier (user ID or IP address)
 * @param {Object} req - Next.js request object
 * @param {Object} session - User session object
 * @returns {string} - Identifier for rate limiting
 */
export function getClientIdentifier(req, session = null) {
  // Prefer user ID if authenticated
  if (session?.user?.id) {
    return `user:${session.user.id}`
  }

  // Fall back to IP address for guest users
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.connection?.remoteAddress || 'unknown'
  return `ip:${ip}`
}
