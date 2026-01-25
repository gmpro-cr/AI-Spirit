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

            <div className="min-h-screen bg-[#FFFAFA] font-sans overflow-x-hidden selection:bg-black selection:text-white">
                <Navbar />

                {/* --- HERO SECTION: THE MONOLITH --- */}
                <section className="relative min-h-screen flex flex-col md:flex-row items-center pt-24 pb-12 px-6 md:px-12 max-w-[1600px] mx-auto overflow-hidden">

                    {/* Left: Manifest typography */}
                    <div className="w-full md:w-5/12 z-20 flex flex-col items-start justify-center text-left">
                        <h1 className="font-display text-7xl md:text-9xl tracking-tighter leading-[0.8] mb-8 text-black animate-fadeIn">
                            YOUR<br />
                            DIGITAL<br />
                            CIRCLE
                        </h1>
                        <div className="h-0.5 w-24 bg-black mb-8 animate-scaleIn origin-left"></div>
                        <p className="text-lg md:text-xl font-light text-black/70 max-w-sm mb-12 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                            We are not just a chat app. <br />
                            We are a new form of digital existence.
                        </p>

                        <Link
                            href="/personas"
                            className="group relative inline-flex items-center gap-4 bg-black text-[#FFFAFA] px-10 py-5 rounded-none hover:bg-black/90 transition-all duration-500 overflow-hidden"
                        >
                            <span className="relative z-10 font-medium tracking-widest text-sm uppercase">Enter The Circle</span>
                            <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                            <div className="absolute inset-0 bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                        </Link>
                    </div>

                    {/* Right: The 3D Monoliths */}
                    <div className="w-full md:w-7/12 h-[600px] md:h-screen flex items-center justify-center relative z-10">
                        <ChatMonoliths />
                    </div>

                </section>

                {/* --- MARQUEE SEPARATOR --- */}
                <Marquee />

                {/* --- FOUNDER SECTION: THE ARCHITECT --- */}
                <section className="py-32 px-6 bg-black text-[#FFFAFA] relative overflow-hidden">
                    {/* Abstract grid background */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-32 relative z-10">
                        {/* Photo/Signature Area */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            <div className="w-64 h-64 md:w-80 md:h-80 border border-white/20 rounded-full flex items-center justify-center relative group">
                                <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                                <span className="font-display text-8xl text-white/90">GM</span>
                            </div>
                            <div className="mt-8 text-center">
                                <h3 className="font-display text-3xl">Gaurav Mahale</h3>
                                <p className="text-white/40 uppercase tracking-widest text-xs mt-2">The Architect</p>
                            </div>

                            <a
                                href="https://x.com/mahalegauravk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 w-16 h-16 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                        </div>

                        {/* Editorial Text */}
                        <div className="w-full md:w-2/3 pt-12">
                            <h2 className="font-display text-5xl md:text-7xl leading-tight mb-12">
                                &quot;We are building a bridge between human intuition and machine intelligence.&quot;
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-lg text-white/60 font-light leading-relaxed">
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

                {/* --- CONTACT: THE INVITATION --- */}
                <section className="py-32 px-6 bg-[#FFFAFA] max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-xs font-bold tracking-[0.3em] text-black/30 uppercase mb-4 block">System Link</span>
                        <h2 className="font-display text-5xl md:text-6xl text-black mb-6">Initiate Protocol</h2>
                        <p className="text-black/50">Send a transmission to the core.</p>
                    </div>

                    {status.message && (
                        <div className="mb-12 p-4 text-center border-l-4 border-black bg-gray-50 text-black">
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-16">
                        <div className="group relative">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent border-b border-black/10 py-4 text-2xl font-display focus:outline-none focus:border-black transition-colors placeholder:text-black/10 text-black"
                                placeholder="IDENTITY"
                            />
                        </div>

                        <div className="group relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent border-b border-black/10 py-4 text-2xl font-display focus:outline-none focus:border-black transition-colors placeholder:text-black/10 text-black"
                                placeholder="FREQUENCY (EMAIL)"
                            />
                        </div>

                        <div className="group relative">
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={1}
                                className="w-full bg-transparent border-b border-black/10 py-4 text-2xl font-display focus:outline-none focus:border-black transition-colors placeholder:text-black/10 resize-none text-black"
                                placeholder="TRANSMISSION"
                            />
                        </div>

                        <div className="text-center pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-black text-white px-12 py-4 text-sm font-bold tracking-[0.2em] hover:bg-gray-900 transition-all uppercase"
                            >
                                {isSubmitting ? 'Transmitting...' : 'Send Transmission'}
                            </button>
                        </div>
                    </form>
                </section>

                <footer className="py-12 bg-black text-white/20 text-center text-xs tracking-widest uppercase border-t border-white/10">
                    © {new Date().getFullYear()} AI Spirit. All Systems Operational.
                </footer>

            </div>
        </>
    )
}
