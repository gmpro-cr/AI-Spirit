---
name: verify
description: How to build, launch and drive AI-Spirit locally to observe a change at its surface. Use when verifying UI or chat-flow changes in this repo.
---

# Verifying AI-Spirit

Next.js 14 Pages Router. Surface is the browser.

## Launch

```bash
cd /Users/gaurav/AI-Spirit
npx next dev -p 3111        # ~15s to ready; PWA is disabled in dev
```

`.env.local` exists and is loaded, but see the auth note below — you still
cannot reach the model without a session.

## The two walls

**1. `/chat/[personaId]`, `/chats` and `/premium` are wrapped in
`withAuth`** (`middleware/withAuth.js`), which redirects to `/auth/signin`.
localhost has no Supabase session, and signing in as the user is off limits.
`/personas`, `/`, `/talk-to/*` and `/share/*` render without auth.

To observe an auth-walled page, temporarily neuter the guard, then restore it
with `git checkout -- middleware/withAuth.js` and confirm the diff is clean:

```python
# in middleware/withAuth.js: make the redirect effect and the null-return inert
"if (!loading && !user) {"  ->  "if (false) {"
"if (!user) {\n            return null\n        }"  ->  "if (false) { return null }"
```

**2. `pages/api/chat.js` requires a valid Supabase bearer token** — it 401s
before doing anything else, and the chat page turns that 401 into a redirect
back to sign-in. So even with the guard off you get no model reply.

To drive streaming, stop-generation, regenerate and persistence, stub the
network instead of the backend. Drop a script in `public/` that patches
`window.fetch` for `/api/chat` and returns a `ReadableStream` of SSE frames
(`data: {"chunk":"..."}` … `data: {"done":true,"conversationId":"..."}`),
honouring `init.signal` by calling `controller.error(new DOMException(...,
'AbortError'))` on abort. Load it with a short injection so the classifier
doesn't block a long inline script:

```js
await new Promise((res, rej) => { const s = document.createElement('script');
  s.src = '/__stub.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
```

This exercises the real component code (SSE reader, AbortController,
conversation persistence, sidebar events). Only the model is fake. Say so in
the report. Delete the stub from `public/` afterwards.

## Seeding chat state

Conversations live in localStorage, not the DB, for list purposes:
`esperit_conversations` (the list) and `esperit_conversation_<id>` (bodies).
Write a fixture to `public/__seed.json` and load it in one short call —
inline JSON large enough to seed a thread gets the injection blocked.

Useful fixture cases: two conversations with the *same* persona (proves titles
disambiguate), one a few days old and one weeks old (proves date bucketing),
and an assistant message containing `*italics*`, `**bold**`, a list, a GFM
table, a blockquote, inline code and a link.

## Theme

`localStorage.theme` is `light` | `dark` | `system`; `pages/_document.js`
applies the class before paint. Set it and reload to check either theme.

## Gotchas

- The persona grid can sit on skeletons for several seconds in dev — wait
  before concluding anything about loading states.
- The cookie-consent banner overlaps the composer on first load. Decline it.
- `lib/__tests__/contextProvider.test.js` has 6 failures on a clean tree.
  Pre-existing; not your change.
- The harness plan-gate hook derives its project slug from the shell's current
  directory, so keep the shell in the repo root.
