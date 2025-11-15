/**
 * Load Testing Script for AI-Spirit
 * 
 * Tests application performance under various load conditions
 * Simulates multiple concurrent users sending messages
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Test configuration
const TEST_CONFIG = {
  // Number of concurrent users to simulate
  concurrentUsers: 10,
  
  // Messages per user
  messagesPerUser: 5,
  
  // Delay between messages (ms)
  messageDelay: 1000,
  
  // Test duration (ms) - 0 means run all messages
  testDuration: 0,
  
  // Persona ID to test with
  personaId: 'elon-musk',
}

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  totalResponseTime: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null,
}

// Test messages
const TEST_MESSAGES = [
  "Hello! How are you today?",
  "What do you think about artificial intelligence?",
  "Tell me about your background.",
  "What are your goals for the future?",
  "Can you give me some advice?",
  "What's your perspective on innovation?",
  "How do you stay motivated?",
  "What challenges have you faced?",
  "What inspires you the most?",
  "Thank you for the conversation!",
]

/**
 * Simulate a single user session
 */
async function simulateUser(userId) {
  const userMetrics = {
    userId,
    messagesS: 0,
    errors: 0,
    avgResponseTime: 0,
  }

  console.log(`[User ${userId}] Starting session...`)

  // Create Supabase client for this user
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Create a new conversation
  let conversationId = null
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: null, // Guest user
        persona_id: TEST_CONFIG.personaId,
        title: `Load Test User ${userId}`,
      })
      .select()
      .single()

    if (error) throw error
    conversationId = data.id
    console.log(`[User ${userId}] Created conversation: ${conversationId}`)
  } catch (error) {
    console.error(`[User ${userId}] Failed to create conversation:`, error.message)
    return userMetrics
  }

  // Send messages
  for (let i = 0; i < TEST_CONFIG.messagesPerUser; i++) {
    const message = TEST_MESSAGES[i % TEST_MESSAGES.length]
    
    try {
      const startTime = Date.now()
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          personaId: TEST_CONFIG.personaId,
          message,
        }),
      })

      const responseTime = Date.now() - startTime
      metrics.totalRequests++
      metrics.responseTimes.push(responseTime)
      metrics.totalResponseTime += responseTime

      if (response.status === 429) {
        metrics.rateLimitedRequests++
        console.log(`[User ${userId}] ⚠️ Rate limited on message ${i + 1}`)
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000))
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      metrics.successfulRequests++
      userMetrics.messagesSent++
      
      console.log(`[User ${userId}] ✅ Message ${i + 1}/${TEST_CONFIG.messagesPerUser} - ${responseTime}ms`)

    } catch (error) {
      metrics.failedRequests++
      userMetrics.errors++
      metrics.errors.push({
        userId,
        message: error.message,
        timestamp: new Date().toISOString(),
      })
      console.error(`[User ${userId}] ❌ Error on message ${i + 1}:`, error.message)
    }

    // Delay between messages
    if (i < TEST_CONFIG.messagesPerUser - 1) {
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.messageDelay))
    }
  }

  // Clean up: Delete test conversation
  try {
    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
    console.log(`[User ${userId}] Cleaned up conversation`)
  } catch (error) {
    console.error(`[User ${userId}] Failed to clean up:`, error.message)
  }

  return userMetrics
}

/**
 * Calculate statistics
 */
function calculateStats() {
  const duration = (metrics.endTime - metrics.startTime) / 1000 // seconds
  
  // Response time statistics
  const sortedTimes = [...metrics.responseTimes].sort((a, b) => a - b)
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0
  const avgResponseTime = metrics.totalResponseTime / metrics.totalRequests || 0

  return {
    duration: duration.toFixed(2),
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    rateLimitedRequests: metrics.rateLimitedRequests,
    successRate: ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2),
    requestsPerSecond: (metrics.totalRequests / duration).toFixed(2),
    avgResponseTime: avgResponseTime.toFixed(2),
    p50ResponseTime: p50.toFixed(2),
    p95ResponseTime: p95.toFixed(2),
    p99ResponseTime: p99.toFixed(2),
    minResponseTime: Math.min(...sortedTimes).toFixed(2),
    maxResponseTime: Math.max(...sortedTimes).toFixed(2),
  }
}

/**
 * Print test results
 */
