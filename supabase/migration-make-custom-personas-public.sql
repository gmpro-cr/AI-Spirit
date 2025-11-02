-- Migration: Make custom personas publicly readable (but only editable by owner)

-- Update RLS policy to allow everyone to read all personas
DROP POLICY IF EXISTS "Allow read access to all personas" ON personas;
CREATE POLICY "Allow read access to all personas" ON personas
  FOR SELECT
  USING (true);  -- Allow all users (including guests) to see all personas

-- Keep INSERT policy unchanged (users can only create their own)
-- This policy should already exist from previous migration

-- Keep UPDATE policy unchanged (users can only update their own)
-- This policy should already exist from previous migration

-- Keep DELETE policy unchanged (users can only delete their own)
-- This policy should already exist from previous migration

-- Summary:
-- ✅ All personas (official + custom) are visible to everyone
-- ✅ Users can only create personas for themselves
-- ✅ Users can only edit/delete their own custom personas
-- ✅ Guests can see all personas but cannot create database personas
