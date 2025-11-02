# Google Authentication Troubleshooting Guide

## Current Issue
Error: `"Unsupported provider: provider is not enabled"`

This means Google OAuth is not properly enabled in Supabase.

## Step-by-Step Fix

### 1. Double-Check Supabase Configuration

1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/auth/providers

2. Find **Google** in the providers list

3. Verify these settings:
   ```
   ✅ Google Provider must be ENABLED (toggle switch ON)

   Client ID (for OAuth):
   729425456467-g254fun3shqr3q57pnbptnovklf0a4et.apps.googleusercontent.com

   Client Secret (for OAuth):
   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
   ```

4. **IMPORTANT**: Click the **"Save"** button at the bottom of the page
   - Just enabling the toggle is not enough
   - You must click Save for changes to persist

5. Wait 30 seconds for changes to propagate

### 2. Verify in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click on your OAuth 2.0 Client ID: `729425456467-g254fun3shqr3q57pnbptnovklf0a4et`

3. Under **Authorized redirect URIs**, you MUST have this exact URL:
   ```
   https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/callback
   ```

4. Click **Save**

### 3. Common Mistakes

❌ **Don't do this:**
- Only toggling the switch without clicking Save
- Using the wrong project in Supabase dashboard
- Forgetting to add the Supabase callback URL to Google Console
- Having typos in Client ID or Secret

✅ **Do this:**
- Enable the toggle AND click Save
- Double-check you're in the correct Supabase project
- Verify the redirect URI is EXACTLY as shown above (no trailing slash)
- Copy-paste credentials to avoid typos

### 4. Test After Configuration

After saving in Supabase:

1. **Wait 30 seconds** for changes to propagate

2. **Clear your browser cache** or open an incognito window

3. Navigate to: http://localhost:3002/auth/signin

4. Click "Sign in with Google"

5. You should be redirected to Google's sign-in page

### 5. If Still Not Working

**Check Supabase Provider Status via API:**

```bash
curl https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/settings \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTI4MDYsImV4cCI6MjA3NjQ2ODgwNn0.WdMCf2Ce161lXR8JaYtYxB9cms3YegNIv7reoWoxNzg"
```

Look for `"external_google_enabled": true` in the response.

If it shows `false`, the provider is not enabled.

### 6. Screenshot Verification

When properly configured, your Supabase Google provider settings should look like:

```
┌─────────────────────────────────────────┐
│ Google                           ⚪ ON   │
├─────────────────────────────────────────┤
│ Enable Sign in with Google              │
│                                         │
│ Client ID (for OAuth)                   │
│ 729425456467-g254fun3shqr3q57pnbp...   │
│                                         │
│ Client Secret (for OAuth)               │
│ ••••••••••••••••••••••••••••••••       │
│                                         │
│ [Additional Settings ▼]                 │
│                                         │
│              [Save]                     │
└─────────────────────────────────────────┘
```

### 7. Alternative: Manual Configuration Check

If the dashboard is not saving, try these steps:

1. **Disable** Google provider
2. Click **Save**
3. Wait 10 seconds
4. **Enable** Google provider again
5. Re-enter Client ID and Secret
6. Click **Save**
7. Wait 30 seconds
8. Test again

### 8. Verify Environment Variables

Make sure your local `.env.local` has:

```env
GOOGLE_CLIENT_ID=729425456467-g254fun3shqr3q57pnbptnovklf0a4et.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

**Then restart your dev server:**
```bash
# Kill existing server
lsof -ti:3002 | xargs kill -9

# Start fresh
npm run dev
```

## Success Indicators

When properly configured:
- ✅ No error messages when clicking "Sign in with Google"
- ✅ Redirects to `accounts.google.com` sign-in page
- ✅ After Google sign-in, redirects back to your app
- ✅ User is authenticated in your Esperit.AI app

## Need Help?

If you've followed all steps and it still doesn't work:

1. Check Supabase status: https://status.supabase.com/
2. Review Supabase logs in Dashboard → Logs
3. Check browser console for detailed error messages
