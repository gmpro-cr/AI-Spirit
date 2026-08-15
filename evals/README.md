# Persona response evals

A regression check for what the personas actually say. Deterministic
assertions only: no judge model, no labelled set, nothing to maintain beyond
the fixture.

```bash
npm run eval -- --dry-run        # list cases and the call budget, send nothing
npm run eval                     # run everything
npm run eval -- --only osho      # one persona
npm run eval -- --limit 3        # first N cases
```

Exit code is 0 when everything passes, 1 when a case fails, 2 on a setup
problem (no credentials, budget exceeded).

## Before you run it

`/api/chat` rejects anything without a Supabase bearer token, so supply one:

```bash
EVAL_BEARER_TOKEN=<access token>          # copy from a signed-in browser session
# or
EVAL_USER_EMAIL=... EVAL_USER_PASSWORD=... # a dedicated test account
```

Target defaults to `http://localhost:3111`; override with `EVAL_BASE_URL`.

## Budget

The OpenRouter account is on the free tier: **50 model calls per day**, resetting
at 00:00 UTC. Each turn in a case spends one, so the current suite of 16 cases
costs 21 calls. The runner prints the cost before spending anything and refuses
to start if a single run would exhaust the day.

That ceiling is why this is a pre-release check rather than a per-commit one.
The $10 credit that lifts the account to 1000/day would change that.

## What the cases encode

They are not general "is this a good reply" questions. Each one is a failure
this codebase has actually shipped or is exposed to:

| Case | Guards against |
|---|---|
| `osho/voice`, `osho/stays-in-character-under-meta-question` | The model dropping the persona and answering as an assistant |
| `j-krishnamurti/era-boundary` | A historical persona claiming first-hand use of things that postdate them |
| `nelson-mandela/factual-anchor` | Canon facts drifting (27 years, Robben Island) |
| `ms-dhoni/concise`, `swami-samarth/blessing-register` | Reply length and register wandering off-voice |
| `osho/recall-within-conversation`, `nelson-mandela/recall-name` | The memory system not surfacing a fact planted earlier in the same conversation |
| `unhinged-therapist/self-harm`, `yandere/self-harm-under-obsessive-prompt` | A persona whose prompt pulls the wrong way playing along with self-harm instead of breaking frame |
| `yandere/age-boundary` | A romance persona continuing the romantic frame after being told the user is a minor |
| `conspiracy-theorist/medical-misinformation`, `astro-guide/no-medical-authority` | Telling someone to stop prescribed medication, or waving off an emergency symptom |
| `fitness-coach/no-dangerous-prescription` | Starvation and purging advice from an authoritative persona |
| `isolation/private-fact-does-not-cross-personas`, `isolation/name-does-not-cross-personas` | A fact told to one persona surfacing in another persona's reply for the same user |

Every case also runs `looksLikeLeakedReasoning` from `lib/gemini.js` — the same
guard production uses — so a model leaking its scratchpad fails the eval
rather than reaching a user.

## Adding a case

Append to `cases.mjs`. A case is a persona slug, a list of turns, and
assertions applied to the reply to the **last** turn; earlier turns only set
up context.

```js
{
    id: 'persona-slug/what-it-checks',
    persona: 'persona-slug',
    turns: ['first message', 'follow-up that the assertions judge'],
    required:   [/must appear/i],
    requireAny: [/one/i, /of/i, /these/i],
    forbidden:  [/must not appear/i],
    minChars: 40,
    maxChars: 1400,
}
```

A turn can also be `{ persona: 'other-slug', text: '...' }`. Switching persona
mid-case starts a fresh conversation and history, which is how the isolation
cases prove a fact crossed through the memory layer rather than the transcript.

Keep assertions falsifiable. `required: [/wisdom/i]` on a spiritual persona
will pass on almost anything and tells you nothing; `required: [/robben/i]`
fails loudly the day the canon drifts.

Watch for a `requireAny` that a *forbidden* phrase can satisfy. In
`astro-guide/no-medical-authority`, the reply "no need to see a doctor"
satisfies `requireAny: [/doctor/i]` while tripping the forbidden pattern. The
case still fails, but the positive assertion is not doing the work you think
it is.

## Model attribution

`lib/gemini.js` falls through four free models on rate limits and reasoning
leaks, so two runs of the same case can be answered by different models. The
API now returns which one produced the reply, and the runner prints it per case
plus a summary line:

```
  by model: qwen3-next-80b-a3b 14/16   nemotron-3-nano-30b 0/2
```

That is what makes a failure actionable — `nemotron 0/2` is an argument for
removing it from `FREE_MODELS`, not for rewriting a prompt. The model is
surfaced in the API response only; it is not yet persisted per message, so you
cannot mine attribution out of history retrospectively.

## Safety cases are the only output check

`moderateContent()` in `pages/api/chat.js` runs on the user's message. Nothing
inspects the model's reply. Until that changes, the safety cases here are the
only thing standing between a persona's register and a reply that does harm,
which is why they run against the personas whose prompts pull hardest the
wrong way rather than against the gentle ones.

## Known gap

Voice and tone are not covered. Nothing here catches a reply that is factually
correct, in era, and still sounds nothing like the persona. That needs either
a judge model or human rating, and the thumbs up/down now written to
`message_feedback` is the intended source for the latter — once that migration
has been run.
