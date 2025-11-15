// Admin API endpoint for viewing cost statistics
// TODO: Add authentication to restrict access to admins only

import { getCostStats, getCostStatsByUser, logCostSummary } from '@/lib/cost-tracking'

export default async function handler(req, res) {
  // TODO: Add admin authentication check
  // For now, only enable in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { period = '24' } = req.query
    const hours = parseInt(period, 10) || 24

    const stats = getCostStats(hours)
    const userStats = getCostStatsByUser(hours)
    const summary = logCostSummary()

    // Convert Map to Object for JSON response
    const userStatsObject = {}
    for (const [userId, data] of userStats) {
      userStatsObject[userId] = data
    }

    return res.status(200).json({
      summary: stats,
      byUser: userStatsObject,
      hourly: summary.hourly,
      daily: summary.daily,
      period: `${hours} hours`,
    })
  } catch (error) {
    console.error('Cost Stats API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
