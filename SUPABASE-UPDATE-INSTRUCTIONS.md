# Supabase Redirect URLs Update - Complete Guide

## Issue
The authentication redirect was pointing to `esperit-ai.vercel.app` instead of `ai-spirit.in`. 

## What Was Fixed
✅ Updated Vercel environment variable `NEXT_PUBLIC_APP_URL` to `https://ai-spirit.in`
✅ Deployed new version to production

## What You Need to Do
Update Supabase redirect URLs to allow authentication from `ai-spirit.in` domain.

---

## Option 1: SQL Migration (Recommended - Fastest)

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the SQL**
   - Open the file: `supabase/migration-update-redirect-urls.sql`
   - Copy ALL the SQL content
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see a table showing:
     - SITE_URL: "https://ai-spirit.in"
     - URI_ALLOW_LIST: (list of redirect URLs)

### SQL Commands (if you prefer to see them here):

```sql
-- Update Site URL
UPDATE auth.config
SET value = '"https://ai-spirit.in"'
WHERE key = 'SITE_URL';

-- Update URI Allow List (Redirect URLs)
UPDATE auth.config
SET value = '"https://ai-spirit.in/auth/callback,https://ai-spirit.in/**,https://esperit-ai.vercel.app/auth/callback,https://esperit-ai.vercel.app/**,http://localhost:3000/auth/callback,http://localhost:3000/**"'
WHERE key = 'URI_ALLOW_LIST';

-- If the keys don't exist, insert them
INSERT INTO auth.config (key, value)
SELECT 'SITE_URL', '"https://ai-spirit.in"'
WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'SITE_URL');

INSERT INTO auth.config (key, value)
SELECT 'URI_ALLOW_LIST', '"https://ai-spirit.in/auth/callback,https://ai-spirit.in/**,https://esperit-ai.vercel.app/auth/callback,https://esperit-ai.vercel.app/**,http://localhost:3000/auth/callback,http://localhost:3000/**"'
WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'URI_ALLOW_LIST');

-- Verify the changes
SELECT key, value FROM auth.config WHERE key IN ('SITE_URL', 'URI_ALLOW_LIST');
```

---

## Option 2: Dashboard UI (Alternative)

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg

2. **Navigate to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "URL Configuration"

3. **Update Site URL**
   - Find "Site URL" field
   - Change to: `https://ai-spirit.in`

4. **Update Redirect URLs**
   - Find "Redirect URLs" section
   - Add each of these URLs (one per line):
     ```
     https://ai-spirit.in/auth/callback
     https://ai-spirit.in/**
     https://esperit-ai.vercel.app/auth/callback
     https://esperit-ai.vercel.app/**
     http://localhost:3000/auth/callback
     http://localhost:3000/**
     ```

5. **Save Changes**
   - Click "Save" button at the bottom

---

## Why We Keep Both Domains

The configuration includes both `ai-spirit.in` and `esperit-ai.vercel.app` to ensure:
- ✅ Production works on your custom domain
- ✅ Vercel preview deployments still work
- ✅ Local development works

---

## Testing After Update

1. Visit: **https://ai-spirit.in**
2. Click "Sign In"
3. Sign in with Google
4. **Expected Result**: URL stays as `https://ai-spirit.in/personas` ✅
5. **Not**: `https://esperit-ai.vercel.app/#`

---

## Verification

After running the SQL or updating via dashboard, you can verify by running this SQL:

```sql
SELECT key, value 
FROM auth.config 
WHERE key IN ('SITE_URL', 'URI_ALLOW_LIST');
```

You should see:
- **SITE_URL**: `"https://ai-spirit.in"`
- **URI_ALLOW_LIST**: Contains all the redirect URLs

---

## Files Created

- ✅ `supabase/migration-update-redirect-urls.sql` - SQL migration
- ✅ `scripts/update-supabase-redirects.js` - API script (requires Management API token)
- ✅ `scripts/run-supabase-migration.js` - Helper script
- ✅ This guide

---

## Need Help?

If you encounter any issues:
1. Make sure you're logged into the correct Supabase project
2. Verify the project ref is: `exdjsvknudvfkabnifrg`
3. Ensure you have admin access to the Supabase project

---

## Summary

**What's Done:**
- ✅ Vercel environment updated
- ✅ Application redeployed
- ✅ SQL migration file created

**What You Need to Do:**
- ⏳ Run SQL migration in Supabase SQL Editor (5 minutes)

After this one step, your authentication will work perfectly with `ai-spirit.in`! 🎉
