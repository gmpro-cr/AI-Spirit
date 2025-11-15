# Quick Reference Guide - AI-Spirit Production Features

## 🚀 Quick Start Commands

```bash
# Development
npm run dev                  # Start development server

# Testing
npm run load-test           # Test performance and capacity

# Maintenance
npm run backup              # Backup database
npm run cleanup             # Preview database cleanup (dry run)
npm run cleanup:execute     # Execute database cleanup

# Deployment
npm run build               # Build for production
npm run start               # Start production server
```

---

## 🔍 Monitoring Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

**Response**:
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy", "responseTime": 45 },
    "geminiAPI": { "status": "healthy", "responseTime": 234 },
    "memory": { "status": "healthy", "usage": { "percentUsed": "45%" }}
  }
}
```

### Cache Statistics (Dev Only)
```bash
curl http://localhost:3000/api/admin/cache-stats
```

**Response**:
```json
{
  "cache": {
    "size": 127,
    "hits": 342,
    "misses": 158,
    "hitRate": "68.40%",
    "estimatedSavings": "$0.0256"
  }
}
```

### Cost Statistics (Dev Only)
```bash
curl http://localhost:3000/api/admin/cost-stats
```

---

## 👤 User Data Management (GDPR)

### Export User Data
```javascript
// Client-side request
const response = await fetch('/api/user/export', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})

const data = await response.json()
console.log(data) // User's complete data export
```

### Download User Data
```javascript
// Download as file
window.location.href = '/api/user/export?format=download'
```

### Delete User Account
```javascript
const response = await fetch('/api/user/delete-account', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({
    confirmation: 'DELETE MY ACCOUNT'
  })
})

const result = await response.json()
console.log(result) // Deletion report
```

---

## 🗄️ Database Management

### Manual Backup
```bash
# Create backup
npm run backup

# Backup files stored in: backups/backup-YYYY-MM-DD.sql
# Automatically keeps last 7 backups
```

### Database Cleanup
```bash
# Preview what will be deleted (dry run)
npm run cleanup

# Execute cleanup (actually delete)
npm run cleanup:execute
```

**Cleanup Rules**:
- Guest conversations: Deleted after 7 days
- Inactive user conversations: Deleted after 90 days
- Orphaned messages: Deleted immediately

---

## 🧪 Load Testing

### Run Load Test
```bash
npm run load-test
```

**Configuration** (in `scripts/load-test.js`):
```javascript
const TEST_CONFIG = {
  concurrentUsers: 10,        // Number of simulated users
  messagesPerUser: 5,         // Messages each user sends
  messageDelay: 1000,         // Delay between messages (ms)
  personaId: 'elon-musk',    // Persona to test
}
```

**Output Example**:
```
📊 Test Configuration:
  Concurrent Users: 10
  Messages per User: 5
  Total Expected Requests: 50

⏱️ Performance Metrics:
  Test Duration: 45.23s
  Total Requests: 50
  Successful: 48 (96.00%)
  Failed: 2
  Rate Limited: 0
  Requests/Second: 1.11

🚀 Response Times:
  Average: 2134.56ms
  p50 (Median): 1987.23ms
  p95: 3456.78ms
  p99: 4123.45ms
```

---

## 🔌 Connection Pooling

### Use Pooled Client (Recommended)
```javascript
// In API routes
import { supabasePooled as supabase } from '@/lib/supabase-pooler'

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
  
  res.json(data)
}
```

### Execute with Retry
```javascript
import { executeWithRetry } from '@/lib/supabase-pooler'

const data = await executeWithRetry(async () => {
  return await supabase.from('users').select('*')
})
```

---

## 💾 Response Caching

### Use Cache in API Routes
```javascript
import { getCachedResponse } from '@/lib/response-cache'

const response = await getCachedResponse(
  personaId,
  message,
  conversationHistory,
  async () => {
    // This function only runs if not cached
    return await generatePersonaResponse(personaId, messageHistory)
  }
)

if (response.fromCache) {
  console.log('Cache hit! Saved an API call')
}
```

### Clear Cache
```javascript
import { clearCache } from '@/lib/response-cache'

clearCache() // Clears all cached responses
```

---

## 🛡️ Content Moderation

### Moderate User Input
```javascript
import { moderateContent, sanitizeForDisplay } from '@/lib/moderation'

// Check if content is appropriate
const result = moderateContent(userMessage)

if (result.blocked) {
  return res.status(400).json({
    error: 'Message blocked',
    reason: result.reason // e.g., "inappropriate_language", "pii_detected_email"
  })
}

