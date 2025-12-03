# Vercel Deployment Fix Guide

## Issue Identified
The Vercel deployment is showing an **older version** of the site without the new Razorpay pricing features.

## What Was Done

### ✅ Code Changes Pushed
- Latest commit: `d38dd66` - Complete Razorpay payment integration
- All pricing features committed and pushed to GitHub
- Build tested locally and passes successfully

### ✅ Deployment Triggered
- Created trigger commit to force Vercel redeploy
- Vercel should now be building the latest version

## Verify Deployment Progress

### 1. Check Vercel Dashboard
Visit: https://vercel.com/dashboard

Look for:
- Latest deployment status
- Build logs for errors
- Environment variables configuration

### 2. Check Build Logs
If deployment fails, look for:
- ❌ Missing environment variables
- ❌ Module not found errors
- ❌ Build timeouts

## Required Environment Variables in Vercel

Make sure these are set in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://exdjsvknudvfkabnifrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTI4MDYsImV4cCI6MjA3NjQ2ODgwNn0.1y7gUdkNObsMDiiFinPOEnyxJV0Ikb8oeRGD8gJgSDA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg5MjgwNiwiZXhwIjoyMDc2NDY4ODA2fQ.1y7gUdkNObsMDiiFinPOEnyxJV0Ikb8oeRGD8gJgSDA

# Razorpay (Required for Payments)
RAZORPAY_KEY_ID=rzp_live_RnCOjpYVSDEHhT
RAZORPAY_KEY_SECRET=fZUaV0GlcApszlOHVrJi3UVO
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RnCOjpYVSDEHhT
RAZORPAY_PLAN_ID=plan_RnD6BgUMt5qDBv
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# AI APIs (Required)
GEMINI_API_KEY=AIzaSyCt65UaAtDpwP5P6sKfmbttXAoqQLw9d_0
GROQ_API_KEY=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
```

## How to Add/Update Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: **AI-Spirit** or **esperit**
3. Go to: Settings → Environment Variables
4. For each variable:
   - Click "Add New"
   - Enter Variable Name
   - Enter Value
   - Select environments: Production, Preview, Development
   - Click "Save"
5. After adding all variables, redeploy:
   - Go to Deployments tab
   - Click the three dots (⋯) on latest deployment
   - Click "Redeploy"

## Common Deployment Issues

### Issue: "Module not found: Can't resolve 'razorpay'"
**Solution:** The `razorpay` package is already in package.json, Vercel will install it automatically.

### Issue: "Missing environment variable"
**Solution:** Add all variables listed above in Vercel Dashboard.

### Issue: "Build timeout"
**Solution:**
- Reduce build size by removing unused dependencies
- Use Vercel Pro plan for longer build times
- Check for infinite loops in components

### Issue: "Old version still showing"
**Solution:**
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check Vercel deployment status
3. Verify correct branch is deployed (should be `main`)
4. Force redeploy from Vercel dashboard

## Expected Deployment Results

After successful deployment, you should see:

### Homepage Changes:
✅ "✨ Pricing" link in header navigation
✅ "Choose Your Experience" section with Free vs Premium cards
✅ "Pricing" link in footer

### New Pages:
✅ `/pricing` - Beautiful pricing page with Razorpay integration

### API Routes:
✅ `/api/razorpay/create-subscription`
✅ `/api/razorpay/verify-payment`
✅ `/api/razorpay/webhook`
✅ `/api/user/subscription-status`

## Verify Deployment Success

### Test 1: Check Homepage
```bash
curl -sL "https://ai-spirit.in" | grep -i "pricing"
```
Should return multiple matches with "Pricing" text.

### Test 2: Check Pricing Page
```bash
curl -s "https://ai-spirit.in/pricing" -o /dev/null -w "HTTP Status: %{http_code}\n"
```
Should return: `HTTP Status: 200`

### Test 3: Check API Endpoint
```bash
curl -s "https://ai-spirit.in/api/razorpay/create-subscription" -X POST
```
Should return JSON error (not 404), indicating endpoint exists.

## Timeline

- **Now:** Deployment triggered
- **5-10 minutes:** Build should complete
- **15 minutes:** DNS/CDN propagation
- **30 minutes:** Should be fully live

## If Deployment Still Fails

### Option 1: Manual Vercel CLI Deploy
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from local
vercel --prod
```

### Option 2: Check GitHub Integration
- Ensure Vercel is connected to your GitHub repo
- Check if auto-deploy is enabled
- Verify the correct branch (main) is being deployed

### Option 3: Check Build Logs
1. Go to Vercel Dashboard
2. Click on the failed deployment
3. Read the build logs carefully
4. Look for specific error messages
5. Fix those errors and push again

## Current Status

🔄 **Deployment Triggered** - Waiting for Vercel to build and deploy

Check status at: https://vercel.com/dashboard

## Next Steps After Deployment Success

1. ✅ Test pricing page: https://ai-spirit.in/pricing
2. ✅ Test payment flow with Razorpay test card
3. ✅ Setup database tables (see RAZORPAY-SETUP-GUIDE.md)
4. ✅ Configure Razorpay webhook
5. ✅ Test end-to-end payment

---

**Last Updated:** December 4, 2025
**Deployment Triggered At:** Just now
**Expected Completion:** 5-10 minutes
