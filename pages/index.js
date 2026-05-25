import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import HeroAnimation from '@/components/home/HeroAnimation'
import Marquee from '@/components/home/Marquee'
import { useAuth } from '@/context/AuthContext'

function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

export default function HomePage() {
  const { user } = useAuth()
  const startHref = user ? '/personas' : '/auth/signin?returnTo=/personas'
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [featuresRef, featuresVisible] = useReveal()
  const [founderRef, founderVisible] = useReveal()
  const [contactRef, contactVisible] = useReveal()

  useEffect(() => { setMounted(true) }, [])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/contact-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) {
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

      {/* Grain overlay — fixed, GPU-safe, pointer-events-none */}
      <div
        className="fixed inset-0 pointer-events-none z-[5] opacity-[0.022]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Ambient radial orbs — fixed, GPU-safe */}
      <div className="fixed inset-0 pointer-events-none z-[4] overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.028) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-8%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.018) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-[50%] left-[35%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.012) 0%, transparent 60%)' }}
        />
      </div>

      <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden selection:bg-white selection:text-black">
        <Navbar />

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="relative min-h-[100dvh] flex flex-col lg:flex-row items-center justify-center pt-28 pb-20 px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto gap-14 lg:gap-12">

          {/* Left: copy */}
          <div className="w-full lg:w-[52%] z-10 text-center lg:text-left">

            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 mb-8"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(12px)',
                transition: 'opacity 700ms 100ms cubic-bezier(0.32,0.72,0,1), transform 700ms 100ms cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">350+ AI Personas Available</span>
            </div>

            {/* Headline */}
            <h1
              className="mb-6 leading-[0.9] tracking-tight"
              style={{
                fontFamily: '"Crimson Text", Georgia, serif',
                fontSize: 'clamp(3.5rem, 7.5vw, 6.5rem)',
                fontStyle: 'italic',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(28px)',
                transition: 'opacity 900ms 200ms cubic-bezier(0.32,0.72,0,1), transform 900ms 200ms cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              Talk to anyone.
              <br />
              <span className="text-white/30">Anytime.</span>
            </h1>

            {/* Sub-copy */}
            <p
              className="text-white/40 text-base md:text-lg max-w-[420px] mx-auto lg:mx-0 mb-10 leading-relaxed"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(20px)',
                transition: 'opacity 800ms 340ms cubic-bezier(0.32,0.72,0,1), transform 800ms 340ms cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              Spiritual guides, world leaders, celebrities, fictional characters — all ready for meaningful conversations.
            </p>

            {/* CTA — Button-in-Button pill */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(16px)',
                transition: 'opacity 800ms 460ms cubic-bezier(0.32,0.72,0,1), transform 800ms 460ms cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              <Link
                href={startHref}
                className="group inline-flex items-center gap-3 bg-white text-black pl-6 pr-2 py-2 rounded-full font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_0_48px_rgba(255,255,255,0.07)]"
              >
                {user ? 'Start Chatting' : 'Sign in to Chat'}
                <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Stat strip */}
            <div
              className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-center lg:justify-start gap-0"
              style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 700ms 620ms cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              {[
                { value: '10K+', label: 'Conversations' },
                { value: '350+', label: 'Personas' },
                { value: '4.9★', label: 'User Rating' },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center">
                  {i > 0 && <div className="w-px h-8 bg-white/[0.07] mx-7" />}
                  <div className="text-center lg:text-left">
                    <div
                      className="text-2xl font-bold text-white/75 leading-none"
                      style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-white/28 uppercase tracking-[0.15em] mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: phone mockup in Double-Bezel */}
          <div
            className="w-full lg:w-[48%] flex items-center justify-center lg:justify-end relative z-10"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateY(24px)',
              transition: 'opacity 1000ms 300ms cubic-bezier(0.32,0.72,0,1), transform 1000ms 300ms cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* Outer shell */}
            <div
              className="rounded-[2.5rem] p-[1.5px] relative"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.025) 55%, transparent 100%)',
              }}
            >
              {/* Inner core */}
              <div
                className="bg-[#0d0d0d] rounded-[calc(2.5rem-1.5px)] p-6 md:p-8"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
              >
                <HeroAnimation />
              </div>
              {/* Glow behind card */}
              <div
                className="absolute inset-0 -z-10 rounded-[2.5rem] blur-3xl scale-90"
                style={{ background: 'rgba(255,255,255,0.015)' }}
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            MARQUEE
        ══════════════════════════════════════ */}
        <div className="border-y border-white/[0.05]">
          <Marquee />
        </div>

        {/* ══════════════════════════════════════
            FEATURES — ASYMMETRICAL BENTO
        ══════════════════════════════════════ */}
        <section className="py-32 md:py-40 px-6 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto">

            {/* Section header */}
            <div
              ref={featuresRef}
              className="mb-14"
              style={{
                opacity: featuresVisible ? 1 : 0,
                transform: featuresVisible ? 'none' : 'translateY(32px)',
                transition: 'opacity 800ms cubic-bezier(0.32,0.72,0,1), transform 800ms cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-medium">Why AI Spirit</span>
              </div>
              <h2
                className="leading-[0.9] tracking-tight"
                style={{
                  fontFamily: '"Crimson Text", Georgia, serif',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontStyle: 'italic',
                }}
              >
                A sanctuary for<br />
                <span className="text-white/30">meaningful conversations.</span>
              </h2>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4">

              {/* CARD 1 — large hero (col-span-4) */}
              <div
                className="md:col-span-4 rounded-[1.5rem] p-[1px]"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.025) 100%)',
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible ? 'none' : 'translateY(40px)',
                  transition: 'opacity 800ms 80ms cubic-bezier(0.32,0.72,0,1), transform 800ms 80ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                <div
                  className="bg-[#0f0f0f] rounded-[calc(1.5rem-1px)] p-8 md:p-10 h-full min-h-[200px] flex flex-col justify-between overflow-hidden relative"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="absolute -right-4 -top-6 text-[8rem] md:text-[11rem] font-bold text-white/[0.04] leading-none select-none"
                    style={{ fontFamily: '"Crimson Text", Georgia, serif' }}
                    aria-hidden="true"
                  >
                    350+
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium mb-4">Persona Library</div>
                    <h3
                      className="text-2xl md:text-3xl text-white leading-tight mb-3"
                      style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
                    >
                      Unique Personas
                    </h3>
                    <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                      From spiritual guides to celebrities, fictional characters to world leaders — each with their own personality, knowledge, and style.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2 — small (col-span-2) */}
              <div
                className="md:col-span-2 rounded-[1.5rem] p-[1px]"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible ? 'none' : 'translateY(40px)',
                  transition: 'opacity 800ms 160ms cubic-bezier(0.32,0.72,0,1), transform 800ms 160ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                <div
                  className="bg-[#0f0f0f] rounded-[calc(1.5rem-1px)] p-8 h-full flex flex-col justify-between min-h-[200px]"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}
                >
                  <div className="w-9 h-9 rounded-xl border border-white/[0.07] flex items-center justify-center mb-5">
                    <svg className="w-4.5 h-4.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base text-white/80 font-medium mb-2">Judgment-Free Space</h3>
                    <p className="text-white/30 text-xs leading-relaxed">Ask anything. Our personas provide wisdom without judgment.</p>
                  </div>
                </div>
              </div>

              {/* CARD 3 — small (col-span-2) */}
              <div
                className="md:col-span-2 rounded-[1.5rem] p-[1px]"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible ? 'none' : 'translateY(40px)',
                  transition: 'opacity 800ms 240ms cubic-bezier(0.32,0.72,0,1), transform 800ms 240ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                <div
                  className="bg-[#0f0f0f] rounded-[calc(1.5rem-1px)] p-8 h-full flex flex-col justify-between min-h-[180px]"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}
                >
                  <div className="w-9 h-9 rounded-xl border border-white/[0.07] flex items-center justify-center mb-5">
                    <svg className="w-4.5 h-4.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base text-white/80 font-medium mb-2">Learn & Grow</h3>
                    <p className="text-white/30 text-xs leading-relaxed">Gain insights from the greatest minds in history.</p>
                  </div>
                </div>
              </div>

              {/* CARD 4 — wide CTA (col-span-4) */}
              <div
                className="md:col-span-4 rounded-[1.5rem] p-[1px]"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.025) 100%)',
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible ? 'none' : 'translateY(40px)',
                  transition: 'opacity 800ms 320ms cubic-bezier(0.32,0.72,0,1), transform 800ms 320ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                <div
                  className="bg-[#0f0f0f] rounded-[calc(1.5rem-1px)] px-8 md:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium mb-2">Always Available</div>
                    <h3
                      className="text-xl md:text-2xl text-white/80"
                      style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
                    >
                      Every mind, 24 hours a day.
                    </h3>
                  </div>
                  <Link
                    href={startHref}
                    className="group flex-shrink-0 inline-flex items-center gap-2.5 border border-white/[0.1] bg-white/[0.04] text-white/70 pl-5 pr-2 py-2 rounded-full text-sm font-medium hover:bg-white/[0.07] hover:text-white active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    Start now
                    <span className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOUNDER SECTION
        ══════════════════════════════════════ */}
        <section
          ref={founderRef}
          className="py-32 md:py-40 px-6 md:px-12 lg:px-20 border-t border-white/[0.05]"
        >
          <div
            className="max-w-5xl mx-auto"
            style={{
              opacity: founderVisible ? 1 : 0,
              transform: founderVisible ? 'none' : 'translateY(40px)',
              transition: 'opacity 900ms cubic-bezier(0.32,0.72,0,1), transform 900ms cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* Outer shell */}
            <div
              className="rounded-[2rem] p-[1px]"
              style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)' }}
            >
              {/* Inner core */}
              <div
                className="bg-[#0d0d0d] rounded-[calc(2rem-1px)] px-8 py-12 md:px-14 md:py-14 flex flex-col md:flex-row items-center gap-12 md:gap-16"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}
              >
                {/* Avatar block */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-24 h-24 rounded-full border border-white/[0.09] flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span
                      className="text-2xl text-white/50"
                      style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
                    >
                      GM
                    </span>
                  </div>
                  <p
                    className="mt-4 text-white/55 text-sm font-medium"
                    style={{ fontFamily: '"Crimson Text", Georgia, serif' }}
                  >
                    Gaurav Mahale
                  </p>
                  <p className="text-white/20 text-[10px] tracking-widest uppercase mt-0.5">Founder</p>
                  <a
                    href="https://x.com/mahalegauravk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 px-4 py-1.5 rounded-full border border-white/[0.08] flex items-center gap-2 hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-xs text-white/30 hover:text-white/60"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Follow
                  </a>
                </div>

                {/* Quote block */}
                <div className="flex-1 text-center md:text-left">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium mb-6">From the Founder</div>
                  <blockquote
                    className="text-2xl md:text-3xl lg:text-[2.2rem] text-white/75 leading-tight mb-6"
                    style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
                  >
                    &quot;We are building a bridge between human intuition and machine intelligence.&quot;
                  </blockquote>
                  <p className="text-white/30 text-sm leading-relaxed max-w-md">
                    AI Spirit was conceived as a sanctuary — a place where judgment ceases to exist and conversation flows as freely as thought itself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CONTACT
        ══════════════════════════════════════ */}
        <section
          ref={contactRef}
          className="py-32 md:py-40 px-6 border-t border-white/[0.05]"
        >
          <div
            className="max-w-lg mx-auto"
            style={{
              opacity: contactVisible ? 1 : 0,
              transform: contactVisible ? 'none' : 'translateY(40px)',
              transition: 'opacity 900ms cubic-bezier(0.32,0.72,0,1), transform 900ms cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-medium">Get in Touch</span>
              </div>
              <h2
                className="text-3xl md:text-4xl text-white mb-3"
                style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
              >
                Have questions?
              </h2>
              <p className="text-white/30 text-sm">We&apos;d love to hear from you.</p>
            </div>

            {/* Double-bezel form card */}
            <div
              className="rounded-[1.5rem] p-[1px]"
              style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.025) 100%)' }}
            >
              <div
                className="bg-[#0f0f0f] rounded-[calc(1.5rem-1px)] p-8"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
              >
                {status.message && (
                  <div className={`mb-6 p-4 text-center rounded-xl text-xs border ${
                    status.type === 'success'
                      ? 'bg-white/[0.04] text-white/60 border-white/[0.07]'
                      : 'bg-red-500/[0.07] text-red-400/70 border-red-500/[0.1]'
                  }`}>
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                    { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                  ].map((field) => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-[10px] font-medium text-white/25 uppercase tracking-[0.15em] mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        id={field.id}
                        name={field.id}
                        value={formData[field.id]}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl py-3 px-4 text-white/75 text-sm placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}

                  <div>
                    <label htmlFor="message" className="block text-[10px] font-medium text-white/25 uppercase tracking-[0.15em] mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl py-3 px-4 text-white/75 text-sm placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] resize-none"
                      placeholder="Your message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full flex items-center justify-center gap-3 bg-white text-black pl-6 pr-3 py-3 rounded-full font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    {!isSubmitting && (
                      <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer className="py-8 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div
              className="text-white/25 text-sm"
              style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
            >
              © {new Date().getFullYear()} AI Spirit — All minds, always available.
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-white/20 hover:text-white/55 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-xs tracking-wide uppercase"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
