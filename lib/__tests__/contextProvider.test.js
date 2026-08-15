/**
 * Tests for contextProvider module
 *
 * Note on testing async functions with external dependencies:
 * The shouldInjectContext and getContextIfNeeded functions depend on external services
 * (Supabase and RSS feeds). In a real production environment, these would be mocked.
 * For this implementation, we're using a pragmatic approach that tests the logic
 * with minimal mocking complexity given ES module constraints.
 */

import { getDateTime, generateContextString } from '../contextProvider'

describe('contextProvider', () => {
  describe('getDateTime', () => {
    it('should return formatted date and time in IST', () => {
      const result = getDateTime()

      // Should include day of week, date, time, and IST
      expect(result).toMatch(/\w+day, \d+ \w+ \d{4} at \d+:\d+ [ap]m IST/)
    })

    it('should always include IST timezone indicator', () => {
      const result = getDateTime()
      expect(result).toContain('IST (Indian Standard Time)')
    })

    it('should format date in English (India) locale', () => {
      const result = getDateTime()
      // Check for month names in English
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
      const hasMonth = months.some(month => result.includes(month))
      expect(hasMonth).toBe(true)
    })
  })

  describe('generateContextString', () => {
    // These tests asserted a format that no longer exists — CURRENT AWARENESS:,
    // "[Reuters] headline", "as of 5:03 PM" — and called the function
    // synchronously with a news array. generateContextString became async with
    // an (language, includeNews) signature and now delegates to
    // realtimeContext, so every assertion here had been throwing
    // "received is not iterable" since that refactor. With no CI, nothing said
    // so. Rewritten against what the module actually emits.

    it('resolves to a string carrying the current date', async () => {
      const result = await generateContextString('en', false)

      expect(typeof result).toBe('string')
      expect(result).toContain(String(new Date().getFullYear()))
    })

    it('labels the date so the model can find it in the prompt', async () => {
      const result = await generateContextString('en', false)

      // Either the full realtime block or the getBasicContext fallback — both
      // label the date, which is the part the persona has to be able to use.
      expect(result).toMatch(/Today's Date:/)
    })

    it('returns Hindi context when asked for it', async () => {
      const result = await generateContextString('hi', false)

      // Devanagari in either the full block or the fallback.
      expect(result).toMatch(/[\u0900-\u097F]/)
    })

    it('falls back rather than throwing when the realtime source fails', async () => {
      // The news path is a live network dependency; a failure there must not
      // take the chat request down with it.
      const originalFetch = global.fetch
      global.fetch = () => Promise.reject(new Error('network down'))

      try {
        const result = await generateContextString('en', true)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
        expect(result).toContain(String(new Date().getFullYear()))
      } finally {
        global.fetch = originalFetch
      }
    })

    it('is safe to call repeatedly (cached path returns the same shape)', async () => {
      const first = await generateContextString('en', false)
      const second = await generateContextString('en', false)

      expect(typeof first).toBe('string')
      expect(typeof second).toBe('string')
      expect(second).toContain(String(new Date().getFullYear()))
    })
  })

  /**
   * Tests for shouldInjectContext
   *
   * This function queries Supabase to check message count.
   * We test the logic paths with controlled scenarios.
   */
  describe('shouldInjectContext', () => {
    let shouldInjectContext

    beforeAll(async () => {
      const contextProviderModule = await import('../contextProvider.js')
      shouldInjectContext = contextProviderModule.shouldInjectContext
    })

    // Suppress console output during async tests
    let originalLog
    let originalError

    beforeEach(() => {
      originalLog = console.log
      originalError = console.error
      console.log = () => {}
      console.error = () => {}
    })

    afterEach(() => {
      console.log = originalLog
      console.error = originalError
    })

    it('should return false when conversationId is null', async () => {
      const result = await shouldInjectContext(null)
      expect(result).toBe(false)
    })

    it('should return false when conversationId is undefined', async () => {
      const result = await shouldInjectContext(undefined)
      expect(result).toBe(false)
    })

    it('should return false when conversationId is empty string', async () => {
      const result = await shouldInjectContext('')
      expect(result).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      // Track if console.error was called
      let errorCalled = false
      const testError = console.error
      console.error = (...args) => {
        errorCalled = true
        testError(...args)
      }

      // This will likely fail due to missing/invalid credentials in test environment
      // which is exactly what we want to test - error handling
      const result = await shouldInjectContext('test-invalid-id')

      // Function should return false on any error, not throw
      expect(typeof result).toBe('boolean')
      // Note: errorCalled will be true if there was a database error
      // This is expected in test environment without valid Supabase credentials
    })
  })

  /**
   * Tests for getContextIfNeeded
   *
   * This is an integration function that combines shouldInjectContext
   * and news fetching. We test the integration logic.
   */
  describe('getContextIfNeeded', () => {
    let getContextIfNeeded

    beforeAll(async () => {
      const contextProviderModule = await import('../contextProvider.js')
      getContextIfNeeded = contextProviderModule.getContextIfNeeded
    })

    // Suppress console output during async tests
    let originalLog
    let originalError

    beforeEach(() => {
      originalLog = console.log
      originalError = console.error
      console.log = () => {}
      console.error = () => {}
    })

    afterEach(() => {
      console.log = originalLog
      console.error = originalError
    })

    it('should return context when conversationId is null (guest mode)', async () => {
      // null conversationId = guest user's first message
      const result = await getContextIfNeeded(null)
      expect(result).not.toBeNull()
      // Same stale-format problem as the block above: the label is
      // [CURRENT CONTEXT] now, not CURRENT AWARENESS:.
      expect(result).toContain('Today\'s Date:')
    })

    it('should handle errors gracefully and return fallback context', async () => {
      // Using an invalid ID will trigger error handling
      // The function should return date/time-only context as fallback
      const result = await getContextIfNeeded('test-invalid-id-for-error')

      // Even on error, should return some context (date/time only)
      if (result !== null) {
        // Same stale-format problem as the block above: the label is
      // [CURRENT CONTEXT] now, not CURRENT AWARENESS:.
      expect(result).toContain('Today\'s Date:')
        }
    })

    it('should always return string or null, never throw', async () => {
      // Test that function doesn't throw even with bad input
      const testCases = [null, undefined, '', 'invalid-id-12345']

      for (const testCase of testCases) {
        const result = await getContextIfNeeded(testCase)
        expect(result === null || typeof result === 'string').toBe(true)
      }
    })
  })
})
