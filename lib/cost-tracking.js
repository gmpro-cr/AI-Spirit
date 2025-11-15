// API Cost Tracking and Monitoring
// Tracks Gemini API usage and estimated costs

const costLog = []
const MAX_LOG_SIZE = 1000 // Keep last 1000 API calls

// Gemini 2.5 Flash pricing (as of Nov 2024)
const PRICING = {
  INPUT_PER_1M_TOKENS: 0.075, // $0.075 per 1M input tokens
  OUTPUT_PER_1M_TOKENS: 0.30, // $0.30 per 1M output tokens
}

/**
 * Estimate token count (rough approximation)
 * More accurate: use actual token count from Gemini API response
 * @param {string} text
 * @returns {number} estimated token count
 */
function estimateTokens(text) {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4)
}

/**
 * Calculate cost for an API call
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @returns {number} cost in dollars
 */
export function calculateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1_000_000) * PRICING.INPUT_PER_1M_TOKENS
  const outputCost = (outputTokens / 1_000_000) * PRICING.OUTPUT_PER_1M_TOKENS
  return inputCost + outputCost
}

/**
 * Log an API call for cost tracking
 * @param {Object} callData
 * @param {string} callData.conversationId
 * @param {string} callData.userId
 * @param {string} callData.input - Input text
 * @param {string} callData.output - Output text
 * @param {number} callData.inputTokens - Actual input tokens (if available)
 * @param {number} callData.outputTokens - Actual output tokens (if available)
 */
export function logApiCall(callData) {
  const inputTokens = callData.inputTokens || estimateTokens(callData.input)
  const outputTokens = callData.outputTokens || estimateTokens(callData.output)
  const cost = calculateCost(inputTokens, outputTokens)

  const logEntry = {
    timestamp: new Date().toISOString(),
    conversationId: callData.conversationId,
    userId: callData.userId || 'guest',
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCost: cost,
  }

  costLog.push(logEntry)

  // Keep log size manageable
  if (costLog.length > MAX_LOG_SIZE) {
    costLog.shift()
  }

  // Log to console for monitoring
  console.log('[API Cost]', {
    userId: logEntry.userId,
    tokens: logEntry.totalTokens,
    cost: `$${cost.toFixed(4)}`,
    timestamp: logEntry.timestamp,
  })

  return logEntry
}

/**
 * Get cost statistics for a time period
 * @param {number} hoursAgo - How many hours to look back
 * @returns {Object} statistics
 */
export function getCostStats(hoursAgo = 24) {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

  const recentCalls = costLog.filter(
    (entry) => new Date(entry.timestamp) > cutoffTime
  )

  if (recentCalls.length === 0) {
    return {
      calls: 0,
      totalTokens: 0,
      totalCost: 0,
      avgCostPerCall: 0,
      period: `${hoursAgo} hours`,
    }
  }

  const totalTokens = recentCalls.reduce((sum, entry) => sum + entry.totalTokens, 0)
  const totalCost = recentCalls.reduce((sum, entry) => sum + entry.estimatedCost, 0)

  return {
    calls: recentCalls.length,
    totalTokens,
    totalCost,
    avgCostPerCall: totalCost / recentCalls.length,
    avgTokensPerCall: totalTokens / recentCalls.length,
    period: `${hoursAgo} hours`,
    projectedMonthlyCost: (totalCost / hoursAgo) * 24 * 30, // Extrapolate to monthly
  }
}

/**
 * Get cost statistics by user
 * @param {number} hoursAgo - How many hours to look back
 * @returns {Map<string, Object>} user statistics
 */
export function getCostStatsByUser(hoursAgo = 24) {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

  const recentCalls = costLog.filter(
    (entry) => new Date(entry.timestamp) > cutoffTime
  )

  const userStats = new Map()

  for (const entry of recentCalls) {
    const userId = entry.userId
    if (!userStats.has(userId)) {
      userStats.set(userId, {
        calls: 0,
        totalTokens: 0,
        totalCost: 0,
      })
    }

    const stats = userStats.get(userId)
    stats.calls++
    stats.totalTokens += entry.totalTokens
    stats.totalCost += entry.estimatedCost
  }

  return userStats
}

/**
 * Check if cost threshold exceeded (for alerts)
 * @param {number} dailyBudget - Daily budget in dollars
 * @returns {Object} alert info
 */
export function checkCostThreshold(dailyBudget = 15) {
  const stats = getCostStats(24)

  const percentUsed = (stats.totalCost / dailyBudget) * 100
  const exceeded = stats.totalCost > dailyBudget

  return {
    exceeded,
    percentUsed,
    currentCost: stats.totalCost,
    budget: dailyBudget,
    remaining: Math.max(0, dailyBudget - stats.totalCost),
  }
}

/**
 * Log cost stats periodically (call this in a cron job or on-demand)
 */
export function logCostSummary() {
  const hourly = getCostStats(1)
  const daily = getCostStats(24)

  console.log('\n=== API Cost Summary ===')
  console.log('Last Hour:', {
    calls: hourly.calls,
    cost: `$${hourly.totalCost.toFixed(4)}`,
    tokens: hourly.totalTokens.toLocaleString(),
  })
  console.log('Last 24 Hours:', {
    calls: daily.calls,
    cost: `$${daily.totalCost.toFixed(2)}`,
    tokens: daily.totalTokens.toLocaleString(),
    projectedMonthly: `$${daily.projectedMonthlyCost.toFixed(2)}`,
  })
  console.log('========================\n')

  return { hourly, daily }
}
