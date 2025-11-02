# Google Authentication Setup Guide

This guide will help you configure Google Sign-In for your Esperit.AI application.

## Prerequisites

- Google Cloud Project with OAuth 2.0 credentials
- Supabase project (already configured)
- Client ID: `1013425318997-ksj485qtm9s2rhuaf8glbe20ibhr8dao.apps.googleusercontent.com`
- Client Secret: `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`

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID: `1013425318997-ksj485qtm9s2rhuaf8glbe20ibhr8dao`
3. Under **Authorized redirect URIs**, add these two URLs:
   ```
   https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/callback
   http://localhost:3002/auth/callback
   ```
4. Click **Save**

## Step 2: Configure Supabase Authentication

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg)
2. Navigate to: **Authentication** → **Providers**
3. Find **Google** in the list and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Enter your Google OAuth credentials:
   - **Client ID**: `1013425318997-ksj485qtm9s2rhuaf8glbe20ibhr8dao.apps.googleusercontent.com`
   - **Client Secret**: `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`
6. Leave **Authorized Client IDs** empty (not needed for web apps)
7. Click **Save**

## Step 3: Verify Configuration

Your `.env.local` file has been updated with:
```env
GOOGLE_CLIENT_ID=1013425318997-ksj485qtm9s2rhuaf8glbe20ibhr8dao.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## Step 4: Test Google Sign-In

1. Restart your development server if it's running
2. Navigate to: http://localhost:3002/auth/signin
3. Click the **Sign in with Google** button
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to: http://localhost:3002/personas

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Ensure the redirect URI in Google Cloud Console exactly matches: `https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes
- Verify the OAuth client ID is correct

### Error: "Access blocked: This app's request is invalid"
- Check that Google OAuth consent screen is configured
- Ensure your email is added to test users if the app is in testing mode
- Verify the OAuth scopes include email and profile

### Google button not appearing
- Check browser console for errors
- Verify Supabase configuration is saved
- Restart the development server

## Quick Test Script

Run this command to verify your setup:
```bash
node scripts/configure-google-oauth.js
```

This will display all the configuration details and guide you through the setup.

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js + Supabase Auth Guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
