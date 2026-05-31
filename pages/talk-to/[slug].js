import Head from 'next/head'
import Link from 'next/link'
import { INITIAL_PERSONAS } from '@/data/personas'
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { PersonaSchema, FAQSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'

const SITE_URL = 'https://ai-spirit.in'

function buildFaqs(persona) {
  const name = persona.name
  const category = persona.category || 'AI persona'
  return [
    {
      question: `Who is ${name}?`,
      answer: `${persona.description || `${name} is an AI persona on AI Spirit you can talk to anytime.`} ${name} is part of the ${category} category and responds in a voice and style true to character.`,
    },
    {
      question: `How do I chat with ${name}?`,
      answer: `Click the "Start chatting" button on this page, sign in, and start a conversation. ${name} will reply in real time. Conversations are private to you.`,
    },
    {
      question: `Is chatting with ${name} free?`,
      answer: `Yes. AI Spirit is free to use. You can chat with ${name} and any other persona without paying. Premium plans are available for unlimited messages and advanced features.`,
    },
    {
      question: `What language can I talk to ${name} in?`,
      answer: `${name} understands English by default and many personas also reply in Hindi and other Indian languages. Just type in your preferred language and ${name} will respond in kind.`,
    },
    {
      question: `Will ${name} remember our previous conversations?`,
      answer: `Yes — when you are signed in, ${name} remembers what you've talked about before and picks up where you left off. Guest conversations are stored only on your device.`,
    },
  ]
}

function getRelatedPersonas(currentSlug, currentCategory, all, count = 6) {
  return all
    .filter((p) => !p.hidden && p.slug !== currentSlug)
    .sort((a, b) => {
      // same category first, then everything else
      const aSame = a.category === currentCategory ? 0 : 1
      const bSame = b.category === currentCategory ? 0 : 1
      return aSame - bSame
    })
    .slice(0, count)
}

export default function TalkToPersonaPage({ persona, related }) {
  if (!persona) return null

  const title = `Talk to ${persona.name} AI — Chat Online | AI Spirit`
  const description = persona.description
    ? `Chat with ${persona.name} on AI Spirit. ${persona.description}. Free, private, available anytime.`
    : `Have a real conversation with ${persona.name} on AI Spirit — free, private, and available 24/7.`
  const canonical = `${SITE_URL}/talk-to/${persona.slug}`
  const chatHref = `/chat/${persona.slug}`
  const faqs = buildFaqs(persona)

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content={`talk to ${persona.name}, ${persona.name} AI, chat with ${persona.name}, ${persona.name} chatbot, AI ${persona.category || 'persona'}, ${persona.name.toLowerCase()} AI online`}
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta
          property="og:image"
          content={`${SITE_URL}/api/og?title=${encodeURIComponent(`Talk to ${persona.name}`)}&description=${encodeURIComponent(persona.description || '')}&persona=${encodeURIComponent(persona.name)}&avatar=${encodeURIComponent(persona.avatar_url || '')}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>

      <PersonaSchema
        persona={{
          name: persona.name,
          description: persona.description,
          image: persona.image_url ? `${SITE_URL}${persona.image_url}` : null,
          slug: persona.slug,
          category: persona.category,
        }}
      />
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${SITE_URL}/` },
          { name: 'Personas', url: `${SITE_URL}/personas` },
          { name: persona.name, url: canonical },
        ]}
      />

      <Navbar />

      <main className="pt-24 pb-16 bg-white">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6">
          <nav className="text-xs text-black/40 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link href="/personas" className="hover:text-black transition-colors">Personas</Link>
            <span>/</span>
            <span className="text-black/60">{persona.name}</span>
          </nav>

          <div className="grid md:grid-cols-[auto,1fr] gap-8 md:gap-12 items-start mb-12">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden ring-1 ring-black/[0.06] bg-black/[0.02] flex-shrink-0">
              {persona.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={persona.image_url}
                  alt={`${persona.name} AI persona avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-display text-black/30">
                  {persona.name[0]}
                </div>
              )}
            </div>

            <div>
              {persona.category && (
                <span className="inline-block rounded-full bg-black/[0.04] text-black/60 text-[10px] uppercase tracking-[0.2em] px-3 py-1 mb-4">
                  {persona.category}
                </span>
              )}
              <h1 className="font-display text-4xl md:text-6xl tracking-tight text-black leading-[1.05] mb-4">
                Talk to {persona.name}
              </h1>
              {persona.description && (
                <p className="text-lg md:text-xl text-black/60 leading-relaxed mb-8 max-w-2xl">
                  {persona.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={chatHref}
                  className="group inline-flex items-center gap-3 bg-black text-white pl-6 pr-2 py-2 rounded-full text-sm font-medium tracking-wide hover:bg-black/90 transition-colors"
                >
                  <span>Start chatting with {persona.name}</span>
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/personas"
                  className="inline-flex items-center text-sm text-black/50 hover:text-black px-4 py-3 transition-colors"
                >
                  Browse all personas →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About / first impression */}
        <section className="max-w-3xl mx-auto px-6 py-12 border-t border-black/[0.06]">
          <h2 className="font-display text-2xl md:text-3xl text-black mb-4">About {persona.name}</h2>
          <p className="text-black/60 leading-relaxed text-base md:text-lg">
            {persona.description || `${persona.name} is one of the personas on AI Spirit — an AI character you can have real, ongoing conversations with.`}{' '}
            On AI Spirit, every conversation with {persona.name} is private to you, runs in real time, and {persona.name} remembers your context across chats when you&apos;re signed in. Whether you&apos;re looking for advice, curiosity, comfort, or just a great conversation, {persona.name} is ready when you are.
          </p>
        </section>

        {/* Conversation starters */}
        {persona.conversation_starters?.length > 0 && (
          <section className="max-w-3xl mx-auto px-6 py-12 border-t border-black/[0.06]">
            <h2 className="font-display text-2xl md:text-3xl text-black mb-2">
              What to ask {persona.name}
            </h2>
            <p className="text-sm text-black/40 mb-8">A few openers to get the conversation going.</p>
            <ul className="space-y-3">
              {persona.conversation_starters.map((q, i) => (
                <li key={i}>
                  <Link
                    href={chatHref}
                    className="block p-1.5 rounded-[1.25rem] ring-1 ring-black/[0.06] bg-black/[0.02] hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="bg-white rounded-[calc(1.25rem-0.375rem)] border border-black/[0.05] px-5 py-4 text-black/80 text-base">
                      &ldquo;{q}&rdquo;
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related personas — internal linking is SEO gold */}
        {related.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-black/[0.06]">
            <h2 className="font-display text-2xl md:text-3xl text-black mb-2">
              You might also like
            </h2>
            <p className="text-sm text-black/40 mb-8">Other personas worth talking to.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/talk-to/${p.slug}`}
                  className="group block p-1.5 rounded-2xl ring-1 ring-black/[0.06] bg-black/[0.02] hover:-translate-y-0.5 transition-transform"
                >
                  <div className="bg-white rounded-[calc(1rem-0.375rem)] border border-black/[0.05] px-4 py-4">
                    <div className="text-[10px] uppercase tracking-widest text-black/30 mb-1">
                      {p.category || 'Persona'}
                    </div>
                    <div className="font-display text-base text-black mb-1 group-hover:opacity-70 transition-opacity">
                      {p.name}
                    </div>
                    {p.description && (
                      <div className="text-xs text-black/45 line-clamp-2">{p.description}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-12 border-t border-black/[0.06]">
          <h2 className="font-display text-2xl md:text-3xl text-black mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group p-1.5 rounded-2xl ring-1 ring-black/[0.06] bg-black/[0.02]"
              >
                <summary className="cursor-pointer list-none bg-white rounded-[calc(1rem-0.375rem)] border border-black/[0.05] px-5 py-4 flex items-center justify-between text-black font-medium text-base">
                  <span>{faq.question}</span>
                  <span className="text-black/30 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pt-3 pb-4 text-black/60 leading-relaxed text-sm">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-black/[0.06] text-center">
          <h2 className="font-display text-3xl md:text-4xl text-black mb-4">
            Ready when you are.
          </h2>
          <p className="text-black/50 mb-8">
            Start your first conversation with {persona.name} — it&apos;s free.
          </p>
          <Link
            href={chatHref}
            className="group inline-flex items-center gap-3 bg-black text-white pl-6 pr-2 py-2 rounded-full text-sm font-medium tracking-wide hover:bg-black/90 transition-colors"
          >
            <span>Start chatting</span>
            <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-transform">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </span>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  )
}

export async function getStaticPaths() {
  const paths = INITIAL_PERSONAS.filter((p) => !p.hidden).map((p) => ({
    params: { slug: p.slug },
  }))

  return {
    paths,
    // Custom personas in DB get rendered on first request and then cached
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params

  let persona = INITIAL_PERSONAS.find((p) => p.slug === slug && !p.hidden) || null

  if (!persona && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data } = await supabase
        .from('personas')
        .select('name, slug, category, description, avatar_url, image_url, conversation_starters, language')
        .eq('slug', slug)
        .single()
      if (data) persona = data
    } catch (e) {
      // Silently fall through to 404
    }
  }

  if (!persona) {
    return { notFound: true, revalidate: 60 }
  }

  const related = getRelatedPersonas(persona.slug, persona.category, INITIAL_PERSONAS, 6).map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category || null,
    description: p.description || null,
  }))

  return {
    props: { persona, related },
    // Refresh every hour so DB-updated personas stay fresh without rebuild
    revalidate: 3600,
  }
}
