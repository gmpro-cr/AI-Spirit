# Google OAuth Setup - Display Name & Photo

## Changes Made

Updated `components/layout/SidePanel.jsx` to display:
- ✅ User's Google profile photo (if available)
- ✅ User's full name (instead of email)
- ✅ Fallback to initials if no photo
- ✅ Fallback to email if no name

## Supabase Configuration Required

To get name and photo from Google sign-in, ensure your Supabase Google provider is configured correctly:

### Step 1: Check Supabase Google OAuth Settings

1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/auth/providers
2. Find **Google** provider
3. Ensure these settings:

   **Scopes (Optional):**
   ```
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```

   The `userinfo.profile` scope is essential for getting name and photo!

### Step 2: Test

1. Sign in with Google
2. Check the sidebar - you should see:
   - Your Google profile photo
   - Your full name (e.g., "Gaurav Mahale")
   - Not your email

### Data Retrieved

When users sign in with Google, Supabase automatically stores in `user.user_metadata`:
- `avatar_url` - Google profile photo URL
- `full_name` - Full name from Google account
- `name` - Alternative name field
- `email` - Email address

### Fallback Logic

The code uses this priority:
1. **Photo**: `avatar_url` → initials
2. **Name**: `full_name` → `name` → `email`

