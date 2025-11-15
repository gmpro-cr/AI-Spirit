# Production Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:
- [ ] Vercel account
- [ ] Supabase project (upgrade to Pro tier recommended for 500+ users)
- [ ] Google Cloud account with Gemini API enabled
- [ ] Sentry account for error monitoring
- [ ] Domain name (optional but recommended)

---

## Step 1: Rotate All API Keys ⚠️ CRITICAL

**Why**: Your API keys may have been exposed during development.

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Delete the old key
4. Enable billing and set up budget alerts

### Supabase Keys
1. Go to Supabase Dashboard → Settings → API
2. Generate new service role key (if needed)
3. Anon key should be safe (public-facing)

### Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth 2.0 Client ID
3. Add production URLs to authorized redirect URIs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/api/auth/callback/google`

### Sentry DSN
1. Create account at [sentry.io](https://sentry.io/)
2. Create new project (Next.js)
3. Copy DSN from project settings

---

## Step 2: Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add the following variables for **Production** environment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key

# AI APIs
GEMINI_API_KEY=your_new_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Google OAuth (NEW credentials)
GOOGLE_CLIENT_ID=your_new_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_new_client_secret

# Email Services
RESEND_API_KEY=your_resend_key
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Error Monitoring (Sentry)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Node Environment
NODE_ENV=production
```

3. **IMPORTANT**: Mark sensitive keys as "Encrypted" in Vercel

---

## Step 3: Configure Supabase for Production

### Database Setup

1. **Verify Tables Exist**:
```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

2. **Run Migrations** (if needed):
```bash
# From your project directory
cd supabase
# Apply schema
psql "your_supabase_connection_string" < schema.sql
```

### Configure Row Level Security (RLS)

Verify RLS policies are enabled:
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Set Up Database Backups

1. Go to Supabase Dashboard → Database → Backups
2. Enable daily backups
3. Set retention period (7 days minimum)

### Connection Pooling

1. Use Supabase connection pooler for production
2. Connection string format:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:6543/postgres?pgbouncer=true
```

---

## Step 4: Set Up Google Cloud Billing Alerts

**CRITICAL**: Prevent unexpected API costs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Billing → Budgets & alerts
3. Create budget:
   - Name: "Gemini API Monthly Budget"
   - Amount: $500 (or your limit)
   - Alerts: 50%, 80%, 100%, 120%
4. Add email notifications

---

## Step 5: Configure Sentry Error Monitoring

1. Install Sentry wizard (already done):
```bash
npm install --save @sentry/nextjs
```

2. Sentry is configured in:
   - `sentry.client.config.js`
   - `sentry.server.config.js`
   - `sentry.edge.config.js`

3. Test Sentry in development:
```javascript
// Add to any page temporarily
import * as Sentry from '@sentry/nextjs'
Sentry.captureMessage('Test error')
```

4. Set up alerts in Sentry Dashboard:
   - Go to Alerts → Create Alert Rule
   - Set up email/Slack notifications

---

## Step 6: Deploy to Vercel

### Initial Deployment

