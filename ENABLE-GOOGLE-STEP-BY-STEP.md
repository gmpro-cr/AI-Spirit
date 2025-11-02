# Step-by-Step: Enable Google OAuth in Supabase

## Current Status (from API)
```json
"google": false  ❌ NOT ENABLED
```

## Exact Steps to Enable

### Step 1: Open the Correct Page

Click this exact link:
```
https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/auth/providers
```

### Step 2: Find Google Provider

Scroll down the page until you see a section that looks like this:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Providers                                          │
│                                                     │
│  Configure third-party providers                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Email                                     ⚪ ON    │
│  Phone                                     ⚪ OFF   │
│  ...                                                │
│  Google                                    ⚪ OFF   │  ← FIND THIS
│  ...                                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Step 3: Click on "Google"

Click anywhere on the Google row to expand it. It will show a form like this:

```
┌─────────────────────────────────────────────────────┐
│  Google                                    ⚪ OFF   │
│  ▼                                                  │
│                                                     │
│  Enable Sign in with Google                         │
│  ┌──────────────────────────────────────────────┐  │
│  │                              ⚪ OFF → ON      │  │  ← TOGGLE THIS
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Client ID (for OAuth)                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ 729425456467-g254fun3shqr3q57pnbptnovklf... │  │  ← PASTE THIS
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Client Secret (for OAuth)                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ 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        │  │  ← PASTE THIS
│  └──────────────────────────────────────────────┘  │
│                                                     │
│              [Cancel]  [Save]                       │  ← CLICK SAVE!
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Step 4: Fill in the Details

1. **Toggle ON**: Click the toggle switch to turn it ON (it should turn green/blue)

2. **Client ID**: Paste this exactly:
   ```
   729425456467-g254fun3shqr3q57pnbptnovklf0a4et.apps.googleusercontent.com
   ```

3. **Client Secret**: Paste this exactly:
   ```
   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
   ```

### Step 5: SAVE THE CHANGES

**THIS IS THE MOST IMPORTANT STEP!**

1. Scroll down to the bottom of the Google provider section
2. Click the **"Save"** button (it might say "Update" or "Save Changes")
3. Wait for the success message
4. You should see a green notification saying "Successfully updated auth config" or similar

### Step 6: Verify It Worked

After clicking Save, wait 30 seconds, then run this command:

```bash
curl -s "https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/settings" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTI4MDYsImV4cCI6MjA3NjQ2ODgwNn0.WdMCf2Ce161lXR8JaYtYxB9cms3YegNIv7reoWoxNzg" \
  | python3 -m json.tool | grep "google"
```

**Expected output:**
```
"google": true,  ✅ ENABLED!
```

If it still shows `false`, the changes didn't save properly.

## Common Mistakes

### ❌ Mistake 1: Not Clicking Save
- Just enabling the toggle is NOT enough
- You MUST click the Save button

### ❌ Mistake 2: Wrong Project
- Make sure you're in project: `exdjsvknudvfkabnifrg`
- Check the URL contains this project reference

### ❌ Mistake 3: Browser Cache
- Try in an incognito/private window
- Or clear your browser cache

### ❌ Mistake 4: Not Waiting
- After saving, wait 30 seconds for changes to propagate
- Don't test immediately

## Alternative Method: Disable and Re-enable

If the above doesn't work, try this:

1. **Disable** Google provider completely
2. Click **Save**
3. Wait 10 seconds
4. **Enable** Google provider again
5. Re-enter Client ID and Secret
6. Click **Save**
7. Wait 30 seconds
8. Verify with the curl command above

## After It's Enabled

Once the API shows `"google": true`:

1. Restart your dev server:
   ```bash
   lsof -ti:3002 | xargs kill -9
   npm run dev
   ```

2. Clear browser cache or use incognito mode

3. Navigate to: http://localhost:3002/auth/signin

4. Click "Sign in with Google"

5. You should be redirected to Google's sign-in page ✅
