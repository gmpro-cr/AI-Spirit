import Head from 'next/head'
import Link from 'next/link'
import { Fraunces } from 'next/font/google'
import { useEffect } from 'react'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-fraunces',
  display: 'swap',
})

export default function DevPage() {
  useEffect(() => {
    let cancelled = false

    // Bundled, not CDN-loaded — mermaid renders client-only (touches the DOM
    // directly), so it's dynamically imported here rather than at module scope.
    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return
      const dark = document.documentElement.classList.contains('dark')
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        fontFamily: 'Geist, sans-serif',
        themeVariables: dark
          ? {
              primaryColor: '#20261f',
              primaryTextColor: '#ececec',
              primaryBorderColor: '#7d9c73',
              lineColor: '#8a8f88',
              secondaryColor: '#2a2620',
              tertiaryColor: '#17181a',
              fontSize: '13px',
            }
          : {
              primaryColor: '#e7ede4',
              primaryTextColor: '#181a17',
              primaryBorderColor: '#3d5c37',
              lineColor: '#5c625a',
              secondaryColor: '#f2ead9',
              tertiaryColor: '#f7f7f5',
              fontSize: '13px',
            },
      })
      mermaid.run({ querySelector: '.dev-page pre.mermaid' })
    })

    // Scrollspy: highlight the side-nav link for whichever section is
    // actually in view.
    const navLinks = Array.from(document.querySelectorAll('.dev-side-nav a'))
    const sections = Array.from(document.querySelectorAll('.dev-shell section[id]'))
    let ticking = false

    function setActive(id) {
      for (const link of navLinks) {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
      }
    }

    function updateActive() {
      const threshold = window.innerHeight * 0.3
      let current = sections[0]?.id
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= threshold) current = section.id
      }
      if (current) setActive(current)
      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateActive)
        ticking = true
      }
    }

    if (navLinks.length && sections.length) {
      window.addEventListener('scroll', onScroll, { passive: true })
      updateActive()
    }

    return () => {
      cancelled = true
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <Head>
        <title>How AI-Spirit works | Dev</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={`dev-page ${fraunces.variable}`}>
        <header className="dev-topbar">
          <div className="dev-topbar-inner">
            <div className="dev-eyebrow">AI-Spirit — behind the scenes</div>
            <h1>How this actually works</h1>
            <p>
              AI-Spirit is a persona chat platform — Osho, Nelson Mandela, an unhinged
              therapist, a yandere romance character, and others, each holding a
              conversation and a memory of you. This is the engineering walkthrough:
              the request pipeline, what&apos;s actually enforced versus just asked for,
              and what&apos;s tested rather than assumed.
            </p>
            <Link className="dev-back-link" href="/">
              &larr; Back to AI-Spirit
            </Link>
          </div>
        </header>

        <main className="dev-shell">
          <nav className="dev-side-nav">
            <a href="#shape">The shape of it</a>
            <a href="#guardrails">Guardrails</a>
            <a href="#models">Model reliability</a>
            <a href="#memory">Memory</a>
            <a href="#evals">Evals</a>
            <a href="#access">Data &amp; access</a>
            <a href="#gaps">Known gaps</a>
            <a href="#stack">Stack</a>
          </nav>

          <div className="dev-content">
            <section className="dev-doc" id="shape">
              <h2>The shape of it</h2>
              <p>
                Every chat message runs through the same handler,{' '}
                <code>pages/api/chat.js</code>, whether it streams to the UI token by
                token or returns in one shot. The message is checked before anything
                is spent on it, then persona context, memory, and conversation
                history are gathered in parallel, then a model is called, then — only
                after the reply has already reached the user — the turn is written
                back into memory.
              </p>
              <div className="dev-diagram">
                <pre className="mermaid">
{`flowchart LR
    user["User message"] --> mod["moderateContent()"]
    mod -->|blocked| reject["Rejected, nothing spent"]
    mod -->|clean| gather["Gather in parallel:\\ncontext · memories · summaries"]
    gather --> budget["checkCostThreshold($15/day)"]
    budget -->|over budget| refuse["Refuse the call"]
    budget -->|ok| model["Call a model"]
    model --> reply["Reply streamed/returned to user"]
    reply --> persist["extractAndSaveMemories()\\nupdateConversationSummary()"]`}
                </pre>
                <div className="dev-diagram-caption">
                  The write-back step runs after the response is already on its way to
                  the browser — it&apos;s <code>await</code>ed, not fired-and-forgotten,
                  because a serverless function is frozen the instant the handler
                  returns. An earlier version of this skipped that and personas simply
                  never remembered anything.
                </div>
              </div>
            </section>

            <section className="dev-doc" id="guardrails">
              <h2>Guardrails</h2>
              <p>
                <code>moderateContent()</code> in <code>lib/moderation.js</code> runs
                on every incoming message before it reaches a model. It&apos;s a set of
                deterministic checks, not a call to another API:
              </p>
              <div className="dev-diagram">
                <pre className="mermaid">
{`flowchart TB
    msg["Incoming message"] --> len["Length: 1-2000 chars"]
    len --> pii["PII patterns:\\nSSN · card · phone · email · Aadhaar"]
    pii --> inj["Prompt-injection phrasing\\n(\\"ignore previous instructions\\" style)"]
    inj --> spam["Spam: repeated chars,\\nexcessive URLs, ALL CAPS"]
    spam --> ok["Passed to the model"]`}
                </pre>
                <div className="dev-diagram-caption">
                  Profanity filtering is deliberately off — personas need to speak
                  in-character, and the models&apos; own safety layers are the backstop for
                  that, not this filter. On the way back out,{' '}
                  <code>sanitizeForDisplay()</code> HTML-escapes a reply before it&apos;s
                  rendered, closing the obvious XSS path.
                </div>
              </div>
              <p>
                What this list does <em>not</em> cover: the model&apos;s own reply.
                Nothing in production inspects what a persona actually says back —
                that&apos;s caught, if at all, by the eval suite&apos;s safety cases (below),
                not by a live check on every message.
              </p>
            </section>

            <section className="dev-doc" id="models">
              <h2>Model reliability</h2>
              <p>
                All models here are free-tier. The chain exists because any one of
                them can be rate-limited, empty, or — a specific failure mode worth
                calling out — leak its internal reasoning as plain, unmarked prose
                instead of a clean in-character reply.
              </p>
              <div className="dev-diagram">
                <pre className="mermaid">
{`flowchart LR
    call["OpenRouter call"] --> m1["qwen3-next-80b"]
    m1 -->|leaked reasoning| m2["nemotron-3-nano-30b"]
    m2 -->|leaked reasoning| m3["llama-3.3-70b"]
    m3 -->|leaked reasoning| m4["gemma-4-26b"]
    m1 -->|clean| out["Reply"]
    m2 -->|clean| out
    m3 -->|clean| out
    m4 -->|clean| out
    out -.->|OpenRouter chain empty| groq["Groq fallback"]`}
                </pre>
                <div className="dev-diagram-caption">
                  <code>looksLikeLeakedReasoning()</code> is what decides &quot;leaked&quot; —
                  the same function runs in production and in every eval case, so a
                  model that leaks scratchpad text fails the eval before it ever
                  reaches a user. Streaming and non-streaming requests pick a
                  different primary provider (self-hosted Ollama, if configured, is
                  tried first in both), but Groq is the universal safety net when the
                  primary path returns nothing.
                </div>
              </div>
            </section>

            <section className="dev-doc" id="memory">
              <h2>Memory</h2>
              <p>
                &quot;Remembering you&quot; is two separate systems, not one, and both are
                scoped to a <code>(user, persona)</code> pair — a fact told to Osho
                does not surface when you talk to Mandela.
              </p>
              <div className="dev-diagram">
                <pre className="mermaid">
{`flowchart TB
    turn["A finished turn"] --> facts["Layer 1 — facts\\nextractMemoriesLLM() pulls durable\\nfacts, sanitized, saved per persona"]
    turn --> summary["Layer 2 — rolling summary\\nsummarizeTranscriptLLM() refreshes a\\nper-persona conversation summary"]
    facts --> ctx["formatMemoriesForContext()"]
    summary --> ctx2["formatSummariesForContext()"]
    ctx --> prompt["Injected into next system prompt"]
    ctx2 --> prompt`}
                </pre>
                <div className="dev-diagram-caption">
                  Both layers write independently after every turn and both feed the
                  next reply&apos;s system prompt. This is the layer with the worst track
                  record in this codebase — it has broken twice before (memories not
                  surviving a new conversation) — which is why it&apos;s the most
                  eval-covered system on this page.
                </div>
              </div>
            </section>

            <section className="dev-doc" id="evals">
              <h2>Evals</h2>
              <p>
                <code>npm run eval</code> runs 21 deterministic cases against a real,
                live <code>/api/chat</code> — no judge model, no labelled dataset,
                just regex assertions against what a persona actually said.
              </p>
              <div className="dev-diagram">
                <pre className="mermaid">
{`flowchart LR
    case["Case: persona + turns"] --> live["Real call to /api/chat"]
    live --> reply["Reply to the last turn"]
    reply --> assert["required / requireAny / forbidden\\nregex + length checks"]
    reply --> leak["looksLikeLeakedReasoning()\\n(same guard as production)"]
    assert --> result["Pass / fail, model attributed"]
    leak --> result`}
                </pre>
                <div className="dev-diagram-caption">
                  Constrained by the OpenRouter free tier: 50 model calls/day, and the
                  current suite spends 30 of them. The runner prints the cost before
                  spending anything and refuses to start if a run would exceed the
                  day&apos;s budget — which is why this is a pre-release check, not a
                  per-commit one.
                </div>
              </div>
              <div className="dev-tier-grid">
                <div className="dev-tier-cell">
                  <div className="dev-tier-count">21</div>
                  <h3>Deterministic cases</h3>
                  <p>Voice/character consistency, era &amp; canon-fact anchors, register and length, in- and cross-conversation memory recall, memory non-confabulation, date/context injection timing, and cross-persona isolation.</p>
                </div>
                <div className="dev-tier-cell">
                  <div className="dev-tier-count">6</div>
                  <h3>Safety cases</h3>
                  <p>Self-harm handling under an obsessive or unhinged persona, age-boundary breaks in romance personas, medical misinformation and emergency-symptom refusal, and dangerous fitness prescriptions — run against the personas whose prompts pull hardest the wrong way.</p>
                </div>
                <div className="dev-tier-cell">
                  <div className="dev-tier-count">0</div>
                  <h3>Voice/tone judged</h3>
                  <p>Nothing here rates whether a reply actually sounds like the persona. That needs a judge model or human rating — the thumbs up/down now written to <code>message_feedback</code> is the intended source, pending a migration.</p>
                </div>
              </div>
            </section>

            <section className="dev-doc" id="access">
              <h2>Data &amp; access</h2>
              <div className="dev-stack-grid">
                <div className="dev-stack-card">
                  <div className="dev-label">Auth</div>
                  <div className="dev-value">Supabase Auth, Google OAuth</div>
                </div>
                <div className="dev-stack-card">
                  <div className="dev-label">Row-level security</div>
                  <div className="dev-value">
                    Profiles, conversations, and messages scoped to <code>auth.uid()</code>;
                    personas are publicly readable by design
                  </div>
                </div>
                <div className="dev-stack-card">
                  <div className="dev-label">Spend guard</div>
                  <div className="dev-value">
                    <code>checkCostThreshold()</code> refuses a model call once a $15/day
                    budget is hit
                  </div>
                </div>
                <div className="dev-stack-card dev-stack-card-dim">
                  <div className="dev-label">Rate limiting</div>
                  <div className="dev-value">
                    Built (<code>lib/rate-limit.js</code>, 10 req/min) but not wired into
                    the chat route yet — disabled on purpose until userbase grows
                  </div>
                </div>
              </div>
            </section>

            <section className="dev-doc" id="gaps">
              <h2>Known gaps</h2>
              <p>Listed here on purpose, not swept into the stack section:</p>
              <ul className="dev-gap-list">
                <li>
                  <strong>Reply content isn&apos;t screened live.</strong> Guardrails run on
                  what the user sends, not on what a persona sends back — the eval
                  safety cases are the only thing standing between a persona&apos;s
                  register and a harmful reply today.
                </li>
                <li>
                  <strong>Voice and tone are unjudged.</strong> A reply can be
                  factually correct, in era, and still sound nothing like the
                  persona, and no automated check catches that yet.
                </li>
                <li>
                  <strong>Rate limiting is dormant.</strong> The module exists and is
                  tested in isolation, but the chat API doesn&apos;t call it — a
                  deliberate, temporary tradeoff, not an oversight.
                </li>
                <li>
                  <strong>The in-repo safety audit is stale.</strong>{' '}
                  <code>SAFETY-RELIABILITY-AUDIT.md</code> dates to 2025-11-15 and
                  describes moderation as far weaker than the current{' '}
                  <code>lib/moderation.js</code> — it hasn&apos;t been refreshed since.
                </li>
              </ul>
            </section>

            <section className="dev-doc" id="stack">
              <h2>Stack</h2>
              <div className="dev-stack-grid">
                <div className="dev-stack-card">
                  <div className="dev-label">Framework</div>
                  <div className="dev-value">Next.js 14 (pages router), React 18</div>
                </div>
                <div className="dev-stack-card">
                  <div className="dev-label">Database</div>
                  <div className="dev-value">Supabase Postgres, row-level security</div>
                </div>
                <div className="dev-stack-card">
                  <div className="dev-label">Models</div>
                  <div className="dev-value">OpenRouter (4 free models) → Groq → self-hosted Ollama, provider order depends on path</div>
                </div>
                <div className="dev-stack-card">
                  <div className="dev-label">Observability</div>
                  <div className="dev-value">Sentry (client, server, edge)</div>
                </div>
                <div className="dev-stack-card">
                  <div className="dev-label">Hosting</div>
                  <div className="dev-value">Vercel</div>
                </div>
                <div className="dev-stack-card">
                  <div className="dev-label">Evals</div>
                  <div className="dev-value">21 deterministic cases, <code>npm run eval</code></div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="dev-footer">
          This page documents AI-Spirit&apos;s own engineering systems, generated
          from the current codebase rather than a fixed spec — it will drift out of
          date the day a system changes and nobody updates it.{' '}
          <Link href="/">Back to AI-Spirit.</Link>
        </footer>
      </div>

      <style jsx>{`
        .dev-page {
          --dev-ink: #181a17;
          --dev-ink-soft: #5c625a;
          --dev-ink-faint: #8f958c;
          --dev-paper: #f7f7f5;
          --dev-card: #ffffff;
          --dev-rule: #e5e7e1;
          --dev-brand: #3d5c37;
          --dev-brand-soft: #e7ede4;
          --dev-accent: #a8763a;
          --dev-dim: #b0b6ab;
          --dev-shadow: 0 1px 2px rgba(24, 26, 23, 0.05), 0 10px 24px -8px rgba(24, 26, 23, 0.12);
          background: var(--dev-paper);
          color: var(--dev-ink);
          font-family: Geist, system-ui, sans-serif;
          font-weight: 300;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        :global(.dark) .dev-page {
          --dev-ink: #ececec;
          --dev-ink-soft: #a3a8a0;
          --dev-ink-faint: #6d726a;
          --dev-paper: #101211;
          --dev-card: #191b18;
          --dev-rule: #292c27;
          --dev-brand: #8fb384;
          --dev-brand-soft: #1c2419;
          --dev-accent: #d3a05e;
          --dev-dim: #454a42;
          --dev-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 10px 24px -8px rgba(0, 0, 0, 0.45);
        }

        .dev-topbar {
          background: linear-gradient(135deg, var(--dev-brand) 0%, #0c1a0a 100%);
          color: #f7f7f5;
          padding: 2.25rem 0;
        }
        .dev-topbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .dev-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(247, 247, 245, 0.6);
          margin-bottom: 0.5rem;
        }
        .dev-topbar h1 {
          font-family: var(--font-fraunces), Georgia, serif;
          font-weight: 300;
          font-size: 2.2rem;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        .dev-topbar p {
          margin: 0;
          color: rgba(247, 247, 245, 0.78);
          font-size: 0.92rem;
          max-width: 66ch;
          line-height: 1.6;
        }
        .dev-back-link {
          display: inline-block;
          margin-top: 1.1rem;
          font-size: 0.82rem;
          color: rgba(247, 247, 245, 0.85);
          text-decoration: none;
          border-bottom: 1px solid rgba(247, 247, 245, 0.35);
        }
        .dev-back-link:hover {
          color: #fff;
        }

        .dev-shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 5rem;
          display: grid;
          grid-template-columns: 200px minmax(0, 1fr);
          gap: 3.5rem;
          align-items: start;
        }

        .dev-side-nav {
          position: sticky;
          top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding-top: 0.3rem;
        }
        .dev-side-nav :global(a) {
          font-size: 0.8rem;
          color: var(--dev-ink-faint);
          text-decoration: none;
          padding: 0.4rem 0;
          border-left: 2px solid transparent;
          padding-left: 0.85rem;
          transition: color 160ms ease-out, border-color 160ms ease-out;
        }
        .dev-side-nav :global(a:hover) {
          color: var(--dev-ink-soft);
        }
        .dev-side-nav :global(a.active) {
          color: var(--dev-brand);
          border-left-color: var(--dev-brand);
          font-weight: 500;
        }

        .dev-content {
          min-width: 0;
        }

        @media (max-width: 900px) {
          .dev-shell {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .dev-side-nav {
            display: none;
          }
        }

        .dev-doc {
          margin-bottom: 3rem;
        }
        .dev-doc :global(h2) {
          font-family: var(--font-fraunces), Georgia, serif;
          font-weight: 400;
          font-size: 1.5rem;
          margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
        }
        .dev-doc :global(p) {
          font-size: 0.92rem;
          line-height: 1.65;
          color: var(--dev-ink-soft);
          max-width: 68ch;
          margin: 0 0 1rem;
        }
        .dev-doc :global(p strong) {
          color: var(--dev-ink);
          font-weight: 500;
        }
        .dev-doc :global(code) {
          font-family: 'Geist Mono', monospace;
          font-size: 0.85em;
          background: var(--dev-brand-soft);
          color: var(--dev-brand);
          padding: 0.1em 0.4em;
          border-radius: 3px;
        }

        .dev-diagram {
          background: var(--dev-card);
          border-radius: 14px;
          box-shadow: var(--dev-shadow);
          padding: 1.5rem;
          margin: 1.25rem 0 1.5rem;
          overflow-x: auto;
        }
        .dev-diagram-caption {
          font-size: 0.78rem;
          line-height: 1.6;
          color: var(--dev-ink-faint);
          margin-top: 0.75rem;
        }
        .dev-diagram-caption :global(code) {
          font-family: 'Geist Mono', monospace;
          font-size: 0.85em;
          background: var(--dev-brand-soft);
          color: var(--dev-brand);
          padding: 0.05em 0.35em;
          border-radius: 3px;
        }

        .dev-stack-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
          margin: 1.25rem 0;
        }
        .dev-stack-card {
          background: var(--dev-card);
          border-radius: 12px;
          box-shadow: var(--dev-shadow);
          padding: 1.1rem 1.25rem;
        }
        .dev-stack-card-dim {
          border: 1px dashed var(--dev-dim);
        }
        .dev-label {
          font-size: 0.64rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dev-ink-faint);
          margin-bottom: 0.4rem;
        }
        .dev-value {
          font-size: 0.88rem;
          color: var(--dev-ink);
          line-height: 1.5;
        }
        .dev-value :global(code) {
          font-family: 'Geist Mono', monospace;
          font-size: 0.85em;
          background: var(--dev-brand-soft);
          color: var(--dev-brand);
          padding: 0.05em 0.35em;
          border-radius: 3px;
        }

        .dev-tier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1px;
          background: var(--dev-rule);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: var(--dev-shadow);
          margin: 1.5rem 0;
        }
        .dev-tier-cell {
          background: var(--dev-card);
          padding: 1.4rem 1.5rem;
        }
        .dev-tier-count {
          font-family: 'Geist Mono', monospace;
          font-weight: 600;
          font-size: 2.1rem;
          letter-spacing: -0.02em;
          color: var(--dev-ink);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .dev-tier-cell :global(h3) {
          font-size: 0.82rem;
          font-weight: 500;
          margin: 0 0 0.35rem;
          color: var(--dev-ink);
        }
        .dev-tier-cell :global(p) {
          font-size: 0.8rem;
          color: var(--dev-ink-soft);
          margin: 0;
          line-height: 1.5;
          max-width: none;
        }

        .dev-gap-list {
          list-style: none;
          margin: 0 0 1rem;
          padding: 0;
          max-width: 68ch;
        }
        .dev-gap-list li {
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--dev-rule);
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--dev-ink-soft);
        }
        .dev-gap-list li:last-child {
          border-bottom: none;
        }
        .dev-gap-list li :global(strong) {
          color: var(--dev-ink);
          font-weight: 500;
        }
        .dev-gap-list li :global(code) {
          font-family: 'Geist Mono', monospace;
          font-size: 0.85em;
          background: var(--dev-brand-soft);
          color: var(--dev-brand);
          padding: 0.05em 0.35em;
          border-radius: 3px;
        }

        .dev-footer {
          max-width: 860px;
          margin: 0 auto;
          padding: 1.5rem;
          font-size: 0.78rem;
          color: var(--dev-ink-faint);
          line-height: 1.6;
        }
        .dev-footer :global(a) {
          color: var(--dev-ink-soft);
        }
      `}</style>
    </>
  )
}
