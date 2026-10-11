import { useState } from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
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
                setStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' })
                setFormData({ name: '', email: '', message: '' })
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Head>
                <title>Contact Us - AI Spirit</title>
                <meta name="description" content="Get in touch with AI Spirit. We'd love to hear from you!" />
            </Head>

            <Navbar />

            <main className="min-h-screen bg-white pt-32 sm:pt-36 pb-24 px-5">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="font-display text-4xl sm:text-5xl text-black leading-tight mb-3">Contact us</h1>
                        <p className="text-black/65 leading-relaxed">
                            Questions, feedback, or a persona you&apos;d like us to add.
                        </p>
                    </div>

                    {status.message && (
                        <div
                            role="status"
                            className={`mb-6 p-4 rounded-xl text-sm text-center ${status.type === 'success'
                                ? 'bg-black/[0.04] text-black border border-black/10'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-black/75 mb-2">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-black/[0.04] border border-black/10 rounded-xl py-3 px-4 text-base md:text-sm text-black placeholder:text-black/45 focus:outline-none focus-visible:border-black/40 focus-visible:ring-2 focus-visible:ring-black/20 transition-colors"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-black/75 mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black/[0.04] border border-black/10 rounded-xl py-3 px-4 text-base md:text-sm text-black placeholder:text-black/45 focus:outline-none focus-visible:border-black/40 focus-visible:ring-2 focus-visible:ring-black/20 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-black/75 mb-2">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                className="w-full bg-black/[0.04] border border-black/10 rounded-xl py-3 px-4 text-base md:text-sm text-black placeholder:text-black/45 focus:outline-none focus-visible:border-black/40 focus-visible:ring-2 focus-visible:ring-black/20 transition-colors resize-none"
                                placeholder="How can we help?"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-black px-6 py-3.5 text-[15px] font-medium text-white transition-all duration-300 hover:bg-black/90 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                        >
                            {isSubmitting ? 'Sending…' : 'Send message'}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </>
    )
}
