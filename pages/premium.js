import { useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import ContactModal from '@/components/ContactModal'

export default function Premium() {
    const router = useRouter()
    const { user, userProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isContactModalOpen, setIsContactModalOpen] = useState(false)

    async function handleSubscribe() {
        if (!user) {
            router.push('/auth/signin?returnTo=/premium')
            return
        }

        setLoading(true)

        try {
            // Create subscription
            const res = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: user.email,
                    userName: userProfile?.full_name || user.email.split('@')[0],
                }),
            })

            const data = await res.json()

            if (!data.success) {
                alert('Failed to create subscription. Please try again.')
                setLoading(false)
                return
            }

            // Open Razorpay checkout
            const options = {
                key: data.subscription.razorpay_key,
                subscription_id: data.subscription.id,
                name: 'AI - Spirit Premium',
                description: 'Monthly Subscription - ₹249/month',
                prefill: {
                    email: user.email,
                    name: userProfile?.full_name || '',
                },
                theme: {
                    color: '#000000',
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                    },
                },
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.error('Subscription error:', error)
            alert('Failed to start subscription. Please try again.')
            setLoading(false)
        }
    }

    // Check icon component
    const CheckIcon = () => (
        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )

    // X icon component  
    const XIcon = () => (
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    )

    return (
        <>
            <Head>
                <title>Premium Membership - Voice AI & Unlimited Chats | AI - Spirit</title>
                <meta name="description" content="Get unlimited conversations with AI personas + voice responses. Premium membership at ₹249/month. Hear your AI coach speak to you!" />
                <meta name="keywords" content="premium membership, unlimited AI chat, AI voice, AI - Spirit premium, voice AI" />
                <link rel="canonical" href="https://ai-spirit.in/premium" />
                <meta property="og:title" content="Premium Membership | AI - Spirit" />
                <meta property="og:description" content="Unlimited messages + Voice AI for just ₹249/month." />
                <meta property="og:url" content="https://ai-spirit.in/premium" />
            </Head>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="beforeInteractive"
            />
            <div className="min-h-screen bg-white text-black font-sans">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                        <button
                            onClick={() => router.push('/')}
                            className="font-display text-xl md:text-2xl font-bold text-black hover:text-gray-600 transition-colors"
                        >
                            <span className="italic">AI</span> - Spirit
                        </button>
                        <nav className="flex items-center gap-4">
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="text-base font-medium text-gray-600 hover:text-black transition-colors"
                            >
                                Contact
                            </button>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="pt-28 pb-12 px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
                        <span>🎙️</span>
                        <span>NEW: Voice responses now available!</span>
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-black">
                        Hear your AI speak
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Unlimited conversations + voice responses. Your personal AI coach that actually talks to you.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-5xl mx-auto px-6 pb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        {/* Free Plan */}
                        <div className="relative p-8 rounded-3xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition-all duration-300 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-600 mb-2">Free</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-black">₹0</span>
                                    <span className="text-gray-500">/forever</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Great for trying out AI-Spirit</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="flex items-center gap-3 text-black">
                                    <CheckIcon />
                                    <span>20 messages per day</span>
                                </li>
                                <li className="flex items-center gap-3 text-black">
                                    <CheckIcon />
                                    <span>Access to all personas</span>
                                </li>
                                <li className="flex items-center gap-3 text-black">
                                    <CheckIcon />
                                    <span>2 custom personas</span>
                                </li>
                                <li className="flex items-center gap-3 text-black">
                                    <CheckIcon />
                                    <span>7-day chat history</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <XIcon />
                                    <span>Text only (no voice)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <XIcon />
                                    <span>Standard response speed</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors mt-auto"
                            >
                                Continue Free
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="relative p-8 rounded-3xl border-2 border-black bg-white text-black shadow-2xl flex flex-col">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-4 py-1.5 rounded-full">
                                BEST VALUE
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-600 mb-2">Premium</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold">₹249</span>
                                    <span className="text-gray-500">/month</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Less than ₹9/day for unlimited AI</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="flex items-center gap-3 font-medium">
                                    <CheckIcon />
                                    <span className="text-black">Unlimited messages</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <CheckIcon />
                                    <span className="text-black">Access to all personas</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <CheckIcon />
                                    <div className="flex items-center gap-2">
                                        <span className="text-black">🎙️ Voice responses</span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">NEW</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <CheckIcon />
                                    <span className="text-black">Unlimited custom personas</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <CheckIcon />
                                    <span className="text-black">Forever chat history</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <CheckIcon />
                                    <span className="text-black">Priority AI speed</span>
                                </li>
                            </ul>

                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-black text-white font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                            >
                                {loading ? 'Processing...' : 'Get Premium'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                <div className="max-w-3xl mx-auto px-6 pb-16">
                    <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
                    <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-4 font-medium text-gray-600">Feature</th>
                                    <th className="text-center p-4 font-medium text-gray-600">Free</th>
                                    <th className="text-center p-4 font-medium text-black bg-gray-100">Premium</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="p-4">Daily messages</td>
                                    <td className="p-4 text-center">20</td>
                                    <td className="p-4 text-center bg-gray-100 font-medium">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Voice responses</td>
                                    <td className="p-4 text-center text-gray-400">—</td>
                                    <td className="p-4 text-center bg-gray-100">✓</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Chat history</td>
                                    <td className="p-4 text-center">7 days</td>
                                    <td className="p-4 text-center bg-gray-100 font-medium">Forever</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Custom personas</td>
                                    <td className="p-4 text-center">2</td>
                                    <td className="p-4 text-center bg-gray-100 font-medium">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Response speed</td>
                                    <td className="p-4 text-center text-gray-500">Standard</td>
                                    <td className="p-4 text-center bg-gray-100 font-medium">Priority</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="max-w-3xl mx-auto px-6 pb-20">
                    <div className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Secure payment via Razorpay</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>support@ai-spirit.in</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </>
    )
}
