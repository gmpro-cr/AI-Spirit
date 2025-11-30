# Persona Memory System - Database Setup

## Step 1: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  preferred_name TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- 2. CONVERSATION MEMORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS conversation_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_slug TEXT NOT NULL,
  memory_type TEXT NOT NULL, -- 'fact', 'preference', 'goal', 'event'
  content TEXT NOT NULL,
  context TEXT,
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  conversation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_memories_user_persona ON conversation_memories(user_id, persona_slug);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON conversation_memories(importance DESC);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON conversation_memories(created_at DESC);

-- Enable RLS
ALTER TABLE conversation_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_memories
DROP POLICY IF EXISTS "Users can view own memories" ON conversation_memories;
CREATE POLICY "Users can view own memories" ON conversation_memories
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own memories" ON conversation_memories;
CREATE POLICY "Users can insert own memories" ON conversation_memories
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own memories" ON conversation_memories;
CREATE POLICY "Users can update own memories" ON conversation_memories
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own memories" ON conversation_memories;
CREATE POLICY "Users can delete own memories" ON conversation_memories
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'conversation_memories');

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'conversation_memories');

-- Verify policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'conversation_memories')
ORDER BY tablename, policyname;
```

## Step 2: Verify Tables

After running the SQL, you should see:
- ✅ `user_profiles` table created
- ✅ `conversation_memories` table created
- ✅ RLS enabled on both tables
- ✅ Policies created for user access

## Next Steps

Once you've run this SQL in Supabase, let me know and I'll proceed with implementing the user profile modal and memory extraction logic.
