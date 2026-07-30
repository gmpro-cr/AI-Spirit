# AI Spirit — Design Audit

**Date:** 2026-07-29 · **Reviewer:** Claude Code · **Scope:** UI, usability, attractiveness, current-practice features, global standards, professionalism

**Method:** read all 26 components + 20 pages + `globals.css` + `tailwind.config.js`; ran the app locally and inspected the rendered DOM in Chrome; emulated mobile at 390×780 and 360×640; ran a programmatic WCAG contrast audit over computed styles; checked SSR HTML with curl; analysed `data/personas.js`.

---

## Verdict

The visual language is genuinely good — Crimson Text at display sizes, the double-bezel card system, a disciplined monochrome palette. It looks more expensive than most indie AI apps. **The problems are not aesthetic.** They are: a funnel that hides the product behind a Google login, an accessibility layer that was never built, and a design system that exists in CSS but is not used by the components.

Three numbers frame it:

| Measure | Before | After fixes |
|---|---|---|
| WCAG AA text failures, home page | **54** | **0** |
| Persona catalogue visible to a signed-out visitor | **0 of 372** | **372** |
| Persona cards reachable by keyboard | **0** | **372** |

---

## P0 — fixed and verified

### 1. The product was invisible until you logged in with Google
`/personas` and `/chat/[id]` were wrapped in `withAuth`. A first-time visitor clicking the hero CTA went: home → `/auth/signin?returnTo=/personas` → **Google account chooser, fired automatically on mount**. They never saw a single persona, never saw what the product does, and were asked for their Google identity before any value was demonstrated. Pressing Back returned to `/auth/signin`, which immediately re-fired OAuth — a back-button trap.

- Un-gated `/personas`. Guests browse all 372 personas; the sign-in wall now sits at the moment of chatting, where it is justified.
- Rebuilt `/auth/signin` as an explicit consent screen: a "Continue with Google" button the user chooses to press, a plain-language explanation, Terms/Privacy links (required for DPDP/GDPR consent-first), an error state with retry, and a "Browse personas without signing in" escape hatch.

**Verified:** `/personas` returns 200 for an anonymous client and renders 372 cards.

### 2. Persona cards were unusable by keyboard and invisible to crawlers
The card — the single most-repeated interactive element in the product — was a `<div onClick>`. No `tabIndex`, no key handler, no `role`. Consequences: a keyboard-only user could not open **any** persona; no cmd-click to open in a new tab; no crawlable link, so all 372 persona pages were orphans despite the structured data and sitemap work.

Rewritten as a real `<Link>`/`<a href>` with `aria-label="Chat with {name}"`. Hover moved from imperative `onMouseEnter` style mutation to CSS (the old version also left a stuck hover state if the pointer left during a scroll). Edit button moved out of the anchor (it was a nested interactive element, invalid HTML).

**Verified:** 372 `<A>` elements, `tabIndex: 0`, correct labels.

### 3. 54 WCAG AA contrast failures on the home page alone
Measured, not eyeballed. Worst offenders:

| Element | Contrast | Required |
|---|---|---|
| Step numerals "01/02/03" | 1.20:1 | 3:1 |
| Footer copyright | 1.66:1 | 4.5:1 |
| **"Anytime." — half of the main H1** | 1.83:1 | 3:1 |
| Hero stat labels | 2.44:1 | 4.5:1 |
| Category card descriptions | 2.44:1 | 4.5:1 |

The pattern: `text-black/25` … `/55` and `text-white/20` … `/50` used for real body copy. `black/50` is only 3.95:1 — it fails. Raised the whole scale across `index.js`, `SidePanel`, `Footer`, `HeroAnimation`, `premium`, `blog`, `talk-to`, `share`.

**Verified:** home 54 → **0**; premium 8 → 1 real (a Razorpay test badge at 4.4:1).

### 4. Mobile bottom-nav labels below every platform minimum
`9.5px` at `rgba(0,0,0,0.3)` = **1.94:1**. Fails WCAG AA and undercuts the iOS HIG 10pt / Material 12sp tab-label minimums. Inactive icons were also 1.9:1. Now 11px at `black/60` (5.74:1).

### 5. "Create Persona" was broken from every entry point but one
`MobileBottomNav` and `Footer` both linked to `/?create=true`, but only `pages/personas.js` reads that param. From `/premium`, `/chats`, or any footer, tapping "Create Persona" dropped you on the home page and nothing happened. Both now point to `/personas?create=true`. Footer's "Browse Personas" also pointed at `/` — fixed.

### 6. `/chats` had no link anywhere in the entire app
The page exists and works. Nothing in the app linked to it — not the navbar, not the mobile menu, not the footer, not the sidebar. It was reachable only by typing the URL. Added to the desktop navbar and the mobile bottom nav for signed-in users.

