import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import PortraitCard from '@/components/personas/PortraitCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroAnimation from '@/components/home/HeroAnimation'

// GPU-safe reveal animation constants
const R = 'transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'
const IN = 'opacity-100 translate-y-0'
const OUT = 'opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0'
const D = ['', 'delay-[100ms]', 'delay-[200ms]', 'delay-[300ms]', 'delay-[400ms]', 'delay-[500ms]']
const rev = (visible, delay = 0) => `${R} ${D[delay]} ${visible ? IN : OUT}`

function useScrollReveal(threshold = 0.08) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true) },
            { threshold }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [threshold])
    return [ref, visible]
}

function PillButton({ href, children, dark = false }) {
    const base = 'group inline-flex items-center gap-3 font-medium rounded-full pl-6 pr-2 py-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
    const color = dark
        ? 'bg-white text-black hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-black'
        : 'bg-black text-white hover:bg-black/90 focus-visible:ring-black'
    const iconBg = dark ? 'bg-black/10' : 'bg-white/10'
    return (
        <Link href={href} className={`${base} ${color}`}>
            <span className="text-[15px] py-1">{children}</span>
            <span className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </span>
        </Link>
    )
}

// The guides most visitors arrive looking for. Each links to its own page,
// which works without signing in.
const FEATURED_PERSONAS = [
    { slug: 'osho', name: 'Osho', role: 'Spiritual Philosopher', image: '/personas/osho.png' },
    { slug: 'astro-guide', name: 'Astro Guide', role: 'Vedic Astrology Advisor', image: '/personas/astro-guide.png' },
    { slug: 'lord-krishna', name: 'Lord Krishna', role: 'Charioteer of Mahabharata', image: '/personas/lord-krishna.png' },
    { slug: 'sadhguru', name: 'Sadhguru', role: 'Yogi & Mystic', image: '/personas/sadhguru.png' },
    { slug: 'swami-vivekananda', name: 'Swami Vivekananda', role: 'Spiritual Philosopher', image: '/personas/swami-vivekananda.jpg' },
    { slug: 'swami-samarth', name: 'Swami Samarth', role: 'Akkalkot Maharaj', image: '/personas/swami-samarth.png' },
]

const BROWSE_CATEGORIES = ['Spiritual', 'Mythology', 'Historical', 'Business', 'Movies', 'Anime', 'Music', 'Romance']

