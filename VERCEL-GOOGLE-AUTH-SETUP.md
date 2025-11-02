# Fix Google Sign In for Vercel Production

## Problem
- Sign In redirects to localhost instead of production URL
- Google OAuth not configured for Vercel deployment

## Solution: Update Google Cloud Console

### Step 1: Open Google Cloud Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `729425456467-g254fun3shqr3q57pnbptnovklf0a4et.apps.googleusercontent.com`
3. Click to edit it

### Step 2: Add Production URLs

#### Authorized JavaScript origins
Add these URLs (keep existing localhost ones):
```
https://esperit-ai.vercel.app
https://exdjsvknudvfkabnifrg.supabase.co
```

#### Authorized redirect URIs
Add these URLs (keep existing localhost ones):
```
https://esperit-ai.vercel.app/auth/callback
https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/callback
```

### Step 3: Save Changes
Click "Save" at the bottom of the form

### Step 4: Update Supabase URL Allowlist (if needed)
1. Go to https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg
2. Navigate to Authentication → URL Configuration
3. Add to "Redirect URLs":
   ```
   https://esperit-ai.vercel.app/auth/callback
   ```
4. Add to "Site URL":
   ```
   https://esperit-ai.vercel.app
   ```

## Verification
After updating:
1. Open https://esperit-ai.vercel.app/auth/signin
2. Click "Sign in with Google"
3. Should redirect to Google login (not localhost)
4. After login, should redirect back to https://esperit-ai.vercel.app/personas

## Current Environment Variables on Vercel
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ GEMINI_API_KEY
✅ NEXT_PUBLIC_APP_URL (set to https://esperit-ai.vercel.app)
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET

## Notes
- Keep localhost URLs for local development
- Google OAuth supports multiple redirect URIs
- Changes to Google OAuth take effect immediately
- No code changes needed after updating Google settings
