/**
 * Health Check API
 * 
 * Monitors application and dependency health
 * Used for uptime monitoring and alerting
 */

import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    checks: {
      database: { status: 'unknown', responseTime: 0 },
      geminiAPI: { status: 'unknown', responseTime: 0 },
      memory: { status: 'unknown', usage: {} },
    },
    errors: [],
  }

  // 1. Check Database Connection
  try {
    const dbStartTime = Date.now()
    
    const { data, error } = await supabase
      .from('personas')
      .select('id')
      .limit(1)
      .single()

    const dbResponseTime = Date.now() - dbStartTime

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (acceptable)
      throw error
    }

    health.checks.database = {
      status: 'healthy',
      responseTime: dbResponseTime,
      message: 'Database connection successful',
    }
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message,
      message: 'Database connection failed',
    }
    health.status = 'degraded'
    health.errors.push({ service: 'database', error: error.message })
  }

  // 2. Check Gemini API
  try {
    const apiStartTime = Date.now()
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Simple test prompt
    const result = await model.generateContent('Respond with only: OK')
    const response = result.response.text()
    
    const apiResponseTime = Date.now() - apiStartTime

    health.checks.geminiAPI = {
      status: 'healthy',
      responseTime: apiResponseTime,
      message: 'Gemini API accessible',
      testResponse: response.trim().substring(0, 50),
    }
  } catch (error) {
    health.checks.geminiAPI = {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message,
      message: 'Gemini API check failed',
    }
    health.status = 'degraded'
    health.errors.push({ service: 'geminiAPI', error: error.message })
  }

  // 3. Check Memory Usage
  try {
    const memUsage = process.memoryUsage()
    const totalHeap = memUsage.heapTotal
    const usedHeap = memUsage.heapUsed
    const memoryUsagePercent = (usedHeap / totalHeap) * 100

    health.checks.memory = {
      status: memoryUsagePercent > 90 ? 'warning' : 'healthy',
      usage: {
        heapUsed: `${(usedHeap / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(totalHeap / 1024 / 1024).toFixed(2)} MB`,
        percentUsed: `${memoryUsagePercent.toFixed(2)}%`,
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
      },
      message: memoryUsagePercent > 90 ? 'High memory usage' : 'Memory usage normal',
    }

    if (memoryUsagePercent > 90) {
      health.status = 'degraded'
      health.errors.push({ service: 'memory', error: 'High memory usage' })
    }
  } catch (error) {
    health.checks.memory = {
      status: 'unknown',
      error: error.message,
    }
  }

  // 4. Overall Health Status
  const unhealthyChecks = Object.values(health.checks).filter(
    check => check.status === 'unhealthy'
  ).length

  if (unhealthyChecks >= 2) {
    health.status = 'unhealthy'
  } else if (unhealthyChecks === 1) {
    health.status = 'degraded'
  }

  // 5. Add response time summary
  const responseTimes = []
  if (health.checks.database.responseTime > 0) {
    responseTimes.push(health.checks.database.responseTime)
  }
  if (health.checks.geminiAPI.responseTime > 0) {
    responseTimes.push(health.checks.geminiAPI.responseTime)
  }

  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    health.averageResponseTime = `${avgResponseTime.toFixed(2)}ms`
  }

  // Set appropriate HTTP status code
  const statusCode = health.status === 'healthy' ? 200 
                   : health.status === 'degraded' ? 200
                   : 503

  console.log(`[Health Check] Status: ${health.status}`, {
    database: health.checks.database.status,
    geminiAPI: health.checks.geminiAPI.status,
    memory: health.checks.memory.status,
  })

  return res.status(statusCode).json(health)
}
