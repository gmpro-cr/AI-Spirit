# Past Chats Section Fix

## Problem
The past chats section was not working because the code was querying database columns that don't exist:
- Using `session_id` instead of `user_id`
- Using `is_active` column that doesn't exist
- Using `persona_type` instead of having a proper persona reference

## Solution
Fixed the code to use correct column names and added a new `persona_slug` column to track conversations.

## Changes Made

### 1. Database Migration Required
Run this SQL in your Supabase SQL Editor:

```sql
-- Add persona_slug column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS persona_slug TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_persona_slug ON conversations(persona_slug);

-- Update existing conversations to populate persona_slug from personas table
UPDATE conversations c
SET persona_slug = p.slug
FROM personas p
WHERE c.persona_id = p.id AND c.persona_slug IS NULL;
```

### 2. Code Changes

#### components/layout/SidePanel.jsx
- Changed query from `session_id` to `user_id`
- Removed `is_active` filter (column doesn't exist)
- Now using `persona_slug` directly instead of joining with personas table

#### pages/chat/[personaId].js
- Changed conversation lookup from `session_id` to `user_id`
- Changed from `persona_id` to `persona_slug` for finding existing conversations
- Added `persona_slug` when creating new conversations
- Removed `is_active`, `is_guest_session`, and `is_deleted` references (columns don't exist)

## How to Apply the Fix

1. **Run the database migration**:
   - Go to https://supabase.com/dashboard
   - Navigate to your project
   - Go to SQL Editor
   - Copy the SQL from above and run it

2. **The code changes are already applied** in:
   - `components/layout/SidePanel.jsx`
   - `pages/chat/[personaId].js`

3. **Test the fix**:
   - Sign in as an authenticated user
   - Start a chat with any persona
   - Send a few messages
   - Navigate back to personas page
   - The past chat should now appear in the sidebar

## Technical Details

The `persona_slug` column allows us to:
- Track conversations for hardcoded personas (from INITIAL_PERSONAS)
- Track conversations for custom personas (from database)
- Easily link back to the correct persona page
- Avoid complex joins when loading past chats
