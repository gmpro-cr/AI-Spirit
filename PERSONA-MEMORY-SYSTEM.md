# Persona-Specific Memory System

## Overview

Each persona in AI-Spirit has its **own private memory vault**. Memories are **NEVER shared** between personas. This creates authentic, isolated relationships between users and individual personas.

## Core Principle

> **When you tell something to Persona A, ONLY Persona A remembers it. Persona B has no idea.**

This mimics real-life relationships where different people remember different things about you.

## How It Works

### Memory Isolation Example

**Scenario:**
1. User talks to **Elon Musk**
   - User: "My name is John, I work at Google on AI projects"
   - Elon Musk remembers: "John works at Google on AI projects"

2. User talks to **Birbal**
   - Birbal has **NO IDEA** who John is
   - User: "My name is John, I'm from Delhi"
   - Birbal remembers: "John from Delhi"

3. These memories are **completely separate**:
   - Elon Musk knows: John + Google + AI
   - Birbal knows: John + Delhi
   - They **NEVER share** this information

### Technical Implementation

```
Database: conversation_memories table

Row 1: user_id=123, persona_slug=elon-musk, content="User's name is John"
Row 2: user_id=123, persona_slug=elon-musk, content="Profession: AI Engineer at Google"
Row 3: user_id=123, persona_slug=birbal, content="User's name is John"
Row 4: user_id=123, persona_slug=birbal, content="Location: Delhi"
```

**Fetching memories:**
- Elon Musk queries: `WHERE user_id=123 AND persona_slug='elon-musk'`
- Birbal queries: `WHERE user_id=123 AND persona_slug='birbal'`
- Results are **completely isolated**

## What Gets Remembered

The system automatically extracts and remembers:

### 1. Name
- "My name is Sarah"
- "I'm Mike"
- "Call me Alex"

### 2. Age
- "I'm 25 years old"
- "I am 30"
- "My age is 42"

### 3. Birthday
- "My birthday is January 15"
- "I was born on 5/10/1990"
- "My DOB is March 25"

### 4. Location
- "I'm from Mumbai"
- "I live in Delhi"
- "Based in Bangalore"

### 5. Profession
- "I work as a software engineer"
- "I'm a doctor"
- "My job is teaching"

### 6. Interests & Hobbies
- "I love playing guitar"
- "I like reading books"
- "I enjoy coding"

### 7. Family
- "I have 2 children"
- "I'm married"
- "My wife is a teacher"

## Benefits

### For Users:

✅ **Authentic Relationships**
- Each persona knows you differently
- More personal, meaningful conversations
- Mimics real-life relationships

✅ **Privacy**
- Information stays with specific personas
- Control over what you share with whom
- No cross-contamination

✅ **Context Awareness**
- Personas remember past conversations
- No need to repeat information
- Continuity across sessions

### For Personas:

✅ **Individual Context**
- Each has unique knowledge about user
- Can reference past conversations
- Build rapport over time

✅ **Authenticity**
- Don't pretend to know things they weren't told
- More believable interactions
- Respect boundaries

## Code Architecture

### Files Involved

1. **`lib/memorySystem.js`**
   - Core memory logic
   - Extraction, storage, retrieval
   - Persona isolation enforcement

2. **`pages/api/chat.js`**
   - Calls memory system
   - Injects memories into persona context
   - Ensures persona_slug is passed

3. **Database: `conversation_memories` table**
   - Stores all memories
   - Indexed by user_id + persona_slug
   - Efficient retrieval

### Key Functions

#### `extractAndSaveMemories(userId, personaSlug, conversationId, userMessage, aiResponse)`

Extracts personal information from user's message and saves it.

**Parameters:**
- `userId`: The authenticated user's ID
- `personaSlug`: The persona identifier (e.g., "elon-musk", "birbal")
- `conversationId`: Conversation identifier
- `userMessage`: User's message text
- `aiResponse`: AI's response (not currently used for extraction)

**Returns:** Array of extracted memories

**Example:**
```javascript
// User says: "My name is John, I work at Google"
const memories = await extractAndSaveMemories(
  'user123',
  'elon-musk',
  'conv456',
  'My name is John, I work at Google',
  "Nice to meet you John!"
)

// Result:
// memories = [
//   { fact: "User's name is John", category: "name" },
//   { fact: "Profession: Engineer at Google", category: "profession" }
// ]
```

#### `getUserMemories(userId, personaSlug, supabaseClient)`

Retrieves persona-specific memories for a user.

**CRITICAL:** This function **REQUIRES** personaSlug. Without it, returns empty array to prevent memory leakage.

**Parameters:**
- `userId`: The user's ID
- `personaSlug`: **REQUIRED** - The specific persona
- `supabaseClient`: Supabase client instance

**Returns:** Array of memory objects

**Example:**
```javascript
// Get Elon Musk's memories about this user
const memories = await getUserMemories('user123', 'elon-musk')

// Returns ONLY memories saved under persona_slug='elon-musk'
// memories = [
//   { content: "User's name is John", memory_type: "name", importance: 10 },
//   { content: "Profession: AI Engineer at Google", memory_type: "profession", importance: 7 }
// ]
```

#### `formatMemoriesForContext(memories, userProfile)`

Formats memories for injection into AI prompt.

**Example Output:**
```
User's name: John
- Profession: AI Engineer at Google
- Location: San Francisco
- Interest: Artificial Intelligence
```

