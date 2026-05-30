import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import HeroAnimation from '@/components/home/HeroAnimation'
import Marquee from '@/components/home/Marquee'
import { useAuth } from '@/context/AuthContext'

// GPU-safe reveal animation constants
const R = 'transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)]'
const IN = 'opacity-100 translate-y-0'
const OUT = 'opacity-0 translate-y-6'
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

function Eyebrow({ children, dark = false }) {
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 ${
            dark ? 'border-white/20 bg-white/5' : 'border-black/10 bg-black/5'
        }`}>
            <span className={`text-[10px] font-medium tracking-[0.2em] uppercase ${dark ? 'text-white/40' : 'text-black/40'}`}>
                {children}
            </span>
        </div>
    )
}

function Bezel({ children, dark = false, className = '', innerClass = '' }) {
    return (
        <div className={`p-1.5 rounded-[2rem] ring-1 ${dark ? 'ring-white/10 bg-white/5' : 'ring-black/5 bg-black/5'} ${className}`}>
            <div className={`rounded-[calc(2rem-0.375rem)] h-full ${
                dark
                    ? 'bg-white/[0.03] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : 'bg-white border border-black/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]'
            } ${innerClass}`}>
                {children}
            </div>
        </div>
    )
}

function PillButton({ href, children, dark = false, fullWidth = false }) {
    const base = `group inline-flex items-center gap-3 font-medium rounded-full pl-6 pr-2 py-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] ${fullWidth ? 'w-full justify-center' : ''}`
    const color = dark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'
    const iconBg = dark ? 'bg-black/10' : 'bg-white/10'
    return (
        <Link href={href} className={`${base} ${color}`}>
            <span className="text-[15px] py-1">{children}</span>
            <span className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </span>
        </Link>
    )
}

// Persona category cards for the showcase grid
const PERSONA_CATEGORIES = [
    { title: 'Spiritual Guides',     description: 'Peace, clarity & inner wisdom',       dot: 'bg-amber-400' },
    { title: 'Tech Visionaries',     description: 'First-principles thinking',            dot: 'bg-sky-400' },
    { title: 'Historical Figures',   description: 'Centuries of lived wisdom',            dot: 'bg-stone-400' },
    { title: 'Fictional Characters', description: 'Stories that shaped the world',        dot: 'bg-slate-400' },
    { title: 'Scientists & Thinkers',description: 'Ideas that changed everything',        dot: 'bg-emerald-400' },
    { title: 'Companions & Romance', description: 'Always here, always present',          dot: 'bg-rose-400' },
]

const TESTIMONIALS = [
    {
        quote: "Talking to the Osho persona got me through a rough patch I couldn't share with anyone. Completely private, non-judgmental, and genuinely insightful. It's part of my daily routine now.",
        author: 'Priya S.',
        location: 'Mumbai',
        tag: 'Spiritual Guidance',
    },
    {
        quote: "I 'talked to Elon Musk' to prep for a pitch. The first-principles pushback changed how I framed the whole problem. We got the deal. I'm not even joking.",
        author: 'Arjun M.',
        location: 'Bangalore',
        tag: 'Business Strategy',
    },
    {
        quote: "Einstein explaining quantum mechanics to my 12-year-old in a way she actually got? Alone, that's worth it. We use AI Spirit every week for her science homework now.",
        author: 'Kavita R.',
        location: 'Delhi',
        tag: 'Education',
    },
]

function PersonaCategoryCard({ cat, index, visible, href }) {
    return (
        <Link
            href={href}
            className={`group block ${rev(visible, index % 4 + 1)}`}
        >
            <div className="p-1.5 rounded-[1.5rem] ring-1 ring-black/[0.06] bg-black/[0.02] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)]">
                <div className="bg-white rounded-[calc(1.5rem-0.375rem)] border border-black/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] px-5 py-5 flex flex-col justify-between min-h-[140px]">
                    {/* Top row: dot + arrow */}
                    <div className="flex items-center justify-between mb-4">
                        <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                        <svg
                            className="w-3.5 h-3.5 text-black/20 group-hover:text-black/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                    </div>
                    {/* Text */}
                    <div>
                        <h3 className="font-display text-lg text-black leading-tight mb-1">{cat.title}</h3>
                        <p className="text-xs text-black/35 leading-relaxed">{cat.description}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function HomePage() {
    const { user } = useAuth()
    const startHref = user ? '/personas' : '/auth/signin?returnTo=/personas'

    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [heroVisible, setHeroVisible] = useState(false)
    const [personasRef, personasVisible] = useScrollReveal()
    const [featuresRef, featuresVisible] = useScrollReveal()
    const [privacyRef, privacyVisible] = useScrollReveal()
    const [stepsRef, stepsVisible] = useScrollReveal()
    const [testimonialsRef, testimonialsVisible] = useScrollReveal()
    const [contactRef, contactVisible] = useScrollReveal()

    useEffect(() => {
        const t = setTimeout(() => setHeroVisible(true), 60)
        return () => clearTimeout(t)
    }, [])

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setStatus({ type: '', message: '' })
        try {
            const res = await fetch('/api/contact-resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (res.ok) {
                setStatus({ type: 'success', message: 'Message sent successfully!' })
                setFormData({ name: '', email: '', message: '' })
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to send message.' })
            }
        } catch {
            setStatus({ type: 'error', message: 'Network error. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Head>
                <title>AI Spirit - Talk to Anyone, Anytime</title>
                <meta name="description" content="Chat with 350+ AI personas — spiritual guides, world leaders, celebrities, and fictional characters. Private, judgment-free conversations." />
                <link rel="canonical" href="https://ai-spirit.in" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://ai-spirit.in" />
                <meta property="og:title" content="AI Spirit - Talk to Anyone, Anytime" />
                <meta property="og:description" content="Chat with 350+ AI personas — spiritual guides, world leaders, celebrities, and fictional characters." />
                <meta property="og:image" content="https://ai-spirit.in/og-image-v7.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="AI Spirit - Talk to Anyone, Anytime" />
                <meta name="twitter:description" content="Chat with 350+ AI personas — spiritual guides, world leaders, celebrities, and fictional characters." />
                <meta name="twitter:image" content="https://ai-spirit.in/og-image-v7.png" />
            </Head>

            <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-black selection:text-white">
                <Navbar />

                {/* ─────────────────────────── HERO ─────────────────────────── */}
                <section className="relative min-h-[100dvh] flex flex-col lg:flex-row items-center justify-center pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto gap-12 lg:gap-20">
                    <div className="w-full lg:w-1/2 z-10 text-center lg:text-left">
                        <div className={rev(heroVisible, 0)}>
                            <Eyebrow>350+ AI Personas Available</Eyebrow>
                        </div>
                        <h1 className={`${rev(heroVisible, 1)} font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.05] mb-7 text-black`}>
                            Talk to anyone.
                            <span className="block text-black/25 italic">Anytime.</span>
                        </h1>
                        <p className={`${rev(heroVisible, 2)} text-lg md:text-xl text-black/60 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed`}>
                            Spiritual guides, world leaders, celebrities, fictional characters — all ready for meaningful, private conversations.
                        </p>
                        <div className={rev(heroVisible, 3)}>
                            <PillButton href={startHref}>
                                {user ? 'Start Chatting' : 'Sign in to Chat'}
                            </PillButton>
                        </div>
                        <div className={`${rev(heroVisible, 4)} mt-14 pt-8 border-t border-black/10 flex items-center justify-center lg:justify-start gap-10`}>
                            {[
                                { value: '10K+', label: 'Conversations' },
                                { value: '350+', label: 'Personas' },
                                { value: '4.9', label: 'User Rating' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center lg:text-left">
                                    <div className="font-display text-2xl text-black">{stat.value}</div>
                                    <div className="text-xs text-black/40 tracking-wide mt-0.5">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`${rev(heroVisible, 2)} w-full lg:w-1/2 flex items-center justify-center lg:justify-end`}>
                        <div className="p-2 rounded-[3.5rem] ring-1 ring-black/5 bg-black/5">
                            <HeroAnimation />
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── MARQUEE ─────────────────────────── */}
                <Marquee />

                {/* ─────────────────────────── PERSONA CATEGORIES ─────────────────────────── */}
                <section className="py-24 md:py-32 px-6 bg-white" ref={personasRef}>
                    <div className="max-w-6xl mx-auto">
                        <div className={`${rev(personasVisible)} text-center mb-14`}>
                            <Eyebrow>Browse by Category</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-black leading-tight mb-5">
                                Who do you want to talk to?
                            </h2>
                            <p className="text-lg text-black/50 max-w-xl mx-auto leading-relaxed">
                                Every persona has a distinct voice, knowledge, and personality. Find yours.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                            {PERSONA_CATEGORIES.map((cat, i) => (
                                <PersonaCategoryCard key={cat.title} cat={cat} index={i} visible={personasVisible} href={startHref} />
                            ))}
                        </div>
                        <div className={`${rev(personasVisible, 4)} text-center mt-10`}>
                            <PillButton href={startHref}>
                                Browse All 350+ Personas
                            </PillButton>
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── FEATURES BENTO ─────────────────────────── */}
                <section className="py-24 md:py-32 px-6 bg-[#F7F7F5]" ref={featuresRef}>
                    <div className="max-w-6xl mx-auto">
                        <div className={`${rev(featuresVisible)} text-center mb-16`}>
                            <Eyebrow>Why AI Spirit</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-black leading-tight mb-5">
                                More than just AI chat.
                            </h2>
                            <p className="text-lg text-black/50 max-w-xl mx-auto leading-relaxed">
                                A sanctuary for conversations that matter.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Large dark card */}
                            <div className={`${rev(featuresVisible, 1)} md:col-span-7`}>
                                <div className="p-1.5 rounded-[2rem] ring-1 ring-black/5 bg-black/5 h-full">
                                    <div className="bg-black rounded-[calc(2rem-0.375rem)] p-8 md:p-10 h-full min-h-[300px] flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-display text-3xl md:text-4xl text-white leading-tight mb-4">
                                                350+ Unique<br />Personas
                                            </h3>
                                            <p className="text-white/50 leading-relaxed max-w-sm text-[15px]">
                                                From spiritual guides to celebrities, fictional characters to world leaders. Each persona has its own personality, knowledge, and voice.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right stacked */}
                            <div className="md:col-span-5 flex flex-col gap-4">
                                <div className={`${rev(featuresVisible, 2)} flex-1`}>
                                    <Bezel className="h-full" innerClass="p-8">
                                        <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center mb-5">
                                            <svg className="w-4 h-4 text-black/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-display text-2xl text-black mb-2">Judgment-Free Space</h3>
                                        <p className="text-black/50 text-sm leading-relaxed">Ask anything, explore any topic. Our AI personas provide wisdom without judgment, creating a safe space for growth.</p>
                                    </Bezel>
                                </div>
                                <div className={`${rev(featuresVisible, 3)} flex-1`}>
                                    <Bezel className="h-full" innerClass="p-8">
                                        <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center mb-5">
                                            <svg className="w-4 h-4 text-black/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                            </svg>
                                        </div>
                                        <h3 className="font-display text-2xl text-black mb-2">Learn & Grow</h3>
                                        <p className="text-black/50 text-sm leading-relaxed">Gain insights from the greatest minds in history. Perfect for learning, reflection, or meaningful conversation.</p>
                                    </Bezel>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── PRIVACY PROMISE ─────────────────────────── */}
                <section className="py-24 md:py-32 px-6 bg-white border-y border-black/5" ref={privacyRef}>
                    <div className="max-w-5xl mx-auto">
                        <div className={`${rev(privacyVisible)} text-center mb-16`}>
                            <Eyebrow>Privacy & Trust</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-black leading-tight mb-5">
                                Your sanctuary is safe.
                            </h2>
                            <p className="text-lg text-black/50 max-w-xl mx-auto leading-relaxed">
                                We built AI Spirit so you can have the conversations you can&apos;t have anywhere else. That requires absolute trust.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    icon: (
                                        <svg className="w-5 h-5 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    ),
                                    title: 'Private Conversations',
                                    body: 'Your chats are yours alone. We do not read, sell, or share your conversation history with anyone.'
                                },
                                {
                                    icon: (
                                        <svg className="w-5 h-5 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    ),
                                    title: 'No Data Selling',
                                    body: 'We will never monetise your personal data. Your information is used only to improve your experience.'
                                },
                                {
                                    icon: (
                                        <svg className="w-5 h-5 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                                        </svg>
                                    ),
                                    title: 'Zero Judgment',
                                    body: 'Ask anything — career fears, relationship doubts, life questions. Our AI never judges, only listens and responds.'
                                },
                            ].map((item, i) => (
                                <div key={i} className={rev(privacyVisible, i + 1)}>
                                    <Bezel innerClass="p-8 h-full flex flex-col gap-4">
                                        <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-display text-xl text-black mb-2">{item.title}</h3>
                                            <p className="text-black/50 text-sm leading-relaxed">{item.body}</p>
                                        </div>
                                    </Bezel>
                                </div>
                            ))}
                        </div>

                        <div className={`${rev(privacyVisible, 4)} text-center mt-10`}>
                            <Link href="/privacy" className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors duration-300 border-b border-black/15 pb-0.5 hover:border-black/40">
                                Read our full Privacy Policy
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */}
                <section className="py-24 md:py-32 px-6 bg-black text-white" ref={stepsRef}>
                    <div className="max-w-6xl mx-auto">
                        <div className={`${rev(stepsVisible)} text-center mb-16`}>
                            <Eyebrow dark>Getting Started</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
                                Three steps to meaningful<br className="hidden sm:block" /> conversation.
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                            {[
                                {
                                    step: '01',
                                    title: 'Pick a Persona',
                                    description: 'Browse 350+ personalities — spiritual guides, visionaries, historical figures, and fictional characters.'
                                },
                                {
                                    step: '02',
                                    title: 'Start Chatting',
                                    description: 'Ask anything. Each persona responds in their authentic voice, style, and depth of knowledge.'
                                },
                                {
                                    step: '03',
                                    title: 'Grow & Reflect',
                                    description: "Gain perspective, find clarity, and walk away with insights you couldn't get anywhere else."
                                },
                            ].map((item, i) => (
                                <div key={i} className={rev(stepsVisible, i + 1)}>
                                    <div className="p-1.5 rounded-[2rem] ring-1 ring-white/10 bg-white/5 h-full">
                                        <div className="rounded-[calc(2rem-0.375rem)] p-8 h-full min-h-[240px] flex flex-col justify-between border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                                            <span className="font-display text-5xl text-white/10 leading-none select-none">{item.step}</span>
                                            <div>
                                                <h3 className="font-display text-2xl text-white mb-3">{item.title}</h3>
                                                <p className="text-white/40 leading-relaxed text-[15px]">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`${rev(stepsVisible, 4)} text-center`}>
                            <PillButton href={startHref} dark>
                                Explore All Personas
                            </PillButton>
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── TESTIMONIALS ─────────────────────────── */}
                <section className="py-24 md:py-32 px-6 bg-[#F7F7F5]" ref={testimonialsRef}>
                    <div className="max-w-6xl mx-auto">
                        <div className={`${rev(testimonialsVisible)} text-center mb-16`}>
                            <Eyebrow>Real Conversations</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-black leading-tight mb-5">
                                What people are saying.
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {TESTIMONIALS.map((t, i) => (
                                <div key={i} className={rev(testimonialsVisible, i + 1)}>
                                    <Bezel className="h-full" innerClass="p-8 flex flex-col gap-6 h-full">
                                        {/* Stars */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, j) => (
                                                <svg key={j} className="w-3.5 h-3.5 text-black/40" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <blockquote className="font-display text-lg text-black/80 leading-relaxed flex-1">
                                            &ldquo;{t.quote}&rdquo;
                                        </blockquote>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-black">{t.author}</p>
                                                <p className="text-xs text-black/40">{t.location}</p>
                                            </div>
                                            <span className="text-[10px] font-medium tracking-wide uppercase px-3 py-1.5 rounded-full bg-black/5 text-black/40">
                                                {t.tag}
                                            </span>
                                        </div>
                                    </Bezel>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── CONTACT ─────────────────────────── */}
                <section className="py-24 md:py-32 px-6 bg-white" ref={contactRef}>
                    <div className="max-w-lg mx-auto">
                        <div className={`${rev(contactVisible)} text-center mb-14`}>
                            <Eyebrow>Get in Touch</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl text-black mb-4 leading-tight">
                                We&apos;d love to hear from you.
                            </h2>
                            <p className="text-black/50">Questions, feedback, or just want to say hello.</p>
                        </div>

                        {status.message && (
                            <div className={`mb-8 p-4 text-center rounded-2xl text-sm ${
                                status.type === 'success'
                                    ? 'bg-black/5 text-black border border-black/10'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {status.message}
                            </div>
                        )}

                        <div className={rev(contactVisible, 1)}>
                            <Bezel innerClass="p-8 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {[
                                        { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                                        { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                                    ].map(({ id, label, type, placeholder }) => (
                                        <div key={id}>
                                            <label htmlFor={id} className="block text-[10px] font-medium tracking-[0.15em] uppercase text-black/40 mb-2">{label}</label>
                                            <input
                                                type={type} id={id} name={id}
                                                value={formData[id]} onChange={handleChange}
                                                required placeholder={placeholder}
                                                className="w-full bg-black/5 border border-black/10 rounded-xl py-3 px-4 text-black text-sm focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-all duration-300 placeholder:text-black/25"
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label htmlFor="message" className="block text-[10px] font-medium tracking-[0.15em] uppercase text-black/40 mb-2">Message</label>
                                        <textarea
                                            id="message" name="message"
                                            value={formData.message} onChange={handleChange}
                                            required rows={4} placeholder="Your message..."
                                            className="w-full bg-black/5 border border-black/10 rounded-xl py-3 px-4 text-black text-sm focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-all duration-300 resize-none placeholder:text-black/25"
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={isSubmitting}
                                        className="group w-full flex items-center justify-center gap-3 bg-black text-white pl-6 pr-2 py-2 rounded-full font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/90 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <span className="text-[15px] py-1">{isSubmitting ? 'Sending…' : 'Send Message'}</span>
                                        {!isSubmitting && (
                                            <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                </form>
                            </Bezel>
                        </div>
                    </div>
                </section>

                {/* ─────────────────────────── FOOTER ─────────────────────────── */}
                <footer className="bg-black text-white">
                    {/* Trust strip */}
                    <div className="border-b border-white/5 py-5 px-6">
                        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-8">
                            {[
                                {
                                    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
                                    label: 'Private & Encrypted'
                                },
                                {
                                    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
                                    label: 'No Data Selling'
                                },
                                {
                                    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                    label: 'Zero Judgment'
                                },
                                {
                                    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                    label: '24/7 Available'
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-white/30">
                                    {item.icon}
                                    <span className="text-xs font-medium tracking-wide">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Main footer */}
                    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-black rounded-[0.7rem] overflow-hidden flex-shrink-0 ring-1 ring-white/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logo.png" alt="AI Spirit" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <p className="text-xs text-white/20">
                            &copy; {new Date().getFullYear()} AI Spirit. All rights reserved.
                        </p>
                        <div className="flex items-center gap-5">
                            {[
                                { label: 'Privacy', href: '/privacy' },
                                { label: 'Terms', href: '/terms' },
                                { label: 'Contact', href: '/contact' },
                            ].map(link => (
                                <Link key={link.href} href={link.href} className="text-xs text-white/30 hover:text-white/70 transition-colors duration-300">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
