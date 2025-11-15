# Multiple Conversations Per Persona - Feature Implementation

## ✅ Feature Complete

Users can now have multiple separate conversations with the same persona. Each conversation is independent and accessible via its unique conversation ID.

## How It Works

### URL Structure
- **Old**: `/chat/albert-einstein`
- **New**: `/chat/albert-einstein?conversationId=abc-123`

The conversation ID is automatically added to the URL when you:
1. Load an existing conversation
2. Create a new conversation
3. Click on a past chat

### User Flow

#### Starting a New Conversation
1. User is in an active chat with a persona
2. Clicks the **"New Chat"** button (top right)
3. App navigates to `/chat/[persona]` without conversation ID
4. System creates a new conversation
5. URL updates to `/chat/[persona]?conversationId=new-id`
6. Fresh chat session begins

#### Accessing Past Conversations
1. User clicks on a past chat from the side panel
2. App navigates to `/chat/[persona]?conversationId=specific-id`
3. System loads that specific conversation
4. All messages from that conversation are displayed
5. User continues the conversation

#### Creating Multiple Conversations with Same Persona
1. Chat with Albert Einstein → Conversation A created
2. Click "New Chat" → Conversation B created (new ID)
3. Chat with Albert Einstein again
4. Click "New Chat" → Conversation C created (new ID)
5. Past chats shows all three conversations
6. Each conversation is separate and independent

## Technical Implementation

### 1. URL Query Parameters
```javascript
const { personaId, conversationId: urlConversationId } = router.query
```

Extracts both the persona slug and optional conversation ID from the URL.

### 2. Conversation Loading Logic

**If conversation ID in URL:**
```javascript
if (urlConversationId) {
  // Load specific conversation by ID
  // Validate it belongs to the logged-in user
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', urlConversationId)
    .eq('session_id', userId)
    .eq('is_active', true)
    .single()
}
```

**If no conversation ID in URL:**
```javascript
if (!convId) {
  // Find most recent conversation OR create new one
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', userId)
    .eq('persona_type', persona.slug)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) {
    // Create new conversation
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ ... })
      .select()
      .single()

    // Update URL with new conversation ID
    router.replace(`/chat/${persona.slug}?conversationId=${newConv.id}`, undefined, { shallow: true })
  }
}
```

### 3. Auto-Update URL
```javascript
// After loading or creating conversation, update URL
if (!urlConversationId && convId) {
  router.replace(
    `/chat/${persona.slug}?conversationId=${convId}`,
    undefined,
    { shallow: true }
  )
}
```

Uses shallow routing to update URL without page reload.

### 4. Past Chats Links

**Desktop Side Panel** (`components/layout/SidePanel.jsx`):
```jsx
<button
  onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
>
  {chat.title}
</button>
```

**Mobile Side Panel** (`pages/personas/index.js`):
```jsx
<button
  onClick={() => {
    setIsMobileSidePanelOpen(false)
    router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)
  }}
>
  {chat.title}
</button>
```

### 5. New Chat Button

**Old Implementation** (cleared messages in-place):
```jsx
onClick={() => {
  clearMessages()
  setConversationId(null)
  setGuestMessageCount(0)
}}
```

**New Implementation** (navigates to create new conversation):
```jsx
onClick={() => {
  router.push(`/chat/${personaId}`)
}}
```

## Database Structure

### Conversations Table
Each conversation has:
- `id`: Unique UUID
- `session_id`: User ID (for filtering)
- `persona_type`: Persona slug
- `persona_slug`: Persona slug (duplicate for compatibility)
- `title`: Display name in past chats
- `is_active`: Boolean (for soft delete)
- `updated_at`: Timestamp (for sorting)

### Messages Table
Each message has:
- `conversation_id`: Links to conversation
- `role`: 'user' or 'assistant'
- `content`: Message text
- `created_at`: Timestamp

## Security

- **Ownership Validation**: System verifies conversation belongs to logged-in user before loading
- **Session Matching**: Only loads conversations where `session_id` matches authenticated user ID
- **Active Filter**: Only shows active conversations (`is_active = true`)

## Benefits

✅ **Multiple Conversations**: Users can have separate conversations with same persona
✅ **Context Preservation**: Each conversation maintains its own context
✅ **Easy Access**: Click any past chat to resume that specific conversation
✅ **Clean URLs**: Shareable URLs that point to specific conversations
✅ **Backward Compatible**: Works with existing conversations
✅ **Automatic**: URL updates automatically, no user action needed

## Files Modified

1. **pages/chat/[personaId].js**
   - Added conversation ID query parameter extraction
   - Updated conversation loading logic
   - Auto-update URL with conversation ID
   - Modified New Chat button to navigate instead of clearing

2. **pages/personas/index.js**
   - Updated mobile past chats links to include conversation ID

3. **components/layout/SidePanel.jsx**
   - Updated desktop past chats links to include conversation ID

## Testing Checklist

- [ ] Create new conversation with persona A
- [ ] Send some messages
- [ ] Click "New Chat" button
- [ ] Verify URL changes (conversation ID removed, then new ID added)
- [ ] Send messages in new conversation
- [ ] Check past chats - should see 2 conversations
- [ ] Click first conversation from past chats
- [ ] Verify correct messages load
- [ ] Click second conversation from past chats
- [ ] Verify different messages load
- [ ] Test on mobile (hamburger menu past chats)
- [ ] Test on desktop (side panel past chats)
- [ ] Verify URL always contains conversation ID after loading

## Example Flow

**Scenario**: User wants to have two different conversations with Albert Einstein

1. Navigate to `/chat/albert-einstein`
2. System creates conversation with ID `conv-001`
3. URL updates to `/chat/albert-einstein?conversationId=conv-001`
4. User asks: "What is relativity?"
5. Conversation saved with messages
6. User clicks "New Chat"
7. Navigate to `/chat/albert-einstein` (no ID)
8. System creates new conversation with ID `conv-002`
9. URL updates to `/chat/albert-einstein?conversationId=conv-002`
10. User asks: "What is quantum mechanics?"
11. Different conversation saved
12. Past chats now shows:
    - "Chat with Albert Einstein" (conv-001 - about relativity)
    - "Chat with Albert Einstein" (conv-002 - about quantum)
13. Click on first chat → loads conv-001 with relativity messages
14. Click on second chat → loads conv-002 with quantum messages

## Future Enhancements

- [ ] Allow users to rename conversation titles
- [ ] Add conversation search
- [ ] Export conversation to file
- [ ] Delete individual conversations
- [ ] Archive old conversations
- [ ] Conversation analytics (message count, duration)
