import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import HeroAnimation from '@/components/home/HeroAnimation'
import Marquee from '@/components/home/Marquee'
import { useAuth } from '@/context/AuthContext'

// Reveal animation constants — GPU-safe (opacity + transform only)
const R = 'transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)]'
const IN = 'opacity-100 translate-y-0'
const OUT = 'opacity-0 translate-y-8'
const D = ['', 'delay-[100ms]', 'delay-[200ms]', 'delay-[300ms]', 'delay-[400ms]', 'delay-[500ms]']

const rev = (visible, delay = 0) => `${R} ${D[delay]} ${visible ? IN : OUT}`

function useScrollReveal(threshold = 0.1) {
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

// Eyebrow tag shared component
function Eyebrow({ children, dark = false }) {
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 ${
            dark
                ? 'border-white/20 bg-white/5'
                : 'border-black/10 bg-black/5'
        }`}>
            <span className={`text-[10px] font-medium tracking-[0.2em] uppercase ${dark ? 'text-white/40' : 'text-black/40'}`}>
                {children}
            </span>
        </div>
    )
}

// Double-Bezel card wrapper
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

// Button-in-button CTA
function PillButton({ href, children, dark = false, fullWidth = false }) {
    const base = `group inline-flex items-center gap-3 font-medium rounded-full pl-6 pr-2 py-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] ${fullWidth ? 'w-full justify-center' : ''}`
    const color = dark
        ? 'bg-white text-black hover:bg-white/90'
        : 'bg-black text-white hover:bg-black/90'
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

export default function HomePage() {
    const { user } = useAuth()
    const startHref = user ? '/personas' : '/auth/signin?returnTo=/personas'

    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Hero animates on mount; below-fold sections animate on scroll
    const [heroVisible, setHeroVisible] = useState(false)
    const [featuresRef, featuresVisible] = useScrollReveal()
    const [stepsRef, stepsVisible] = useScrollReveal()
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
                <meta name="description" content="Chat with 350+ AI personas - spiritual guides, world leaders, celebrities, and fictional characters. Your digital sanctuary for meaningful conversations." />
                <link rel="canonical" href="https://ai-spirit.in" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://ai-spirit.in" />
                <meta property="og:title" content="AI Spirit - Talk to Anyone, Anytime" />
                <meta property="og:description" content="Chat with 350+ AI personas - spiritual guides, world leaders, celebrities, and fictional characters." />
                <meta property="og:image" content="https://ai-spirit.in/og-image-v7.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="AI Spirit - Talk to Anyone, Anytime" />
                <meta name="twitter:description" content="Chat with 350+ AI personas - spiritual guides, world leaders, celebrities, and fictional characters." />
                <meta name="twitter:image" content="https://ai-spirit.in/og-image-v7.png" />
            </Head>

            <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-black selection:text-white">
                <Navbar />

                {/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */}
                <section className="relative min-h-[100dvh] flex flex-col lg:flex-row items-center justify-center pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto gap-12 lg:gap-20">

                    {/* Left: Copy */}
                    <div className="w-full lg:w-1/2 z-10 text-center lg:text-left">

                        <div className={rev(heroVisible, 0)}>
                            <Eyebrow>350+ AI Personas Available</Eyebrow>
                        </div>

                        <h1 className={`${rev(heroVisible, 1)} font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.05] mb-7 text-black`}>
                            Talk to anyone.
                            <span className="block text-black/25 italic">Anytime.</span>
                        </h1>

                        <p className={`${rev(heroVisible, 2)} text-lg md:text-xl text-black/60 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed`}>
                            Spiritual guides, world leaders, celebrities, fictional characters — all ready for meaningful conversations.
                        </p>

                        <div className={rev(heroVisible, 3)}>
                            <PillButton href={startHref}>
                                {user ? 'Start Chatting' : 'Sign in to Chat'}
                            </PillButton>
                        </div>

                        {/* Stats bar */}
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

                    {/* Right: Phone animation — Double-Bezel outer shell */}
                    <div className={`${rev(heroVisible, 2)} w-full lg:w-1/2 flex items-center justify-center lg:justify-end`}>
                        <div className="p-2 rounded-[3.5rem] ring-1 ring-black/5 bg-black/5">
                            <HeroAnimation />
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════ MARQUEE ═══════════════════════════════════ */}
                <Marquee />

                {/* ═══════════════════════════════════ FEATURES ═══════════════════════════════════ */}
                <section className="py-32 md:py-40 px-6 bg-white" ref={featuresRef}>
                    <div className="max-w-6xl mx-auto">

                        <div className={`${rev(featuresVisible)} text-center mb-20`}>
                            <Eyebrow>Why AI Spirit</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-black leading-tight mb-5">
                                More than just AI chat.
                            </h2>
                            <p className="text-lg text-black/50 max-w-xl mx-auto leading-relaxed">
                                A sanctuary for conversations that matter.
                            </p>
                        </div>

                        {/* Asymmetric Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                            {/* Large hero card — col-span-7, dark */}
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
                                                From spiritual guides to celebrities, fictional characters to world leaders. Each persona has its own personality, knowledge, and style.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right stacked cards — col-span-5 */}
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

                {/* ═══════════════════════════════════ HOW IT WORKS ═══════════════════════════════════ */}
                <section className="py-32 md:py-40 px-6 bg-black text-white" ref={stepsRef}>
                    <div className="max-w-6xl mx-auto">

                        <div className={`${rev(stepsVisible)} text-center mb-20`}>
                            <Eyebrow dark>Getting Started</Eyebrow>
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
                                Three steps to meaningful<br className="hidden sm:block" /> conversation.
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
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
                                <div key={i} className={`${rev(stepsVisible, i + 1)}`}>
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

                {/* ═══════════════════════════════════ CONTACT ═══════════════════════════════════ */}
                <section className="py-32 md:py-40 px-6 bg-white" ref={contactRef}>
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
                                            <label htmlFor={id} className="block text-[10px] font-medium tracking-[0.15em] uppercase text-black/40 mb-2">
                                                {label}
                                            </label>
                                            <input
                                                type={type}
                                                id={id}
                                                name={id}
                                                value={formData[id]}
                                                onChange={handleChange}
                                                required
                                                placeholder={placeholder}
                                                className="w-full bg-black/5 border border-black/10 rounded-xl py-3 px-4 text-black text-sm focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-all duration-300 placeholder:text-black/25"
                                            />
                                        </div>
                                    ))}

                                    <div>
                                        <label htmlFor="message" className="block text-[10px] font-medium tracking-[0.15em] uppercase text-black/40 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            placeholder="Your message..."
                                            className="w-full bg-black/5 border border-black/10 rounded-xl py-3 px-4 text-black text-sm focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-all duration-300 resize-none placeholder:text-black/25"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
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

                {/* ═══════════════════════════════════ FOOTER ═══════════════════════════════════ */}
                <footer className="py-8 bg-black text-white/40 text-sm border-t border-white/10">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>© {new Date().getFullYear()} AI Spirit. All rights reserved.</div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="hover:text-white transition-colors duration-300">Privacy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors duration-300">Terms</Link>
                            <Link href="/contact" className="hover:text-white transition-colors duration-300">Contact</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
