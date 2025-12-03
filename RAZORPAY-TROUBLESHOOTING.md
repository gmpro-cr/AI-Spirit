# Razorpay Checkout Troubleshooting Guide

## Issue: "Get Premium Access" Button Not Opening Razorpay Window

### ✅ Fixes Applied

**Problem 1: Script Loading Timing**
- **Before:** Script loaded with `lazyOnload` strategy - might not be ready when button clicked
- **After:** Changed to `beforeInteractive` - ensures script loads before page interaction
- **Status:** ✅ Fixed

**Problem 2: No Error Handling**
- **Before:** Silent failures if Razorpay not loaded
- **After:** Added check for `window.Razorpay` with user-friendly error message
- **Status:** ✅ Fixed

**Problem 3: No Debugging Info**
- **Before:** No console logs to diagnose issues
- **After:** Added comprehensive logging at each step
- **Status:** ✅ Fixed

---

## 🔍 How to Debug Payment Issues

### Step 1: Open Browser Console
1. Visit: https://ai-spirit.in/pricing
2. Open Developer Tools:
   - **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox:** Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari:** Enable Developer Menu in Preferences, then `Cmd+Option+C`
3. Go to **Console** tab

### Step 2: Look for These Log Messages

**When page loads:**
```
✅ Razorpay script loaded
```

**When you click "Get Premium Access":**
```
✅ handleSubscribe called { user: true, userProfile: true }
✅ Creating subscription for user: [user-id]
✅ Subscription creation response status: 200
✅ Subscription creation data: { success: true, ... }
✅ Opening Razorpay with options: { ... }
```

**If Razorpay window opens successfully:**
```
✅ Payment modal shows up
```

**If Razorpay window dismissed:**
```
Payment modal dismissed
```

### Step 3: Check for Errors

**❌ Common Errors and Solutions:**

#### Error: "Razorpay script not loaded"
**Cause:** Script failed to load or blocked by ad-blocker
**Solution:**
1. Disable ad-blocker for ai-spirit.in
2. Check internet connection
3. Try different browser
4. Wait a few seconds and try again

#### Error: "Failed to create subscription"
**Possible Causes:**
1. Database tables not created
2. Missing environment variables
3. Invalid Razorpay credentials

**Solution:**
1. Check console for specific error message
2. Verify database tables exist (see RAZORPAY-SETUP-GUIDE.md Step 1)
3. Verify environment variables in Vercel dashboard

#### Error: "Missing payment details" or "Invalid payment signature"
**Cause:** API endpoint issue or missing parameters
**Solution:**
1. Check console logs for API response
2. Verify all environment variables are set
3. Check Razorpay dashboard for API credentials

#### Error: Network request failed
**Cause:** API endpoint not accessible
**Solution:**
1. Check if user is logged in
2. Verify API endpoint is deployed
3. Check browser network tab for 404/500 errors

---

## 🧪 Testing Steps

### Quick Test (Without Payment)

1. **Visit pricing page:**
   ```
   https://ai-spirit.in/pricing
   ```

2. **Open browser console (F12)**

3. **Click "Get Premium Access"**

4. **Check console output:**
   - Should see "handleSubscribe called"
   - Should see "Creating subscription for user"
   - Should see "Opening Razorpay with options"
   - **Razorpay modal should appear**

5. **If modal appears:** ✅ Integration working!

6. **If modal doesn't appear:** Check error messages in console

### Full Payment Test (Test Mode)

**Prerequisites:**
- ✅ Logged into AI-Spirit
- ✅ Database tables created
- ✅ Using Razorpay TEST credentials

**Steps:**

1. Click "Get Premium Access"
2. Razorpay modal opens
3. Enter test card details:
   ```
   Card: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   Name: Test User
   ```
4. Click "Pay ₹499"
5. Console shows "Payment response"
6. Console shows "Verification response"
7. Alert shows "🎉 Welcome to Premium!"
8. Redirected to dashboard

---

## 🔐 Database Setup (CRITICAL)

