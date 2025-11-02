# Fix Production Authentication - Complete Guide

## Current Status
- ✅ Environment variables set on Vercel
- ✅ Code uses `process.env.NEXT_PUBLIC_APP_URL`
- ❌ Sign In redirects to localhost instead of production URL

## Root Cause
Supabase Auth configuration in the Supabase Dashboard has localhost URLs set as the Site URL and redirect URLs.

## Complete Fix - Step by Step

### Step 1: Update Supabase Dashboard Settings

1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/auth/url-configuration

2. **Site URL** - Change from `http://localhost:3000` to:
   ```
   https://esperit-ai.vercel.app
   ```

3. **Redirect URLs** - Add these (keep localhost for development):
   ```
   http://localhost:3000/**
   https://esperit-ai.vercel.app/**
   ```

4. Click **Save**

### Step 2: Update Google Cloud Console OAuth Settings

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click on your OAuth 2.0 Client ID: `729425456467-g254fun3shqr3q57pnbptnovklf0a4et`

3. **Authorized JavaScript origins** - Add:
   ```
   https://esperit-ai.vercel.app
   https://exdjsvknudvfkabnifrg.supabase.co
   ```

4. **Authorized redirect URIs** - Add:
   ```
   https://esperit-ai.vercel.app/auth/callback
   https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/callback
   ```

5. Click **Save**

### Step 3: Verify Environment Variables on Vercel

Run this command to check:
```bash
vercel env ls
```

Should show:
- ✅ NEXT_PUBLIC_APP_URL (https://esperit-ai.vercel.app)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ GEMINI_API_KEY

### Step 4: Test the Fix

1. Open: https://esperit-ai.vercel.app/auth/signin
2. Click "Sign in with Google"
3. Should redirect to Google (NOT localhost)
4. After Google login, should return to: https://esperit-ai.vercel.app/personas

## Why This Happens

The issue is that Supabase uses its **Site URL** setting as the default redirect URL when:
1. The `redirectTo` parameter is a relative path
2. No explicit full URL is provided

Even though the code has:
```javascript
redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/personas`}
```

If `NEXT_PUBLIC_APP_URL` is not properly loaded or Supabase's Site URL is set to localhost, it will redirect to localhost.

## Alternative: Hardcode Production URL (Quick Fix)

If the above doesn't work, you can temporarily hardcode the production URL in signin.js:

```javascript
// In pages/auth/signin.js, line 78
redirectTo="https://esperit-ai.vercel.app/personas"
```

But this will break local development, so use the dashboard approach instead.

## Debugging Checklist

- [ ] Supabase Site URL is `https://esperit-ai.vercel.app`
- [ ] Supabase Redirect URLs includes `https://esperit-ai.vercel.app/**`
- [ ] Google OAuth has production URLs in both origins and redirect URIs
- [ ] Vercel has all 7 environment variables set to Production environment
- [ ] Latest code is deployed on Vercel

## Support Links

- Supabase Auth Config: https://supabase.com/docs/guides/auth/redirect-urls
- Google OAuth Setup: https://developers.google.com/identity/protocols/oauth2
- Vercel Env Vars: https://vercel.com/docs/concepts/projects/environment-variables