export default function HomePage() {
    const [heroVisible, setHeroVisible] = useState(false)
    const [personasRef, personasVisible] = useScrollReveal()
    const [privacyRef, privacyVisible] = useScrollReveal()

    useEffect(() => {
        const t = setTimeout(() => setHeroVisible(true), 60)
        return () => clearTimeout(t)
    }, [])

    return (
        <>
            <Head>
                <title>AI Spirit - Talk to Anyone, Anytime</title>
                <meta name="description" content="Chat with 350+ AI personas: spiritual guides, Indian legends, historical figures and characters you love. Private conversations in Hindi, English or Hinglish." />
                <link rel="canonical" href="https://ai-spirit.in" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://ai-spirit.in" />
                <meta property="og:title" content="AI Spirit - Talk to Anyone, Anytime" />
                <meta property="og:description" content="Chat with 350+ AI personas: spiritual guides, Indian legends, historical figures and characters you love." />
                <meta property="og:image" content="https://ai-spirit.in/og-image-v8.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="AI Spirit - Talk to Anyone, Anytime" />
                <meta name="twitter:description" content="Chat with 350+ AI personas: spiritual guides, Indian legends, historical figures and characters you love." />
                <meta name="twitter:image" content="https://ai-spirit.in/og-image-v8.png" />
            </Head>

            <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-black selection:text-white">
                <Navbar />

                {/* ─────────────────────────── HERO ─────────────────────────── */}
                <section className="relative flex flex-col lg:flex-row items-center justify-center pt-28 sm:pt-32 lg:pt-20 pb-12 lg:pb-16 lg:min-h-[100dvh] px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1400px] mx-auto gap-10 lg:gap-20">
                    <div className="w-full lg:w-1/2 z-10 text-center lg:text-left">
                        <h1 className={`${rev(heroVisible, 0)} font-display text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.05] mb-6 sm:mb-7 text-black [text-wrap:balance]`}>
                            Talk to anyone.
                            <span className="block text-black/55 italic">Anytime.</span>
                        </h1>
                        <p className={`${rev(heroVisible, 1)} text-base sm:text-lg md:text-xl text-black/70 max-w-lg mx-auto lg:mx-0 mb-3 leading-relaxed`}>
                            Spiritual guides, Indian legends, historical figures and the characters you love, ready for a private conversation.
                        </p>
                        <p lang="hi" className={`${rev(heroVisible, 2)} text-base sm:text-lg text-black/60 max-w-lg mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed`}>
                            हिंदी, English या Hinglish, जैसे आप चाहें।
                        </p>
                        <div className={rev(heroVisible, 3)}>
                            <PillButton href="/personas">Browse 350+ personas</PillButton>
                        </div>
                    </div>
                    <div className={`${rev(heroVisible, 2)} hidden lg:flex w-full lg:w-1/2 items-center justify-center lg:justify-end`}>
                        <div className="p-2 rounded-[3.5rem] ring-1 ring-black/5 bg-black/5">
                            <HeroAnimation />
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── FEATURED GUIDES ─────────────────────────── */}
                <section className="pb-24 md:pb-32 lg:pt-8 px-5 sm:px-8 bg-white" ref={personasRef}>
                    <div className="max-w-6xl mx-auto">
                        <div className={`${rev(personasVisible)} flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8`}>
                            <div>
                                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-black leading-tight">
                                    Who do you want to talk to?
                                </h2>
                                <p className="text-black/65 mt-3 max-w-xl leading-relaxed">
                                    Each persona keeps its own voice and remembers your earlier conversations.
                                </p>
                            </div>
                            <Link href="/personas" className="text-sm text-black/70 hover:text-black border-b border-black/20 hover:border-black/50 pb-0.5 self-start sm:self-auto transition-colors">
                                See all personas
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                            {FEATURED_PERSONAS.map((persona, i) => (
                                <PortraitCard
                                    key={persona.slug}
                                    href={`/talk-to/${persona.slug}`}
                                    name={persona.name}
                                    subtitle={persona.role}
                                    image={persona.image}
                                    sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
                                    className={rev(personasVisible, (i % 3) + 1)}
                                />
                            ))}
                        </div>

                        <div className={`${rev(personasVisible, 3)} mt-8 flex flex-wrap gap-2`}>
                            {BROWSE_CATEGORIES.map((category) => (
                                <Link
                                    key={category}
                                    href={`/personas?category=${encodeURIComponent(category)}`}
                                    className="px-4 py-2 rounded-full text-[13px] font-medium text-black/70 bg-black/[0.04] hover:bg-black/[0.08] hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── PRIVACY ─────────────────────────── */}
                <section className="py-24 md:py-32 px-6 bg-[#F7F7F5]" ref={privacyRef}>
                    <div className={`${rev(privacyVisible)} max-w-2xl mx-auto text-center`}>
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-black leading-tight mb-6 [text-wrap:balance]">
                            The conversations you can&apos;t have anywhere else.
                        </h2>
                        <p className="text-lg text-black/70 leading-relaxed mb-8 [text-wrap:pretty]">
                            Your chats are tied to your account and shown only to you. We never sell your data or use your conversations for advertising, and you can delete your account and its data at any time.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <PillButton href="/personas">Start a conversation</PillButton>
                            <Link href="/privacy" className="text-sm text-black/70 hover:text-black border-b border-black/20 hover:border-black/50 pb-0.5 transition-colors">
                                Read the privacy policy
                            </Link>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    )
}