1. **Connect Repository**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod
```

2. **Or use Vercel Dashboard**:
   - Go to vercel.com/new
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

### Configure Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## Step 7: Post-Deployment Checks

### ✅ Functionality Tests

- [ ] Homepage loads correctly
- [ ] User can sign in with Google
- [ ] User can browse personas
- [ ] User can send messages and receive responses
- [ ] Rate limiting works (try sending 11 messages quickly)
- [ ] Past chats load correctly
- [ ] Mobile UI works properly
- [ ] Privacy Policy and Terms pages accessible

### ✅ Performance Tests

- [ ] Run Lighthouse audit (target: 90+ performance)
- [ ] Check Time to First Byte (TTFB < 600ms)
- [ ] Test from multiple geographic locations
- [ ] Mobile performance acceptable

### ✅ Security Tests

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] API endpoints require authentication (where appropriate)
- [ ] Rate limiting prevents abuse
- [ ] CORS configured correctly
- [ ] No API keys exposed in client-side code

### ✅ Monitoring Setup

- [ ] Sentry receiving error reports
- [ ] Vercel Analytics enabled
- [ ] API cost tracking working (check logs)
- [ ] Supabase connection pool working

---

## Step 8: Set Up Monitoring Dashboards

### Vercel Analytics

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics
3. Enable Speed Insights

### Supabase Monitoring

1. Go to Supabase Dashboard → Database → Logs
2. Monitor query performance
3. Check connection count

### Cost Monitoring

Access cost stats at:
```
https://yourdomain.com/api/admin/cost-stats
```

(Only works in development by default - add authentication for production)

---

## Step 9: Create Incident Response Plan

### If Site Goes Down

1. Check Vercel deployment status
2. Check Supabase status page
3. Check error logs in Sentry
4. Roll back to previous deployment if needed:
```bash
vercel rollback
```

### If Costs Spike

1. Check `/api/admin/cost-stats` for usage
2. Temporarily reduce rate limits in `lib/rate-limit.js`
3. Investigate suspicious users/IPs
4. Consider adding additional rate limiting

### If Database Fills Up

1. Check Supabase Dashboard → Database → Usage
2. Archive old conversations if needed
3. Upgrade to larger tier if necessary

---

## Step 10: Gradual Rollout Strategy

### Week 1: Soft Launch (50 users)

- [ ] Invite beta testers
- [ ] Monitor error rates closely
- [ ] Check API costs daily
- [ ] Fix critical bugs

### Week 2: Limited Launch (200 users)

- [ ] Open to wider audience
- [ ] Monitor performance metrics
- [ ] Optimize slow queries
- [ ] Adjust rate limits if needed

### Week 3: Full Launch (500+ users)

- [ ] Remove user limits
- [ ] Monitor costs and scale resources
- [ ] Prepare for traffic spikes
- [ ] Have rollback plan ready

---

## Scaling Checklist (When Approaching Limits)

### Database (Supabase)
- [ ] Upgrade to Pro tier ($25/mo)
- [ ] Enable connection pooling
- [ ] Add database indexes
- [ ] Archive old data

### API Costs (Gemini)
- [ ] Review and optimize prompts
- [ ] Implement response caching
- [ ] Consider rate limits per user tier
- [ ] Switch to cheaper model for simple queries

### Hosting (Vercel)
- [ ] Upgrade to Pro tier ($20/mo) if needed
- [ ] Enable edge caching
- [ ] Optimize bundle size

---

## Maintenance Schedule

### Daily
- Check Sentry for new errors
- Monitor API costs
- Review Vercel logs for issues

### Weekly
- Review cost trends
- Check database size
- Update dependencies (security patches)

### Monthly
- Full security audit
- Performance optimization
- User feedback review
- Backup verification

---

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Sentry Support**: support@sentry.io
- **Google Cloud Support**: Cloud Console → Support

---

## Cost Optimization Tips

1. **Reduce Gemini API Costs**:
   - Trim system prompts
   - Limit conversation history to 10 messages (currently 20)
   - Cache common responses
   - Use shorter persona descriptions

2. **Reduce Database Costs**:
   - Archive conversations older than 90 days
   - Implement message cleanup for deleted accounts
   - Optimize indexes

3. **Reduce Hosting Costs**:
   - Enable static generation where possible
   - Use ISR (Incremental Static Regeneration)
   - Optimize images and assets

---

## Success Metrics to Track

- **User Engagement**: Daily active users, messages per user
- **Performance**: Average response time, error rate
- **Costs**: Daily API spend, cost per user
- **Growth**: New signups, retention rate

---

## Troubleshooting Common Issues

### "Too many requests" error
**Cause**: Rate limiting triggered
**Fix**: Wait 60 seconds or increase limit in `lib/rate-limit.js`

### Slow API responses
**Cause**: Gemini API latency or database queries
**Fix**:
- Check Gemini API status
- Review slow queries in Supabase
- Optimize conversation history loading

### Database connection errors
**Cause**: Connection pool exhausted
**Fix**:
- Enable Supabase connection pooler
- Reduce concurrent connections
- Upgrade Supabase tier

---

## Rollback Procedure

If critical issues occur after deployment:

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [DEPLOYMENT_URL]

# Or promote specific deployment
vercel promote [DEPLOYMENT_URL]
```

---

## Final Checklist Before Launch

- [ ] All API keys rotated
- [ ] Environment variables configured in Vercel
- [ ] Supabase Pro tier activated
- [ ] Google Cloud billing alerts set up
- [ ] Sentry error monitoring active
- [ ] Rate limiting tested
- [ ] Privacy Policy and Terms live
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Mobile UI tested
- [ ] Performance metrics acceptable (Lighthouse 90+)
- [ ] Backup and rollback procedures tested
- [ ] Team notified of launch
- [ ] Incident response plan ready

---

## Success! 🎉

Your app is now production-ready and deployed. Monitor closely for the first few days and be ready to make adjustments based on real user behavior.

**Next Steps**:
1. Share with initial users
2. Monitor error rates and costs
3. Gather feedback
4. Iterate and improve
