// Public, read-only conversation share page.
// Marketing surface — every shared chat becomes an SEO + social impression.
//
// Privacy model:
//   - Conversations are private by default (is_public=false).
//   - Owner explicitly opts in via /api/share/enable.
//   - Only is_public=true conversations are visible here.
//   - No user identity is exposed (no name, no email, no avatar).

import Link from 'next/link'
import { NextSeo } from 'next-seo'
import DOMPurify from 'isomorphic-dompurify'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabaseAdmin } from '@/lib/supabase'
import { INITIAL_PERSONAS } from '@/data/personas'

const SITE_URL = 'https://ai-spirit.in'
const MAX_PREVIEW_LENGTH = 240

function formatContent(content) {
  if (!content) return ''
  const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  return DOMPurify.sanitize(formatted)
}

function firstMeaningfulLine(messages) {
  const first = messages?.[0]?.content || ''
  return first.replace(/\s+/g, ' ').slice(0, MAX_PREVIEW_LENGTH)
}

export default function SharedConversation({ persona, messages, conversationId, notFound }) {
  if (notFound) {
    return (
      <>
        <NextSeo
          title="Conversation not available | AI Spirit"
          description="This conversation isn't available or hasn't been shared publicly."
          noindex
        />
        <Navbar />
        <main className="min-h-[80vh] bg-white pt-24 pb-16 flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-display text-3xl md:text-4xl text-black mb-4">Conversation not available</h1>
          <p className="text-black/50 max-w-md mb-8">
            This conversation isn&apos;t public, or the link is no longer valid.
          </p>
          <Link
            href="/personas"
            className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black/90 transition-colors"
          >
            Browse personas
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const title = `Conversation with ${persona.name} | AI Spirit`
  const description = `A conversation with ${persona.name} on AI Spirit. ${firstMeaningfulLine(messages)}`
  const canonical = `${SITE_URL}/share/${conversationId}`
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(`Talk to ${persona.name}`)}&description=${encodeURIComponent(persona.description || '')}&persona=${encodeURIComponent(persona.name)}&avatar=${encodeURIComponent(persona.avatar_url || '')}`

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={canonical}
        openGraph={{
          type: 'article',
          url: canonical,
          title,
          description,
          images: [{ url: ogImage, width: 1200, height: 630, alt: `Conversation with ${persona.name}` }],
        }}
        // Public share pages are noindexed by default — they're for social sharing, not SEO.
        // Most chat content is too thin to rank and would dilute the /talk-to/* equity.
        noindex
      />

      <Navbar />

      <main className="bg-white pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          {/* Header */}
          <header className="mb-10 pb-8 border-b border-black/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">Shared conversation</p>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-black/[0.06] bg-black/[0.02] flex-shrink-0">
                {persona.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={persona.image_url} alt={persona.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-display text-black/30">
                    {persona.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl md:text-3xl text-black leading-tight">
                  Conversation with {persona.name}
                </h1>
                {persona.description && (
                  <p className="text-sm text-black/50 mt-1 line-clamp-2">{persona.description}</p>
                )}
              </div>
            </div>
          </header>

          {/* Messages */}
          <div className="space-y-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-black/[0.06] flex-shrink-0">
                    {persona.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={persona.image_url} alt={persona.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-display text-black/40">
                        {persona.name[0]}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-black text-white rounded-br-sm'
                      : 'bg-black/[0.03] text-black rounded-bl-sm border border-black/[0.05]'
                  }`}
                >
                  <p
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-black/[0.85] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 p-1.5 rounded-3xl ring-1 ring-black/[0.06] bg-black/[0.02]">
            <div className="bg-white rounded-[calc(1.5rem-0.375rem)] border border-black/[0.05] px-8 py-10 text-center">
              <h2 className="font-display text-2xl md:text-3xl text-black mb-3">
                Start your own conversation with {persona.name}
              </h2>
              <p className="text-black/50 mb-7 max-w-md mx-auto">
                Pick up where this conversation left off, or ask {persona.name} something new. It&apos;s free to try.
              </p>
              <Link
                href={`/talk-to/${persona.slug}`}
                className="group inline-flex items-center gap-3 bg-black text-white pl-6 pr-2 py-2 rounded-full text-sm font-medium hover:bg-black/90 transition-colors"
              >
                <span>Talk to {persona.name}</span>
                <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-transform">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </Link>
              <p className="text-xs text-black/30 mt-5">
                <Link href="/personas" className="hover:text-black/60 transition-colors underline underline-offset-2">
                  Or browse all personas
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export async function getServerSideProps({ params, res }) {
  const { id } = params

  // Short browser cache + longer CDN cache. Conversations don't change after share.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')

  if (!supabaseAdmin) {
    return { props: { notFound: true } }
  }

  // Load conversation (must be public)
  const { data: conversation, error: convErr } = await supabaseAdmin
    .from('conversations')
    .select('id, persona_slug, is_public, created_at')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle()

  if (convErr || !conversation) {
    return { props: { notFound: true } }
  }

  // Load messages
  const { data: messages, error: msgErr } = await supabaseAdmin
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
    .limit(200)

  if (msgErr) {
    console.error('[Share] Failed to load messages:', msgErr)
    return { props: { notFound: true } }
  }

  // Resolve persona — seed-data first, DB fallback
  let persona = INITIAL_PERSONAS.find((p) => p.slug === conversation.persona_slug) || null
  if (!persona) {
    const { data: dbPersona } = await supabaseAdmin
      .from('personas')
      .select('name, slug, category, description, avatar_url, image_url')
      .eq('slug', conversation.persona_slug)
      .single()
    if (dbPersona) persona = dbPersona
  }

  if (!persona) {
    return { props: { notFound: true } }
  }

  return {
    props: {
      conversationId: id,
      persona: {
        name: persona.name,
        slug: persona.slug,
        category: persona.category || null,
        description: persona.description || null,
        avatar_url: persona.avatar_url || null,
        image_url: persona.image_url || null,
      },
      messages: (messages || []).map((m) => ({ role: m.role, content: m.content })),
    },
  }
}
