# CRITICAL FIX: Update Supabase Site URL

## The Problem
Your Supabase project's **Site URL** is currently set to `http://localhost:3000`, which is why all OAuth redirects go to localhost instead of your production site.

## The Solution (Takes 30 seconds)

### Quick Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "URL Configuration"
   - Or go directly to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/auth/url-configuration

3. **Update Site URL**
   - Find the field labeled "Site URL"
   - Change from: `http://localhost:3000`
   - Change to: `https://esperit-ai.vercel.app`

4. **Update Redirect URLs**
   - Find "Redirect URLs" section
   - Add: `https://esperit-ai.vercel.app/**`
   - Keep: `http://localhost:3000/**` (for local development)

5. **Click Save**

## What This Does

The Site URL tells Supabase where to redirect users after authentication. When it's set to localhost:
- ❌ Production users get redirected to localhost (broken)
- ❌ Mobile/external devices can't access localhost

When set to your Vercel URL:
- ✅ Production users get redirected to https://esperit-ai.vercel.app
- ✅ Works on all devices and networks

## After Updating

Test immediately:
1. Open: https://esperit-ai.vercel.app/auth/signin
2. Click "Sign in with Google"
3. Complete Google login
4. Should redirect to: https://esperit-ai.vercel.app/personas ✅

## For Local Development

To keep local development working:
1. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. Make sure `http://localhost:3000/**` is in Supabase Redirect URLs

## Screenshot Reference

The setting you're looking for looks like this:

```
┌─────────────────────────────────────────┐
│ Authentication                          │
│                                         │
│ URL Configuration                       │
│                                         │
│ Site URL                                │
│ ┌─────────────────────────────────────┐ │
│ │ https://esperit-ai.vercel.app       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Redirect URLs                           │
│ ┌─────────────────────────────────────┐ │
│ │ https://esperit-ai.vercel.app/**    │ │
│ │ http://localhost:3000/**            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│              [Save]                     │
└─────────────────────────────────────────┘
```

## This is THE Fix

This is the most important step. Without updating the Supabase Site URL:
- Google OAuth settings don't matter
- Environment variables don't matter
- Code changes don't matter

The Site URL in Supabase Dashboard controls where authentication redirects go.
