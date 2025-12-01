# Fix RLS Policy for Guest User Persona Creation

## Problem

Guest users (not signed in) cannot create personas because the RLS policy requires:
```sql
WITH CHECK (user_id = auth.uid() AND is_custom = true)
```

For guest users, `auth.uid()` is `NULL`, and `user_id` is `NULL`, but `NULL != NULL` in SQL, so the check fails.

## Solution

Update the RLS policy in Supabase to allow both authenticated and guest users to create personas.

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run This SQL

```sql
-- Fix RLS Policy to Allow Guest Users to Create Personas

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow users to create custom personas" ON personas;

-- Create new policy that allows:
-- 1. Authenticated users to create personas (user_id = auth.uid())
-- 2. Guest users to create personas (user_id IS NULL when auth.uid() IS NULL)
CREATE POLICY "Allow users to create custom personas" ON personas
  FOR INSERT
  WITH CHECK (
    is_custom = true AND (
      (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
      (auth.uid() IS NULL AND user_id IS NULL)
    )
  );
```

### Step 3: Verify the Policy

Run this query to check:
```sql
SELECT
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'personas' AND cmd = 'INSERT';
```

Expected result:
- **policyname:** "Allow users to create custom personas"
- **cmd:** INSERT
- **with_check:** Should show the new policy allowing both authenticated and guest users

## What This Fixes

✅ **Authenticated users** can create personas (user_id matches their auth.uid())  
✅ **Guest users** can create personas (user_id is NULL when not signed in)  
✅ Both must set `is_custom = true`  
✅ Security is maintained - users can only create their own personas

## After Running This

1. Test creating a persona as a **guest user** (not signed in)
2. Test creating a persona as an **authenticated user** (signed in)
3. Both should work without RLS errors

## Alternative: Allow All Inserts (Less Secure)

If you want to completely disable RLS for inserts (not recommended for production):

```sql
DROP POLICY IF EXISTS "Allow users to create custom personas" ON personas;

CREATE POLICY "Allow all users to create custom personas" ON personas
  FOR INSERT
  WITH CHECK (is_custom = true);
```

This allows anyone to create personas with any `user_id`, which is less secure.

## Recommended Approach

Use the first SQL (Step 2) which maintains security while allowing both authenticated and guest users.
