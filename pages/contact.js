import { useState } from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'

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
                <title>Contact Us - AI - Spirit</title>
                <meta name="description" content="Get in touch with AI - Spirit. We'd love to hear from you!" />
            </Head>

            <Navbar />

            <div className="min-h-screen bg-white dark:bg-spirit-bg-dark pt-24 pb-12 px-4 transition-colors">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-black dark:text-spirit-primary-dark mb-2">Contact Us</h1>
                        <p className="text-gray-600 dark:text-gray-400">We&apos;d love to hear from you. Send us a message!</p>
                    </div>

                    {/* Status Message */}
                    {status.message && (
                        <div className={`mb-6 p-4 rounded-lg ${status.type === 'success'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                            {status.message}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white dark:bg-spirit-bg-secondary-dark border border-gray-300 dark:border-spirit-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-spirit-accent text-black dark:text-spirit-primary-dark transition-colors"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white dark:bg-spirit-bg-secondary-dark border border-gray-300 dark:border-spirit-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-spirit-accent text-black dark:text-spirit-primary-dark transition-colors"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-4 py-3 bg-white dark:bg-spirit-bg-secondary-dark border border-gray-300 dark:border-spirit-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-spirit-accent text-black dark:text-spirit-primary-dark resize-none transition-colors"
                                placeholder="Your message..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-6 py-3 bg-black dark:bg-spirit-accent text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-spirit-accent/90 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
