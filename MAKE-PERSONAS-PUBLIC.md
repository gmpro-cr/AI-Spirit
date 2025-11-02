# Make Custom Personas Public - Migration Guide

## What This Does

Changes custom personas from **private (owner-only)** to **public (visible to everyone)** while keeping edit permissions restricted to the creator.

### Before (Current):
- ❌ Custom personas only visible to the user who created them
- ❌ Other users/guests cannot see custom personas

### After (New):
- ✅ All custom personas visible to everyone (including guests)
- ✅ Everyone can chat with any custom persona
- ✅ Only the creator can edit/delete their custom personas
- ✅ Edit button only appears for personas you own

## Step 1: Run the Database Migration

### Option A: Supabase Dashboard (Recommended)

1. **Go to SQL Editor:**
   - https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql/new

2. **Copy and paste this SQL:**

```sql
-- Migration: Make custom personas publicly readable (but only editable by owner)

-- Update RLS policy to allow everyone to read all personas
DROP POLICY IF EXISTS "Allow read access to all personas" ON personas;
CREATE POLICY "Allow read access to all personas" ON personas
  FOR SELECT
  USING (true);  -- Allow all users (including guests) to see all personas
```

3. **Click "Run" or press Ctrl+Enter**

4. **Verify success:**
   - You should see: "Success. No rows returned"

### Option B: Using Script

```bash
# Not yet implemented - use Supabase Dashboard for now
```

## Step 2: Deploy Code Changes

The code changes have already been made:

### Files Updated:
1. **`pages/personas/index.js`** (line 45-59)
   - Changed from: Load only current user's personas
   - Changed to: Load ALL custom personas from database

2. **`components/personas/PersonaCard.jsx`** (line 3, 6, 55)
   - Added `useAuth` to check current user
   - Edit button only shows if `persona.user_id === user.id`

### To Deploy:
```bash
git add .
git commit -m "Make custom personas publicly visible"
git push
```

Vercel will auto-deploy in 1-2 minutes.

## How It Works After Migration

### Visibility Rules:
| User Type | Can See | Can Edit | Can Delete |
|-----------|---------|----------|------------|
| **Guest** | ✅ All personas (official + custom) | ❌ None | ❌ None |
| **Signed In User** | ✅ All personas (official + custom) | ✅ Own custom personas only | ✅ Own custom personas only |
| **Persona Creator** | ✅ All personas | ✅ Own custom personas | ✅ Own custom personas |

### Example Scenarios:

**Scenario 1: User A creates "Donald Trump" persona**
- ✅ User A can see, edit, and delete it
- ✅ User B can see and chat with it
- ❌ User B cannot edit or delete it
- ✅ Guests can see and chat with it
- ❌ Guests cannot edit or delete it

**Scenario 2: Guest creates persona in localStorage**
- ✅ Guest can see it on that browser
- ❌ Other users cannot see it (localStorage is local only)
- ⚠️ Recommend guests sign in to save personas to database

## Testing Checklist

### Test 1: Visibility
- [ ] Sign in as User A
- [ ] Create a custom persona "Test Persona A"
- [ ] Sign out
- [ ] Sign in as User B
- [ ] Verify "Test Persona A" appears on personas page ✅
- [ ] Click on "Test Persona A" - should open chat ✅

### Test 2: Edit Permissions
- [ ] While signed in as User B
- [ ] Hover over "Test Persona A" card
- [ ] Verify NO edit button appears ❌
- [ ] Sign out and sign back in as User A
- [ ] Hover over "Test Persona A" card
- [ ] Verify edit button DOES appear ✅
- [ ] Click edit button - modal should open ✅

### Test 3: Guest Access
- [ ] Sign out (become guest)
- [ ] Go to personas page
- [ ] Verify all custom personas are visible ✅
- [ ] Click on any custom persona - chat should work ✅
- [ ] Verify NO edit buttons appear on any persona ❌

## Security Notes

### What's Protected:
- ✅ Users can only CREATE personas for themselves
- ✅ Users can only EDIT personas they own
- ✅ Users can only DELETE personas they own
- ✅ Row Level Security (RLS) enforces these rules at database level

### What's Public:
- ✅ All personas are visible to everyone
- ✅ Anyone can chat with any persona
- ✅ Persona names, descriptions, avatars, system prompts are public

### Privacy Considerations:
⚠️ **Important:** Once you create a custom persona, it becomes **publicly visible** to all users. Don't include:
- Personal information you want to keep private
- Sensitive or confidential data
- Anything you wouldn't want others to see

## Rollback (If Needed)

If you want to revert to private personas:

```sql
-- Rollback: Make personas private again
DROP POLICY IF EXISTS "Allow read access to all personas" ON personas;
CREATE POLICY "Allow read access to all personas" ON personas
  FOR SELECT
  USING (is_custom = false OR user_id = auth.uid());
```

This will:
- ✅ Keep official personas public
- ✅ Make custom personas private again (owner-only)

## Migration Status

- [x] SQL migration created
- [x] Code updated (personas page)
- [x] Code updated (PersonaCard component)
- [ ] **YOU NEED TO RUN**: SQL migration in Supabase Dashboard
- [ ] Code deployed to Vercel

## Next Steps

1. **Run the SQL migration** in Supabase Dashboard (see Step 1 above)
2. **Deploy code** by pushing to GitHub
3. **Test** using the checklist above
4. **Enjoy** publicly visible custom personas! 🎉

---

**Last Updated:** 2025-11-02
**Status:** ⏳ Ready to migrate (SQL not yet run)
