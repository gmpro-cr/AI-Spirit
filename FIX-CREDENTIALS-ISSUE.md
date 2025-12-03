# 🔥 Critical Issue: Razorpay Credentials Not Working in Production

## Problem Summary

✅ **Credentials work perfectly locally** - Created customer successfully  
✅ **Credentials work with direct curl** - Created customer `cust_RnGeABhxqWX7yo`  
❌ **Credentials fail in Vercel production** - "Authentication failed"  

## Root Cause

The environment variables in Vercel are NOT being read correctly by the application.

### Evidence:

1. **Local test with same credentials:** ✅ SUCCESS
   ```bash
   curl -u "rzp_live_RnCOjpYVSDEHhT:fZUaV0GlcApszlOHVrJi3UVO" \
     -X POST https://api.razorpay.com/v1/customers \
     -d '{"name":"Test","email":"test@example.com"}'
   
   Result: {"id":"cust_RnGeABhxqWX7yo",...}
   ```

2. **Production logs:** ❌ FAIL
   ```
   Razorpay customer creation error: {
     error: { description: 'Authentication failed', code: 'BAD_REQUEST_ERROR' }
   }
   ```

## Possible Causes

### 1. Environment Variables Not Available at Runtime
- Variables are set in Vercel dashboard
- But not being loaded into `process.env` at runtime
- Need to rebuild/redeploy after adding variables

### 2. Variable Names Mismatch
- Code looking for: `RAZORPAY_KEY_ID`
- Vercel has: `RAZORPAY_KEY_ID`
- Should match, but worth double-checking

### 3. Encoding Issues
- Maybe variables have extra spaces
- Or special characters are escaped differently
- Need to verify exact values

### 4. Build vs Runtime Variables
- `NEXT_PUBLIC_*` variables are built into the client bundle
- Server-side variables need to be available at runtime
- May need to restart serverless functions

## Solutions to Try

### Solution 1: Use Vercel Dashboard to Re-enter Manually

1. Go to: https://vercel.com/dashboard
2. Select **ai-spirit** project
3. Settings → Environment Variables
4. **DELETE** the existing Razorpay variables
5. **RE-ADD** them manually one by one:
   
   ```
   Name: RAZORPAY_KEY_ID
   Value: rzp_live_RnCOjpYVSDEHhT
   Environment: Production
   ```
   
   ```
   Name: RAZORPAY_KEY_SECRET
   Value: fZUaV0GlcApszlOHVrJi3UVO
   Environment: Production
   ```
   
   ```
   Name: NEXT_PUBLIC_RAZORPAY_KEY_ID  
   Value: rzp_live_RnCOjpYVSDEHhT
   Environment: Production
   ```

6. **Redeploy** from Vercel dashboard

### Solution 2: Use Test Mode Credentials Instead

Your current credentials are LIVE mode. Try using TEST mode to verify the setup:

1. Get TEST credentials from Razorpay Dashboard:
   - Should start with `rzp_test_`
   - Example: `rzp_test_1234567890abcd`

2. Replace in Vercel with test credentials

3. Test the payment flow

4. If TEST works but LIVE doesn't → issue with LIVE credentials

### Solution 3: Check Razorpay Account Status

1. Login to: https://dashboard.razorpay.com
2. Check if account is activated
3. Check if LIVE mode is enabled
4. Check if API access is enabled
5. Regenerate API keys if needed

### Solution 4: Add Credentials Directly in Code (Temporary Debug)

**WARNING: Only for debugging, remove after testing**

Edit `lib/razorpay.js`:
```javascript
export function getRazorpayInstance() {
    if (!razorpayInstance) {
        // TEMPORARY DEBUG - REMOVE AFTER TESTING
        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_RnCOjpYVSDEHhT'
        const keySecret = process.env.RAZORPAY_KEY_SECRET || 'fZUaV0GlcApszlOHVrJi3UVO'
        
        console.log('Razorpay credentials check:', {
            hasKeyId: !!process.env.RAZORPAY_KEY_ID,
            hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
            keyIdPreview: keyId.substring(0, 8) + '...',
            keySecretPreview: keySecret.substring(0, 4) + '...'
        })
        
        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        })
    }
    return razorpayInstance
}
```

This will:
- Use environment variables if available
- Fall back to hardcoded values if not
- Log what it's using
- Help identify if env vars are the issue

## Recommended Action

**Try Solution 1 first** (manual re-entry in Vercel dashboard):
1. It's the safest
2. Ensures no encoding issues
3. Forces a fresh deployment
4. Most likely to work

Then if that doesn't work, try Solution 4 (temporary hardcoded fallback) to confirm if it's an environment variable issue.

---

## What I'll Do Next

I recommend you:

1. **Go to Vercel Dashboard**
2. **Delete and re-add the 3 Razorpay variables manually**
3. **Trigger a new deployment**
4. **Test again**

If that still doesn't work, we can try the temporary hardcoded fallback to isolate whether it's:
- An environment variable issue (fallback will work)
- A credentials issue (fallback won't work either)

Let me know which approach you'd like to try!

