# Supabase Redirect URL Configuration for ai-spirit.in

## Issue Fixed
Updated `NEXT_PUBLIC_APP_URL` environment variable in Vercel from `esperit-ai.vercel.app` to `ai-spirit.in` to prevent URL changes during authentication.

## Required: Update Supabase Redirect URLs

To complete the fix, you need to add the custom domain to Supabase's allowed redirect URLs:

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg

2. **Navigate to Authentication Settings**
   - Click "Authentication" in the left sidebar
   - Click "URL Configuration"

3. **Add Site URL**
   - Set Site URL to: `https://ai-spirit.in`

4. **Add Redirect URLs**
   Add these URLs to the "Redirect URLs" section:
   ```
   https://ai-spirit.in/auth/callback
   https://ai-spirit.in/**
   https://esperit-ai.vercel.app/auth/callback
   https://esperit-ai.vercel.app/**
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

   **Note**: Keep both ai-spirit.in and esperit-ai.vercel.app to ensure the app works on both domains.

5. **Update Google OAuth Redirect URIs** (if using Google Sign-In)
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select your OAuth 2.0 Client ID
   - Under "Authorized redirect URIs", add:
     ```
     https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/callback
     ```
   - This is your Supabase callback URL (already should be configured)

6. **Save Changes**
   - Click "Save" in Supabase dashboard

## Environment Variables Updated

- **NEXT_PUBLIC_APP_URL**: Now set to `https://ai-spirit.in` in Vercel production

## What This Fixes

- Users signing in at ai-spirit.in will now stay on ai-spirit.in after authentication
- URLs like ai-spirit.in/personas will remain unchanged after sign-in
- No more automatic redirect to esperit-ai.vercel.app domain

## Testing

After updating Supabase settings and redeploying:

1. Visit https://ai-spirit.in
2. Click "Sign In"
3. Sign in with Google
4. Verify the URL stays as `https://ai-spirit.in/personas` (not vercel.app)

## Deployment

The application has been redeployed with the updated environment variable. The changes will take effect immediately after updating Supabase redirect URLs.
