-- Migration: Add Memory System and Relationship System Tables
-- This enables personas to remember user details and track relationship progression

-- 1. Conversation Memories Table
-- Stores extracted user information from conversations for personalized AI responses
CREATE TABLE IF NOT EXISTS conversation_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_slug TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('name', 'interest', 'goal', 'profession', 'location', 'birth_details', 'family', 'health', 'education', 'hobby', 'career', 'food_preference', 'pet', 'language', 'belief', 'age', 'challenge')),
  content TEXT NOT NULL,
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  context TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Persona Relationships Table
-- Tracks user-persona relationship levels and conversation counts
CREATE TABLE IF NOT EXISTS persona_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_slug TEXT NOT NULL,
  relationship_level TEXT NOT NULL DEFAULT 'stranger' CHECK (relationship_level IN ('stranger', 'acquaintance', 'friend', 'close_friend', 'confidant')),
  conversation_count INTEGER NOT NULL DEFAULT 0,
  last_conversation_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, persona_slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_memories_user_id ON conversation_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memories_persona_slug ON conversation_memories(persona_slug);
CREATE INDEX IF NOT EXISTS idx_conversation_memories_user_persona ON conversation_memories(user_id, persona_slug);
CREATE INDEX IF NOT EXISTS idx_conversation_memories_importance ON conversation_memories(importance DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_memories_created_at ON conversation_memories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_persona_relationships_user_id ON persona_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_persona_relationships_persona_slug ON persona_relationships(persona_slug);
CREATE INDEX IF NOT EXISTS idx_persona_relationships_user_persona ON persona_relationships(user_id, persona_slug);

-- Enable Row Level Security
ALTER TABLE conversation_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_memories
-- Users can only view, insert, update their own memories
CREATE POLICY "Users can view own memories" ON conversation_memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON conversation_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON conversation_memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON conversation_memories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for persona_relationships
-- Users can only view, insert, update their own relationships
CREATE POLICY "Users can view own relationships" ON persona_relationships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own relationships" ON persona_relationships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own relationships" ON persona_relationships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own relationships" ON persona_relationships
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_conversation_memories_updated_at
  BEFORE UPDATE ON conversation_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_relationships_updated_at
  BEFORE UPDATE ON persona_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
