import { getDateTime, generateContextString, shouldInjectContext } from '../contextProvider'

describe('contextProvider', () => {
  describe('getDateTime', () => {
    it('should return formatted date and time in IST', () => {
      const result = getDateTime()

      // Should include day of week, date, time, and IST
      expect(result).toMatch(/\w+day, \d+ \w+ \d{4} at \d+:\d+ [ap]m IST/)
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
