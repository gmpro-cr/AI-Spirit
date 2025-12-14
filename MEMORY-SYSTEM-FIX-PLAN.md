# Memory System Fix Plan

## Problem Confirmed
User reports: "I told astro guide my birthdate, time of birth and place of birth but it does not remember in new chat instance"

**Status:** Memory system IS broken - personas do NOT remember user details across chat instances.

## What We Know

### ✅ What's Working
1. **Database Tables** - `conversation_memories` and `persona_relationships` exist and are accessible
2. **Memory Storage** - 16 memories successfully stored for user f7ddbd3c-089b-4068-8722-de0fea30d335 (mahalegauravk@gmail.com)
3. **Memory Retrieval Function** - `getUserMemories()` works when called directly
4. **Memory Formatting** - `formatMemoriesForContext()` correctly formats memories

### ❌ What's Broken
**Memories are NOT being injected during actual conversations**

Production logs show:
- NO "[Memory System] Pre-check" logs
- NO "[Memory System] Injecting user memories" logs
- NO memory-related activity at all during chats

This means the condition `if (userId && !isGuest)` at `/pages/api/chat.js:248` is **failing**.

## Root Cause Analysis

### Most Likely Issues (in order of probability):

#### 1. **Frontend Passing isGuest=true for Authenticated Users** (90% likely)
The frontend might be incorrectly setting `isGuest: true` even when user is logged in.

**Evidence:**
- Code at `/pages/chat/[personaId].js:336` looks correct: `isGuest: !user`
- BUT: Production logs show zero memory activity
- User confirms they are logged in (Google OAuth)
- This suggests `user` object might be null/undefined on frontend

**Fix:** Verify AuthContext is properly providing user object

#### 2. **userId Being Null/Undefined** (5% likely)
Frontend might be passing `userId: null` even for authenticated users.

**Evidence:**
- Code looks correct: `userId: user?.id || null`
- Debug logging will confirm this

#### 3. **Deployment Not Complete** (5% likely)
Debug logging (commit 0a60c8b) hasn't deployed yet.

**Next Step:** Wait for deployment and check logs

## Implementation Plan

### Phase 1: Diagnose (CURRENT)
- [x] Add debug logging to track userId and isGuest values
- [x] Deploy changes (commit 0a60c8b)
- [ ] Get user to test with new deployment
- [ ] Check logs for debug output

### Phase 2: Fix
Based on debug logs, implement one of:

**Option A: Frontend Auth Issue**
```javascript
// In pages/chat/[personaId].js
// Add defensive check:
const { user, userProfile } = useAuth()

console.log('[Chat Page] Auth state:', {
  hasUser: !!user,
  userId: user?.id,
  email: user?.email
})

// Ensure isGuest is correct:
isGuest: !user || !user.id  // More defensive
```

**Option B: Fix Auth Context**
Check `/context/AuthContext.js` to ensure user state is properly maintained after Google OAuth login.

### Phase 3: Verify
1. Login to https://ai-spirit.in
2. Open browser dev console
3. Chat with any persona
4. Check console logs for auth state
5. Check production logs for memory injection
6. Test memory recall in new chat instance

## Quick Test Script

```bash
# After fix is deployed:
# 1. Chat with astro-guide and say: "My name is Test User"
# 2. Close the chat
# 3. Open new chat with astro-guide
# 4. Ask: "What's my name?"
# Expected: "Test User"
# Current: Doesn't remember
```

## Files to Review

1. `/context/AuthContext.js` - User state management
2. `/pages/chat/[personaId].js:23-30` - Where user comes from
3. `/pages/chat/[personaId].js:336` - Where isGuest is set
4. `/pages/api/chat.js:23` - Where API receives parameters
5. `/pages/api/chat.js:243-250` - Memory retrieval condition

## Next Actions

1. **Wait for deployment** to complete (1-2 minutes)
2. **User tests again** - Chat with any persona
3. **Check production logs**:
   ```bash
   vercel logs https://ai-spirit.in --since 1m | grep "Pre-check\|Memory"
   ```
4. **Analyze debug output** to identify exact issue
5. **Implement targeted fix** based on findings

## Debug Logging Added

At `/pages/api/chat.js:243`:
```javascript
console.log('[Memory System] Pre-check:', {
  userId,
  isGuest,
  willFetchMemories: userId && !isGuest
})
```

This will show us:
- Is userId being passed?
- Is isGuest true/false?
- Will memory retrieval happen?

---

**Status:** Awaiting deployment completion and user test to get debug output.
**ETA:** ~2 minutes for deployment, then immediate fix once we see logs.
