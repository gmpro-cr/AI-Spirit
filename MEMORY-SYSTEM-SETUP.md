# Memory System Setup Guide

## Problem
The memory system code is already implemented in the application, but it's not working because the database tables don't exist yet.

## Solution
Run the database migration to create the required tables.

## Method 1: Using Supabase SQL Editor (RECOMMENDED)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (exdjsvknudvfkabnifrg)
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content from: `supabase/migrations/create_memory_and_relationship_tables.sql`
6. Paste it into the SQL Editor
7. Click **Run** or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)

## Method 2: Using psql command line

Run this command from your project root:

```bash
PGPASSWORD='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg5MjgwNiwiZXhwIjoyMDc2NDY4ODA2fQ.1y7gUdkNObsMDiiFinPOEnyxJV0Ikb8oeRGD8gJgSDA' \
psql -h aws-0-ap-south-1.pooler.supabase.com \
     -p 6543 \
     -U postgres.exdjsvknudvfkabnifrg \
     -d postgres \
     -f supabase/migrations/create_memory_and_relationship_tables.sql
```

## What This Migration Creates

### 1. **conversation_memories** Table
Stores user information extracted from conversations:
- User's name, interests, goals, profession, location
- Family details, hobbies, preferences
- Birth details, health info, languages, beliefs
- Age, challenges, and more

### 2. **persona_relationships** Table
Tracks the relationship level between users and personas:
- Stranger → Acquaintance → Friend → Close Friend → Confidant
- Conversation count tracking
- Last conversation timestamp

## How It Works

### For Authenticated Users:
1. When a user chats with a persona, the AI automatically extracts relevant personal information
2. Information is saved to the conversation_memories table
3. In future conversations, this information is injected into the AI's context
4. The AI can remember and reference these details naturally

### 17 Memory Types Extracted:
- name, interest, goal, profession, location
- birth_details, family, health, education, hobby
- career, food_preference, pet, language, belief
- age, challenge

### For Guest Users:
- Memory system doesn't work for guest users
- Only authenticated users get personalized memory

## Verification

After running the migration, you can verify it worked by:

1. Checking tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversation_memories', 'persona_relationships');
```

2. Checking table structure:
```sql
\d conversation_memories
\d persona_relationships
```

## Testing

1. Sign in to AI-Spirit (not as guest)
2. Start a conversation with any persona
3. Share some personal information (e.g., "My name is John and I love programming")
4. Have a few more messages in the conversation
5. Start a NEW conversation with the same persona
6. The persona should remember details you shared before

## Files Involved

- **Migration SQL**: `supabase/migrations/create_memory_and_relationship_tables.sql`
- **Memory Extraction Logic**: `lib/memorySystem.js`
- **Memory Integration**: `pages/api/chat.js` (lines 232-269, 368-383)
- **Relationship System**: `lib/relationshipSystem.js`

## Troubleshooting

If memories still don't work after migration:

1. Check browser console for errors
2. Check Vercel function logs for memory extraction errors
3. Verify you're signed in (not using guest mode)
4. Check if data is being inserted:
```sql
SELECT * FROM conversation_memories LIMIT 10;
```