// Sanitize for display (prevent XSS)
const safeHTML = sanitizeForDisplay(userMessage)
```

**Moderation Checks**:
1. Empty/too long messages
2. Profanity
3. PII (SSN, credit cards, phone, email)
4. Prompt injection attempts
5. Spam (repeated characters)
6. Excessive URLs
7. Excessive caps (shouting)

---

## 📊 Cost Tracking

### Log API Call
```javascript
import { logApiCall, checkCostThreshold } from '@/lib/cost-tracking'

// After Gemini API call
logApiCall({
  conversationId,
  userId: session?.user?.id || 'guest',
  input: messageHistory,
  output: response,
  inputTokens: result.metadata.inputTokens,
  outputTokens: result.metadata.outputTokens,
})

// Check if budget exceeded
const costCheck = checkCostThreshold(15) // $15 daily budget

if (costCheck.exceeded) {
  console.warn('Daily budget exceeded!', {
    current: costCheck.currentCost,
    budget: costCheck.budget,
  })
}
```

---

## ⚡ Rate Limiting

### Rate Limit Check (Already Implemented)
```javascript
import { chatRateLimiter, getClientIdentifier } from '@/lib/rate-limit'

const clientId = getClientIdentifier(req, session)
const rateLimitResult = chatRateLimiter.check(clientId)

if (!rateLimitResult.allowed) {
  return res.status(429).json({
    error: 'Too many requests',
    retryAfter: rateLimitResult.retryAfter
  })
}
```

**Limits**:
- Chat API: 10 requests per minute
- Per user (logged in) or IP (guest)

---

## 🔧 Environment Variables

### Required for New Features

```bash
# Existing (no changes needed)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
GEMINI_API_KEY=your-gemini-key

# New (optional but recommended)

# Database backups
SUPABASE_DB_PASSWORD=your-database-password

# Connection pooling (for production optimization)
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 📅 Maintenance Schedule

### Daily
```bash
# Check health
curl http://localhost:3000/api/health

# Check Sentry dashboard
# https://sentry.io

# Monitor costs (dev)
curl http://localhost:3000/api/admin/cost-stats
```

### Weekly
```bash
# Run database cleanup
npm run cleanup:execute

# Check cache performance
curl http://localhost:3000/api/admin/cache-stats
```

### Monthly
```bash
# Run load test
npm run load-test

# Create manual backup
npm run backup

# Update dependencies
npm update

# Security audit
npm audit
```

---

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check health endpoint
curl http://localhost:3000/api/health

# If database unhealthy, verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
```

### High API Costs
```bash
# Check cache hit rate
curl http://localhost:3000/api/admin/cache-stats

# Low hit rate (< 50%)? Increase cache size or TTL
# Edit lib/response-cache.js:
# maxSize: 500 → 1000
# ttl: 60 * 60 * 1000 → 2 * 60 * 60 * 1000
```

### Rate Limiting Too Aggressive
```bash
# Edit lib/rate-limit.js
# Change limit from 10 to 20:
export const chatRateLimiter = createRateLimiter({
  interval: 60 * 1000,
  limit: 20, // Was 10
})
```

### Database Storage Full
```bash
# Run cleanup immediately
npm run cleanup:execute

# For more aggressive cleanup, edit scripts/cleanup-database.js:
guestConversationRetentionDays: 7 → 3
userConversationRetentionDays: 90 → 30
```

---

## 📚 Documentation Links

| Topic | File |
|-------|------|
| All Issues Fixed | `ISSUES-RESOLVED-SUMMARY.md` |
| Production Deployment | `PRODUCTION-DEPLOYMENT-GUIDE.md` |
| Safety Audit | `SAFETY-RELIABILITY-AUDIT.md` |
| Free Tier Capacity | `FREE-TIER-CAPACITY-ANALYSIS.md` |
| Database Backups | `DATABASE-BACKUP-GUIDE.md` |
| Connection Pooling | `CONNECTION-POOLING-GUIDE.md` |
| Production Ready Summary | `PRODUCTION-READY-SUMMARY.md` |

---

## 🎯 Pre-Launch Checklist

- [ ] Run load test: `npm run load-test`
- [ ] Create backup: `npm run backup`
- [ ] Check health: `curl /api/health`
- [ ] Verify environment variables in Vercel
- [ ] Test GDPR endpoints (export, delete)
- [ ] Monitor Sentry for errors
- [ ] Check cache hit rate
- [ ] Review cost tracking dashboard

---

## 💡 Pro Tips

1. **Cache Hit Rate**: Aim for > 50% hit rate to maximize savings
2. **Database Cleanup**: Run weekly to prevent storage bloat
3. **Load Testing**: Run before any major changes
4. **Backups**: Automate with GitHub Actions (daily at 2 AM UTC)
5. **Health Checks**: Set up monitoring with UptimeRobot or Pingdom
6. **Cost Alerts**: Check daily until you understand usage patterns

---

**Last Updated**: 2025-01-15
**Quick Reference Version**: 1.0
