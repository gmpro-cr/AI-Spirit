-- Migration: Add support for custom user-created personas
-- Run this in Supabase SQL Editor

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
