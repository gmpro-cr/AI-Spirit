import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import HeroAnimation from '@/components/home/HeroAnimation'
import Marquee from '@/components/home/Marquee'

export default function HomePage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setStatus({ type: '', message: '' })

        try {
            const response = await fetch('/api/contact-resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setStatus({ type: 'success', message: 'Message sent successfully!' })
                setFormData({ name: '', email: '', message: '' })
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to send message.' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Head>
                <title>AI Spirit - Chat with History&apos;s Greatest Minds</title>
                <meta name="description" content="Experience meaningful conversations with AI personas of history's greatest thinkers, leaders, and visionaries. Your digital sanctuary for wisdom and connection." />
                <link rel="canonical" href="https://ai-spirit.in" />
            </Head>

            <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-black selection:text-white">
                <Navbar />

                {/* === HERO SECTION === */}
                <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto gap-12 lg:gap-20">

                    {/* Left: Copy */}
                    <div className="w-full lg:w-1/2 z-10 text-center lg:text-left">
                        <div className="inline-block px-4 py-1.5 bg-black/5 rounded-full text-xs font-medium tracking-wide text-black/60 mb-6">
                            100+ AI Personas Available
                        </div>

                        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6 text-black">
                            Chat with history&apos;s
                            <span className="block text-black/40">greatest minds</span>
                        </h1>

                        <p className="text-lg md:text-xl text-black/60 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                            From Einstein to Cleopatra, Osho to Elon Musk. Have meaningful conversations with AI personas that think, respond, and inspire like the originals.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                href="/personas"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-black/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Start Chatting
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/features"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-black/70 px-6 py-4 rounded-xl font-medium hover:bg-black/5 transition-all"
                            >
                                See how it works
                            </Link>
                        </div>

                        {/* Social proof */}
                        <div className="mt-12 pt-8 border-t border-black/10 flex items-center justify-center lg:justify-start gap-8">
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-black">10K+</div>
                                <div className="text-sm text-black/50">Conversations</div>
                            </div>
                            <div className="w-px h-10 bg-black/10" />
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-black">100+</div>
                                <div className="text-sm text-black/50">Personas</div>
                            </div>
                            <div className="w-px h-10 bg-black/10" />
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-black">4.9</div>
                                <div className="text-sm text-black/50">User Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Animation */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center relative">
                        <HeroAnimation />
                    </div>
                </section>

                {/* === MARQUEE === */}
                <Marquee />

                {/* === FEATURES SECTION === */}
                <section className="py-24 md:py-32 px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-black mb-4">
                                Why AI Spirit?
                            </h2>
                            <p className="text-lg text-black/60 max-w-2xl mx-auto">
                                More than just AI chat. A sanctuary for meaningful conversations.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    ),
                                    title: '100+ Unique Personas',
                                    description: 'From philosophers to scientists, leaders to artists. Each persona has its own personality, knowledge, and communication style.'
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    ),
                                    title: 'Judgment-Free Space',
                                    description: 'Ask anything, explore any topic. Our AI personas provide wisdom without judgment, creating a safe space for growth.'
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    ),
                                    title: 'Learn & Grow',
                                    description: 'Gain insights from the greatest minds in history. Perfect for learning, reflection, or just meaningful conversation.'
                                },
                            ].map((feature, i) => (
                                <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white mb-5">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-black mb-3">{feature.title}</h3>
                                    <p className="text-black/60 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* === FOUNDER SECTION === */}
                <section className="py-24 md:py-32 px-6 bg-black text-white">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        {/* Photo */}
                        <div className="flex flex-col items-center">
                            <div className="w-40 h-40 md:w-48 md:h-48 border-2 border-white/20 rounded-full flex items-center justify-center bg-white/5">
                                <span className="font-display text-5xl md:text-6xl text-white/90">GM</span>
                            </div>
                            <div className="mt-6 text-center">
                                <h3 className="font-display text-2xl">Gaurav Mahale</h3>
                                <p className="text-white/50 text-sm mt-1">Founder</p>
                            </div>
                            <a
                                href="https://x.com/mahalegauravk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 px-5 py-2 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white hover:text-black transition-all text-sm"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                Follow
                            </a>
                        </div>

                        {/* Quote */}
                        <div className="flex-1 text-center md:text-left">
                            <blockquote className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-8">
                                &quot;We are building a bridge between human intuition and machine intelligence.&quot;
                            </blockquote>
                            <p className="text-white/60 text-lg leading-relaxed max-w-xl">
                                AI Spirit was conceived as a sanctuary—a place where judgment ceases to exist and conversation flows as freely as thought itself.
                            </p>
                        </div>
                    </div>
                </section>

                {/* === CONTACT SECTION === */}
                <section className="py-24 md:py-32 px-6 bg-white">
                    <div className="max-w-xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl sm:text-4xl text-black mb-3">Get in Touch</h2>
                            <p className="text-black/60">Have questions? We&apos;d love to hear from you.</p>
                        </div>

                        {status.message && (
                            <div className={`mb-8 p-4 text-center rounded-xl text-sm ${
                                status.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-black/70 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-black/70 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-black/70 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                                    placeholder="Your message..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* === FOOTER === */}
                <footer className="py-8 bg-black text-white/50 text-center text-sm border-t border-white/10">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>© {new Date().getFullYear()} AI Spirit. All rights reserved.</div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