### 7. The chat composer was a single-line `<input type="text">`
The core interaction of a conversational product. No multiline, no Shift+Enter, no way to see or edit more than a few words of a longer message — in an app whose pitch is reflective conversation with spiritual guides. Replaced with an auto-growing `<textarea>` (Enter sends, Shift+Enter newline, capped at `max-h-40`, IME-safe via `isComposing`). Also fixed `document.querySelector('input[type="text"]')` — a brittle global query that could focus the wrong field.

### 8. Icon-only buttons had no accessible names
Send, mic, copy, edit, read-aloud, like, dislike, new chat, share — all `title`-only or nothing at all. A screen reader announced the send button as an unlabelled graphic. All now carry `aria-label`; toggles carry `aria-pressed`; decorative SVGs carry `aria-hidden`.

### 9. A 15px gap under the mobile menu
The navbar is `h-16` below `sm`, but the dropdown was pinned at `top-20` — leaving a 15px strip of the page showing through between them (measured). Also: active nav item and the Sign In CTA were both full-width solid black pills, visually identical. And the panel was `bg-white/75` over a `bg-black/40` scrim, which rendered muddy grey rather than white. Fixed all three, plus added Escape-to-close, body scroll lock, and `aria-controls`.

### 10. Emoji in the UI, against your stated global rule
`✨` in the premium badge, `⭐` in "BEST VALUE" and the plan chip, `✓`/`✗` as text glyphs in the comparison table, `👋` in a modal. Removed. The comparison table's glyphs became labelled "Yes"/"—" cells so screen readers convey the meaning. Also replaced the `from-indigo-600 to-purple-600` gradient on the BEST VALUE badge — indigo/purple is the generic-AI-SaaS default and the only saturated colour in an otherwise monochrome brand.

### 11. (Found while verifying) The grid could hang forever on a slow backend
`loadAllPersonas` only called `setPersonas` **after** awaiting Supabase, then revealed content only after also awaiting `/api/persona-views` — with a comment saying this was deliberate. `INITIAL_PERSONAS` is a static import needing no network. So a slow or unreachable backend left 370+ locally-available personas stuck behind skeletons indefinitely, and a malformed `localStorage` value would throw and freeze the page permanently. Now paints the static catalogue immediately and merges DB personas and stats when they arrive. Also removed ~12 `console.log`/`console.error` calls that were leaking Supabase error details (message/details/hint/code) to the browser console of what is now a public page.

---

## P1 — recommended, not done

**Information architecture is the biggest remaining problem.**

- **40 categories for 372 personas**, rendered as 41 chips in a horizontal strip with a hidden scrollbar. Distribution is wildly skewed (Historical 113, Anime 69) and **15 categories contain exactly one persona**. There are literal duplicates — `Politics` (1) and `Political` (2) — and heavy overlap: `Comedy`/`Humor`/`Fun`/`Meme`/`Entertainment`, `Movies`/`TV`/`Fictional`/`Fantasy`. This needs collapsing to ~8–10 real categories.
- **The home page advertises six categories that do not exist in the data**: "Tech Visionaries", "Scientists & Thinkers", "Historical Figures", "Spiritual Guides", "Fictional Characters", "Companions & Romance". Worse, the cards do not filter — every one links to the same unfiltered page. A category browser that does not browse by category.
- **`FEATURED_PERSONAS` is defined in `personas.js` and never used.** The comment refers to a "For You" section that does not exist. So 372 personas arrive as one flat grid sorted by message count — no featured, trending, or new sections, no result count, no "clear filters" in the empty state.
- **Search only matches name and description** — not category or tags. Typing "anime" or "romance" mostly misses. No clear button, no debounce, no `<label>` (placeholder-only labelling), no `role="search"`, no `aria-live` result count, and the placeholder is randomised on every mount.
- **Filter state is not in the URL** — no shareable or deep-linkable filtered views, and Back does not restore.

**Chat surface**

- **Like/dislike is local state only.** Never persisted, never sent anywhere, lost on reload. A feedback control that does nothing is worse than none — and you are discarding the exact signal you would need to evaluate persona quality.
- **Native `confirm()` for "New Chat"** breaks the design language, and its copy promises "your current conversation will be saved" — which is not true for guests.
- No message timestamps.
- Five icon buttons render permanently under **every** message. Standard is reveal on hover / long-press; as-is it is heavy visual noise inside the reading column.
- On a wide screen the thread has no max-width container: bubbles cap at `max-w-lg` while the column is full-width, so assistant and user bubbles hug opposite edges with a large gulf between. Needs a centred ~48rem column.
- Semantic colours leak into the monochrome system: `green-600` (copied), `blue-100`/`blue-600` (speaking), `red-500` (recording).
- Copy: "These are AI generated responses and not from real person" — missing article, and 10px on mobile.