The payment flow **will fail** if database tables don't exist.

### Check if Tables Exist

Run this in Supabase SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('subscriptions', 'payments');
```

**Expected Result:**
```
subscriptions
payments
```

**If empty:** Tables don't exist. See next section.

### Create Tables

1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql/new

2. Copy SQL from: `supabase/migrations/create_subscriptions_tables.sql`

3. Paste and click "Run"

4. Verify with query above

---

## 🌐 Environment Variables Checklist

Verify these are set in Vercel Dashboard → Settings → Environment Variables:

**Critical for Payment:**
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (exposed to browser)
- [ ] `RAZORPAY_PLAN_ID`

**Critical for Database:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Optional (for webhook):**
- [ ] `RAZORPAY_WEBHOOK_SECRET`

---

## 📊 Debugging Checklist

Use this checklist to systematically debug payment issues:

### Browser Check
- [ ] Ad-blocker disabled for ai-spirit.in
- [ ] JavaScript enabled
- [ ] Cookies enabled
- [ ] Console shows "Razorpay script loaded"

### Authentication Check
- [ ] User is logged in
- [ ] Can see user email in pricing page
- [ ] Session is active (not expired)

### API Check
- [ ] `/api/razorpay/create-subscription` returns 200
- [ ] Response has `success: true`
- [ ] Response has `subscription.id`
- [ ] Response has `subscription.razorpay_key`

### Razorpay Check
- [ ] `window.Razorpay` is defined (check in console: `typeof window.Razorpay`)
- [ ] Razorpay modal appears
- [ ] Can enter card details
- [ ] Can click "Pay" button

### Database Check
- [ ] Tables `subscriptions` and `payments` exist
- [ ] RLS policies are set up
- [ ] Service role key has permission

---

## 🚨 Common Issues & Quick Fixes

### Issue: Nothing happens when clicking button
**Quick Fix:**
1. Check console for errors
2. Refresh page and wait 5 seconds
3. Try again

### Issue: "Payment system is loading" alert
**Quick Fix:**
1. Wait 10 seconds
2. Refresh page
3. Try again
4. If persists, check ad-blocker

### Issue: "Failed to create subscription" alert
**Quick Fix:**
1. Check console for specific error
2. Verify you're logged in
3. Check if database tables exist
4. Contact support if issue persists

### Issue: Modal opens but payment fails
**Quick Fix:**
1. Use correct test card: 4111 1111 1111 1111
2. Check Razorpay dashboard for test mode
3. Verify plan_id is correct
4. Check webhook is set up

---

## 📱 Testing on Different Devices

### Desktop Browsers
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Mobile Browsers
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Firefox Mobile

**Note:** Razorpay modal is fully responsive and works on all devices.

---

## 🆘 Still Having Issues?

### Collect This Information:

1. **Browser Console Output** (screenshot or copy/paste)
2. **Network Tab** (filter for "razorpay" and "create-subscription")
3. **User Status** (logged in? premium already?)
4. **Device/Browser** (Chrome 120 on Windows, etc.)
5. **Error Messages** (exact text from alerts/console)

### Check These Resources:

1. **Console logs** - Most issues show error messages
2. **Network tab** - See if API calls are failing
3. **Razorpay Dashboard** - Check API credentials and test mode
4. **Supabase Dashboard** - Verify database tables exist

### Contact Support:

If none of the above helps:
- Email: support@ai-spirit.in
- Include console logs and error messages
- Specify browser and device

---

## ✅ Success Indicators

You'll know payment is working when:

1. ✅ Razorpay modal opens immediately after clicking button
2. ✅ Can enter card details
3. ✅ Payment processes successfully
4. ✅ See success alert
5. ✅ Redirected to dashboard
6. ✅ Subscription visible in Razorpay dashboard
7. ✅ Record in Supabase `subscriptions` table
8. ✅ Record in Supabase `payments` table

---

**Last Updated:** December 4, 2025
**Status:** Fixes deployed, awaiting verification
