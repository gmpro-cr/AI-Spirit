/**
 * Cache Statistics API
 * 
 * View response cache performance metrics
 * DEV ONLY - Not exposed in production
 */

import { getCacheStats, clearCache } from '@/lib/response-cache'

export default async function handler(req, res) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' })
  }

  if (req.method === 'GET') {
    // Get cache statistics
    const stats = getCacheStats()
    
    return res.status(200).json({
      cache: stats,
      timestamp: new Date().toISOString(),
    })
  } else if (req.method === 'DELETE') {
    // Clear cache
    clearCache()
    
    return res.status(200).json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
