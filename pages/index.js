import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setStatus({ type: 'success', message: 'Message sent! We\'ll get back to you soon.' })
                setFormData({ name: '', email: '', message: '' })
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to send. Please try again.' })
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
                <title>AI Spirit - Chat with your favorite AI personas</title>
                <meta name="description" content="Chat with AI-powered personas 24/7. From business icons to historical figures, celebrities to fictional characters. Start your conversation now." />
                <meta name="keywords" content="AI chat, AI personas, chat with AI, conversational AI, AI characters" />
                <link rel="canonical" href="https://ai-spirit.in" />
                <meta property="og:title" content="AI Spirit - Chat with your favorite AI personas" />
                <meta property="og:description" content="Chat with AI-powered personas 24/7. From business icons to historical figures." />
                <meta property="og:url" content="https://ai-spirit.in" />
            </Head>

            <div className="min-h-screen bg-[#FFFAFA]">
                {/* Navigation */}
                <Navbar />

                {/* Hero Section */}
                <section className="flex flex-col items-center justify-center px-6 py-12 pt-24 md:pt-28">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Hero Illustration */}
                        <div className="mb-8 animate-fadeIn">
                            <img
                                src="/hero-illustration.png"
                                alt="AI Personas"
                                className="mx-auto max-w-full h-auto"
                                style={{ maxWidth: '400px' }}
                            />
                        </div>

                        {/* Headline */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight mb-4 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                            Chat with your favorite<br />
                            <span className="text-black/80">AI personas</span>
                        </h1>

                        {/* Subtext */}
                        <p className="text-base md:text-lg text-black/60 max-w-2xl mx-auto mb-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                            From business icons to historical figures, celebrities to fictional characters.
                            Available 24/7, judgment-free.
                        </p>

                        {/* CTA Button */}
                        <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
                            <Link
                                href="/personas"
                                className="inline-flex items-center gap-3 bg-black text-[#FFFAFA] px-8 py-4 rounded-full text-lg font-medium hover:bg-black/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                Start Chatting
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>

                        {/* Scroll indicator */}
                        <div className="mt-12 animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-24 px-6 bg-black text-[#FFFAFA]">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                            About
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            {/* Founder Card */}
                            <div className="bg-[#FFFAFA]/5 border border-[#FFFAFA]/10 rounded-3xl p-8 text-center max-w-sm w-full">
                                {/* Avatar placeholder */}
                                <div className="w-24 h-24 rounded-full bg-[#FFFAFA]/10 mx-auto mb-6 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-[#FFFAFA]/60">GM</span>
                                </div>

                                <h3 className="text-2xl font-bold mb-2">Gaurav Mahale</h3>
                                <p className="text-[#FFFAFA]/60 mb-6">Founder</p>

                                {/* X Link */}
                                <a
                                    href="https://x.com/mahalegauravk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#FFFAFA]/80 hover:text-[#FFFAFA] transition-colors duration-300"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    @mahalegauravk
                                </a>
                            </div>

                            {/* About Text */}
                            <div className="max-w-md text-center md:text-left">
                                <p className="text-[#FFFAFA]/80 text-lg leading-relaxed">
                                    AI Spirit was built with a simple vision: to make AI conversations more personal and engaging.
                                </p>
                                <p className="text-[#FFFAFA]/60 mt-4 leading-relaxed">
                                    Whether you need advice, entertainment, or just someone to talk to, there&apos;s an AI persona waiting for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-24 px-6 bg-[#FFFAFA]">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 text-center">
                            Get in Touch
                        </h2>
                        <p className="text-black/60 text-center mb-12">
                            Have questions or feedback? We&apos;d love to hear from you.
                        </p>

                        {/* Status Message */}
                        {status.message && (
                            <div className={`mb-6 p-4 rounded-2xl text-center ${status.type === 'success'
                                    ? 'bg-black/5 text-black'
                                    : 'bg-black/5 text-black'
                                }`}>
                                {status.type === 'success' && '✓ '}{status.message}
                            </div>
                        )}

                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-[#FFFAFA] border border-black/10 rounded-2xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-black placeholder:text-black/40 transition-all duration-300"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-[#FFFAFA] border border-black/10 rounded-2xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-black placeholder:text-black/40 transition-all duration-300"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-5 py-4 bg-[#FFFAFA] border border-black/10 rounded-2xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-black placeholder:text-black/40 resize-none transition-all duration-300"
                                    placeholder="Your message..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-4 bg-black text-[#FFFAFA] font-medium rounded-2xl hover:bg-black/90 transition-all duration-300 disabled:bg-black/40 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 px-6 border-t border-black/5 bg-[#FFFAFA]">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-black/40 text-sm">
                            © {new Date().getFullYear()} AI Spirit. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-black/40 hover:text-black text-sm transition-colors">
                                Privacy
                            </Link>
                            <Link href="/terms" className="text-black/40 hover:text-black text-sm transition-colors">
                                Terms
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
