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
