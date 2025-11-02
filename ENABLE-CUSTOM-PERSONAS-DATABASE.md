# Enable Custom Personas in Database

## Current Situation
- ❌ Custom personas (like Donald Trump) are saved to **localStorage only**
- ❌ They don't sync across devices
- ❌ They're not visible on other browsers/devices
- ❌ They disappear if you clear browser data

## Why This Happens
The database migration hasn't been run yet, so the `personas` table doesn't have the required columns (`user_id` and `is_custom`).

## Solution: Run the Database Migration

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg
2. Click "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Copy and Run This SQL

```sql
-- Migration: Add support for custom user-created personas

-- Add columns to personas table for custom personas
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_is_custom ON personas(is_custom);

-- Update RLS policies to allow users to manage their custom personas
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Allow users to read all personas (official + their own custom)
DROP POLICY IF EXISTS "Allow read access to all personas" ON personas;
CREATE POLICY "Allow read access to all personas" ON personas
  FOR SELECT
  USING (is_custom = false OR user_id = auth.uid());

-- Allow users to create their own custom personas
DROP POLICY IF EXISTS "Allow users to create custom personas" ON personas;
CREATE POLICY "Allow users to create custom personas" ON personas
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_custom = true);

-- Allow users to update only their custom personas
DROP POLICY IF EXISTS "Allow users to update their custom personas" ON personas;
CREATE POLICY "Allow users to update their custom personas" ON personas
  FOR UPDATE
  USING (user_id = auth.uid() AND is_custom = true);

-- Allow users to delete only their custom personas
DROP POLICY IF EXISTS "Allow users to delete their custom personas" ON personas;
CREATE POLICY "Allow users to delete their custom personas" ON personas
  FOR DELETE
  USING (user_id = auth.uid() AND is_custom = true);
```

### Step 3: Click "Run" or Press Ctrl+Enter

You should see: "Success. No rows returned"

### Step 4: Verify the Migration

Run this query to check:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'personas'
  AND column_name IN ('user_id', 'is_custom');
```

Should return:
```
column_name | data_type
user_id     | uuid
is_custom   | boolean
```

## After Migration: Update the Code

The code needs to be updated to save custom personas to the database instead of localStorage. I'll do this next.

## Benefits After Migration

✅ Custom personas sync across all your devices
✅ Custom personas persist even if you clear browser data
✅ Custom personas visible to authenticated users
✅ Proper security with Row Level Security (RLS)
✅ Users can only see and edit their own custom personas

## Migration Files Location

- Migration SQL: `supabase/migration-add-custom-personas.sql`
- Migration script: `scripts/run-custom-personas-migration.js`

## Troubleshooting

If you get errors:

1. **"relation personas does not exist"**
   - Run the main schema creation first
   - Check: `supabase/supabase-schema.sql`

2. **"column already exists"**
   - Migration was already run - this is fine!
   - The `IF NOT EXISTS` clauses prevent errors

3. **"permission denied"**
   - Make sure you're using the service role key
   - Or run the SQL in the Supabase dashboard (auto-authenticated)
