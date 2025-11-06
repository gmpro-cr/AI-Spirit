-- Migration: Enable guest users to create personas in the database
-- This allows ALL users (authenticated and guest) to sync personas to the database

-- Update INSERT policy to allow both authenticated users and guests
DROP POLICY IF EXISTS "Allow users to create custom personas" ON personas;
CREATE POLICY "Allow users to create custom personas" ON personas
  FOR INSERT
  WITH CHECK (
    is_custom = true AND
    (
      -- Authenticated users: user_id must match their auth.uid()
      (user_id IS NOT NULL AND user_id = auth.uid()) OR
      -- Guest users: user_id can be null
      (user_id IS NULL)
    )
  );

-- Update UPDATE policy to allow users to update their own personas
-- Guest personas (user_id = NULL) can be updated by anyone (or you can restrict this)
DROP POLICY IF EXISTS "Allow users to update their custom personas" ON personas;
CREATE POLICY "Allow users to update their custom personas" ON personas
  FOR UPDATE
  USING (
    is_custom = true AND
    (
      -- Users can update their own personas
      (user_id IS NOT NULL AND user_id = auth.uid()) OR
      -- Guest personas (user_id = NULL) cannot be updated to prevent abuse
      false
    )
  );

-- Update DELETE policy similarly
DROP POLICY IF EXISTS "Allow users to delete their custom personas" ON personas;
CREATE POLICY "Allow users to delete their custom personas" ON personas
  FOR DELETE
  USING (
    is_custom = true AND
    (
      -- Users can delete their own personas
      (user_id IS NOT NULL AND user_id = auth.uid()) OR
      -- Guest personas (user_id = NULL) cannot be deleted to prevent abuse
      false
    )
  );

-- Add comment explaining the policy
COMMENT ON POLICY "Allow users to create custom personas" ON personas IS
  'Allows authenticated users to create personas with their user_id, and guest users to create personas with null user_id';

-- Summary:
-- ✅ Authenticated users can create, update, and delete their own custom personas
-- ✅ Guest users can create custom personas (with user_id = NULL)
-- ✅ Guest personas cannot be edited or deleted (prevents abuse)
-- ✅ All users can read all personas (from previous migration)