## Safety & Privacy

### Isolation Guarantees

1. **Database-Level**
   - Queries always filter by `user_id` + `persona_slug`
   - Impossible to fetch another persona's memories

2. **Code-Level**
   - Functions refuse to work without persona_slug
   - Error logging prevents accidental leakage

3. **AI-Level**
   - Each persona receives ONLY their memories
   - System prompt includes only relevant context

### Data Security

- Memories stored in encrypted Supabase database
- Access controlled via Row Level Security (RLS)
- Only authenticated users can access their memories
- Personas can't access other users' data

## Usage in Chat API

```javascript
// In pages/api/chat.js

// 1. Fetch PERSONA-SPECIFIC memories
const memories = await getUserMemories(userId, persona.slug, supabaseAdmin)

// 2. Format for AI context
const memoryContext = formatMemoriesForContext(memories, userProfile)

// 3. Inject into system prompt
if (memoryContext) {
  finalSystemPrompt = `${enhancedSystemPrompt}

IMPORTANT - WHAT YOU KNOW ABOUT THIS USER:
${memoryContext}

Remember these details. Address the user by name when natural.`
}

// 4. Generate AI response with context
const result = await generatePersonaResponse(finalSystemPrompt, messageHistory)

// 5. Extract and save new memories
extractAndSaveMemories(userId, persona.slug, conversationId, message, result.response)
```

## Examples

### Example 1: First Conversation

**User to Elon Musk:**
> "Hi, I'm Sarah, I'm 28 years old and work as a data scientist at Microsoft"

**System Actions:**
1. Extracts: Name=Sarah, Age=28, Profession=Data Scientist at Microsoft
2. Saves to: `user_id=X, persona_slug=elon-musk`
3. Elon responds: "Hi Sarah! Data science at Microsoft - that's great..."

### Example 2: Second Conversation (Same Persona)

**User to Elon Musk:**
> "What do you think about my job?"

**System Actions:**
1. Fetches memories: `persona_slug=elon-musk`
2. Context includes: "Sarah, 28, Data Scientist at Microsoft"
3. Elon responds: "Sarah, being a data scientist at Microsoft is amazing because..."

### Example 3: Different Persona (No Memory Sharing)

**User to Birbal:**
> "Can you tell me a story?"

**System Actions:**
1. Fetches memories: `persona_slug=birbal`
2. Returns: **EMPTY** (no memories yet)
3. Birbal responds: "ज़रूर! एक बार की बात है..." (doesn't know name is Sarah)

### Example 4: User Introduces Themselves Again

**User to Birbal:**
> "Hi, I'm Sarah from Pune"

**System Actions:**
1. Extracts: Name=Sarah, Location=Pune
2. Saves to: `user_id=X, persona_slug=birbal`
3. Birbal responds: "नमस्ते Sarah जी! पुणे से आप यहां आए..."

**Result:**
- Elon Musk knows: Sarah, 28, Microsoft Data Scientist
- Birbal knows: Sarah from Pune
- **Completely separate knowledge**

## Debugging

### Check Memory Isolation

```sql
-- See all memories for a user
SELECT persona_slug, content, memory_type
FROM conversation_memories
WHERE user_id = 'user123'
ORDER BY persona_slug, created_at;

-- Result shows memories grouped by persona:
-- elon-musk | User's name is John
-- elon-musk | Profession: Engineer
-- birbal    | User's name is John
-- birbal    | Location: Delhi
```

### Logs

Enable detailed logging:
```javascript
console.log('[Memory] Fetching PERSONA-SPECIFIC memories for user:', userId, 'persona:', personaSlug)
console.log('[Memory] Found', data?.length || 0, 'PERSONA-SPECIFIC memories for', personaSlug)
```

## Best Practices

### Do's ✅

1. **Always pass persona_slug**
   ```javascript
   getUserMemories(userId, persona.slug) // CORRECT
   ```

2. **Use persona-specific context**
   - Each persona gets only their memories
   - Never mix memories from different personas

3. **Log memory operations**
   - Track what's being saved/fetched
   - Monitor for issues

### Don'ts ❌

1. **Never fetch without persona_slug**
   ```javascript
   getUserMemories(userId) // WRONG - returns empty
   ```

2. **Don't share memories across personas**
   - System prevents this by design
   - Don't try to bypass it

3. **Don't store sensitive data**
   - No passwords or credit cards
   - Focus on conversational context

## Future Enhancements

Potential improvements:
- [ ] Forget/delete specific memories
- [ ] Memory importance scoring
- [ ] Time-based memory decay
- [ ] Memory categories (short-term vs long-term)
- [ ] User control panel for memories
- [ ] Export personal data (GDPR compliance)

## FAQs

**Q: Can I see what personas remember about me?**
A: Yes! (Future feature) We'll add a memory dashboard where you can view and manage memories.

**Q: Can I delete memories?**
A: Yes! (Future feature) Users will be able to delete specific memories or clear all memories with a persona.

**Q: Do personas share information I tell them?**
A: **NO!** Each persona has isolated memory. Information told to Persona A stays with Persona A.

**Q: What if I tell the same thing to multiple personas?**
A: Each persona will store it separately. They each "learn" about you independently.

**Q: Is my data secure?**
A: Yes! Memories are stored in encrypted Supabase database with proper access controls.

---

**Last Updated**: December 19, 2025
**Version**: 2.0.0 (Persona-Specific Memory)