function printResults(stats) {
  console.log('\n' + '='.repeat(60))
  console.log('LOAD TEST RESULTS')
  console.log('='.repeat(60))
  
  console.log('\n📊 Test Configuration:')
  console.log(`  Concurrent Users: ${TEST_CONFIG.concurrentUsers}`)
  console.log(`  Messages per User: ${TEST_CONFIG.messagesPerUser}`)
  console.log(`  Total Expected Requests: ${TEST_CONFIG.concurrentUsers * TEST_CONFIG.messagesPerUser}`)
  console.log(`  Persona: ${TEST_CONFIG.personaId}`)
  
  console.log('\n⏱️  Performance Metrics:')
  console.log(`  Test Duration: ${stats.duration}s`)
  console.log(`  Total Requests: ${stats.totalRequests}`)
  console.log(`  Successful: ${stats.successfulRequests} (${stats.successRate}%)`)
  console.log(`  Failed: ${stats.failedRequests}`)
  console.log(`  Rate Limited: ${stats.rateLimitedRequests}`)
  console.log(`  Requests/Second: ${stats.requestsPerSecond}`)
  
  console.log('\n🚀 Response Times:')
  console.log(`  Average: ${stats.avgResponseTime}ms`)
  console.log(`  Minimum: ${stats.minResponseTime}ms`)
  console.log(`  Maximum: ${stats.maxResponseTime}ms`)
  console.log(`  p50 (Median): ${stats.p50ResponseTime}ms`)
  console.log(`  p95: ${stats.p95ResponseTime}ms`)
  console.log(`  p99: ${stats.p99ResponseTime}ms`)
  
  if (metrics.errors.length > 0) {
    console.log('\n❌ Errors:')
    const errorSummary = {}
    metrics.errors.forEach(err => {
      errorSummary[err.message] = (errorSummary[err.message] || 0) + 1
    })
    Object.entries(errorSummary).forEach(([msg, count]) => {
      console.log(`  ${count}x ${msg}`)
    })
  }
  
  console.log('\n' + '='.repeat(60))
  
  // Performance assessment
  console.log('\n📈 Performance Assessment:')
  
  const avgTime = parseFloat(stats.avgResponseTime)
  const successRate = parseFloat(stats.successRate)
  
  let assessment = []
  
  if (successRate >= 99) {
    assessment.push('✅ Excellent reliability')
  } else if (successRate >= 95) {
    assessment.push('⚠️ Good reliability, some failures')
  } else {
    assessment.push('🔴 Poor reliability, many failures')
  }
  
  if (avgTime < 2000) {
    assessment.push('✅ Excellent response time (< 2s)')
  } else if (avgTime < 5000) {
    assessment.push('⚠️ Acceptable response time (2-5s)')
  } else {
    assessment.push('🔴 Slow response time (> 5s)')
  }
  
  if (stats.rateLimitedRequests === 0) {
    assessment.push('✅ No rate limiting triggered')
  } else {
    const rateLimitPercent = ((stats.rateLimitedRequests / stats.totalRequests) * 100).toFixed(1)
    assessment.push(`⚠️ Rate limiting: ${stats.rateLimitedRequests} requests (${rateLimitPercent}%)`)
  }
  
  assessment.forEach(line => console.log(`  ${line}`))
  
  console.log('\n' + '='.repeat(60))
  
  // Recommendations
  console.log('\n💡 Recommendations:')
  
  if (avgTime > 5000) {
    console.log('  • Consider optimizing Gemini API calls')
    console.log('  • Implement response caching for common queries')
    console.log('  • Consider upgrading to Gemini Pro for better performance')
  }
  
  if (stats.rateLimitedRequests > 0) {
    console.log('  • Rate limit is working as expected')
    console.log('  • Consider adjusting limit based on real usage patterns')
  }
  
  if (successRate < 95) {
    console.log('  • Investigate error logs for root cause')
    console.log('  • Implement circuit breaker pattern')
    console.log('  • Add request retry logic with exponential backoff')
  }
  
  console.log('\n')
}

/**
 * Main test runner
 */
async function runLoadTest() {
  console.log('🚀 Starting Load Test...\n')
  console.log(`Configuration:`)
  console.log(`  Concurrent Users: ${TEST_CONFIG.concurrentUsers}`)
  console.log(`  Messages per User: ${TEST_CONFIG.messagesPerUser}`)
  console.log(`  Message Delay: ${TEST_CONFIG.messageDelay}ms`)
  console.log(`  API URL: ${API_BASE_URL}`)
  console.log(`  Persona: ${TEST_CONFIG.personaId}\n`)
  
  // Verify environment
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing required environment variables!')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  metrics.startTime = Date.now()
  
  // Run concurrent users
  const userPromises = []
  for (let i = 1; i <= TEST_CONFIG.concurrentUsers; i++) {
    userPromises.push(simulateUser(i))
  }
  
  console.log(`\n⏳ Running ${TEST_CONFIG.concurrentUsers} concurrent users...\n`)
  
  await Promise.all(userPromises)
  
  metrics.endTime = Date.now()
  
  // Calculate and print results
  const stats = calculateStats()
  printResults(stats)
}

// Run the test
runLoadTest()
  .then(() => {
    console.log('✅ Load test completed!\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Load test failed:', error)
    process.exit(1)
  })