**Sidebar / history**

- **Recent Chats reads only `localStorage`.** Sign in on another device and your history is gone, even though conversations exist in Supabase. For a signed-in product this reads as data loss.
- No active state for the current conversation; no rename or delete.

**Platform**

- **No dark mode.** `darkMode: 'class'` is configured and `_document.js` ships a blocking script that adds `.dark` based on OS preference — but there are **zero `dark:` variants in the codebase**, so the script does nothing. For a chat app used at night in 2026 this is a real gap; there is also a `DARK-MODE-GUIDE.md` suggesting it was planned.
- No skip-to-content link anywhere.
- **The home page ships 34 elements at `opacity-0`** in the SSR HTML, revealed only by client JS via IntersectionObserver. If JS fails or is slow, the page is blank. Non-rendering crawlers see hidden content — including the GPTBot/ClaudeBot access you just enabled.
- `h-screen` on `/personas` rather than `100dvh` (iOS Safari dynamic-toolbar bug).

---

## P2 — polish and hygiene

- **The declared design system is unused.** `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.card-elevated`, `.input-field`, `.focus-ring`, `.heading-xl/lg/md`, `.body-lg/md`, `.texture-grain`, `.spotlight` — **0 usages each**. `components/ui/Button.jsx` (160 lines) is never imported. Every button is hand-rolled, which is why there are at least six different button treatments. `.focus-ring: 0 usages` is why focus states were missing throughout.
- **Dead code:** `chat/ChatInterface.jsx`, `chat/InputBox.jsx`, `chat/MessageBubble.jsx` (an entire parallel chat implementation), `PersonaCardMinimal`, `HeroChatShowcase`, `ChatMonoliths`, `UserProfileModal`, `SignInPromptModal`.
- **Brand name is inconsistent**: "AI Spirit", "AI-Spirit", "AI - Spirit" (in meta tags), and `esperit` (package name, all `localStorage` keys). Pick one.
- **No wordmark** — the navbar is a logo mark only, and at 40px the white-on-black glyph is hard to read. Weak brand recall.
- The largest, most prominent bento card (the black "350+ Unique Personas" panel) is ~250px of empty black between a small icon and the text. The most valuable real estate on the page carries the least.
- The six coloured dots on the category cards (amber/sky/stone/slate/emerald/rose) are the only colour on the home page, map to nothing, and have no legend.
- "Three steps" card titles are baseline-misaligned across the row (card 03 sits ~25px lower) because `justify-between` reacts to differing description lengths.
- Hero has ~350px of dead gutter between the text column and the phone mockup; the two halves read as disconnected.
- 13 elements below 11px on the home page (10px uppercase eyebrow labels). Defensible as an editorial choice now that contrast passes — flagging for awareness.
- Persona grid: no `priority` on the first row of images (LCP), no blur placeholder.
- Card descriptions are one clipped line at 11px over an arbitrary photo — contrast there is unpredictable by nature. Raised the scrim and allowed 2 lines, but text over images is inherently fragile.

---

## Needs your decision

1. **The testimonials and hero stats look fabricated.** "10K+ Conversations", "4.9★ User Rating", and three named testimonials with specific claims ("We got the deal", city, use-case tag). "350+ personas" checks out — there are 372. The other two I cannot verify, and Priya S./Arjun M./Kavita R. read as invented. If they are not real, this is the single biggest credibility risk on the site and an ASCI/consumer-protection exposure. I deliberately did not touch marketing claims — that is your call, and changing them blind would be wrong in either direction.

2. **Guest chat is dead at three layers, and reviving it is a cost decision.** `lib/guestMessageTracking.js` and `SignInPromptModal` are fully built (100-message limit, paced prompts) but unreachable, because `pages/api/chat.js:56–66` returns 401 without a Bearer token and the page was gated. Letting guests actually chat needs an anonymous API path plus server-side rate limiting — and on your free-tier LLM budget that is an abuse/cost question, not a UI one. I unlocked browsing only.

3. **The free tier advertises "100 messages per day"** on `/premium`. Worth re-checking against your actual provider quota.

---

## Verification performed

- `npx next build` — exit 0, 36 routes, no new warnings (2 pre-existing).
- `npx next lint` on all touched files — clean except 1 pre-existing Razorpay script warning.
- Contrast script re-run: home 54 → 0 failures, premium 8 → 1.
- `/personas` returns 200 anonymously and renders 372 cards as focusable `<a href>` elements.
- Mobile bottom nav measured at 11px / `rgba(0,0,0,0.6)`.
- Mobile menu gap measured closed at 360px and 390px.

Nothing has been committed. 17 files modified.
