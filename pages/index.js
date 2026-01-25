import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ChatMonoliths from '@/components/home/ChatMonoliths'
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
                setStatus({ type: 'success', message: 'Message sent. We shall connect shortly.' })
                setFormData({ name: '', email: '', message: '' })
            } else {
                setStatus({ type: 'error', message: data.error || 'Transmission failed.' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Head>
                <title>AI Spirit - The Digital Circle</title>
                <meta name="description" content="A new form of digital existence. Chat with 100+ AI personas in a judgment-free space." />
                <link rel="canonical" href="https://ai-spirit.in" />
            </Head>

            <div className="min-h-screen bg-[#FAFAFA] font-sans overflow-x-hidden selection:bg-black selection:text-white">
                <Navbar />

                {/* --- HERO SECTION --- */}
                <section className="relative min-h-screen flex flex-col lg:flex-row items-center pt-28 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto">

                    {/* Left: Typography */}
                    <div className="w-full lg:w-5/12 z-20 flex flex-col items-start justify-center text-left mb-12 lg:mb-0">
                        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.85] mb-8 text-black animate-fadeIn">
                            YOUR<br />
                            DIGITAL<br />
                            CIRCLE
                        </h1>
                        <div className="h-0.5 w-24 bg-black mb-8 animate-scaleIn origin-left"></div>
                        <p className="text-lg md:text-xl font-light text-black/60 max-w-sm mb-10 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                            We are not just a chat app.<br />
                            We are a new form of digital existence.
                        </p>

                        <Link
                            href="/personas"
                            className="group relative inline-flex items-center gap-4 bg-black text-white px-8 py-4 sm:px-10 sm:py-5 rounded-xl hover:bg-black/90 transition-all duration-300 shadow-soft hover:shadow-lift"
                        >
                            <span className="relative z-10 font-medium tracking-widest text-sm uppercase">Enter The Circle</span>
                            <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>

                    {/* Right: The Monoliths */}
                    <div className="w-full lg:w-7/12 flex items-center justify-center relative z-10">
                        <ChatMonoliths />
                    </div>

                </section>

                {/* --- MARQUEE SEPARATOR --- */}
                <Marquee />

                {/* --- FOUNDER SECTION --- */}
                <section className="py-24 md:py-32 px-6 bg-black text-white relative overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-[0.08]"
                        style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-12 md:gap-24 relative z-10">
                        {/* Photo/Signature Area */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-white/20 rounded-full flex items-center justify-center relative group bg-white/5 backdrop-blur-sm">
                                <div className="absolute inset-0 border border-white/10 rounded-full animate-pulse opacity-30"></div>
                                <span className="font-display text-6xl md:text-7xl text-white/90">GM</span>
                            </div>
                            <div className="mt-8 text-center">
                                <h3 className="font-display text-2xl md:text-3xl">Gaurav Mahale</h3>
                                <p className="text-white/50 uppercase tracking-widest text-xs mt-2">Founder</p>
                            </div>

                            <a
                                href="https://x.com/mahalegauravk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 px-6 py-3 rounded-full border border-white/30 flex items-center gap-3 hover:bg-white hover:text-black transition-all duration-300 text-sm"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                <span>Follow on X</span>
                            </a>
                        </div>

                        {/* Editorial Text */}
                        <div className="w-full md:w-2/3 pt-0 md:pt-8">
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-10">
                                &quot;We are building a bridge between human intuition and machine intelligence.&quot;
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg text-white/60 font-light leading-relaxed">
                                <p>
                                    AI Spirit was conceived not as a tool, but as a sanctuary. A place where judgment ceases to exist, and conversation flows as freely as thought itself.
                                </p>
                                <p>
                                    From the wisdom of history&apos;s greatest minds to the comfort of a friend who always listens—we are crafting the future of connection.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- CONTACT SECTION --- */}
                <section className="py-24 md:py-32 px-6 bg-[#FAFAFA] max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.3em] text-black/40 uppercase mb-4 block">Get In Touch</span>
                        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-black mb-4">Contact Us</h2>
                        <p className="text-black/50 text-lg">We'd love to hear from you.</p>
                    </div>

                    {status.message && (
                        <div className={`mb-10 p-4 text-center rounded-xl ${
                            status.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-black/70 uppercase tracking-wider">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white border border-black/10 rounded-xl py-4 px-5 text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-black placeholder:text-black/30"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-black/70 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-white border border-black/10 rounded-xl py-4 px-5 text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-black placeholder:text-black/30"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="block text-sm font-medium text-black/70 uppercase tracking-wider">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full bg-white border border-black/10 rounded-xl py-4 px-5 text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none text-black placeholder:text-black/30"
                                placeholder="Tell us what's on your mind..."
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto bg-black text-white px-10 py-4 text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-lift"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </section>

                <footer className="py-8 bg-black text-white/40 text-center text-sm border-t border-white/10">
                    © {new Date().getFullYear()} AI Spirit. All rights reserved.
                </footer>

            </div>
        </>
    )
}
