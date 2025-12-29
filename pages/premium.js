import { useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
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
            <div className="min-h-screen bg-white text-black font-sans pb-24 md:pb-0 transition-colors">
                {/* Navbar */}
                <Navbar />

                {/* Hero Section */}
                <div className="pt-28 pb-12 px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-indigo-700 text-sm font-semibold px-5 py-2.5 rounded-full mb-8 shadow-sm border border-indigo-100">
                        <span>🎙️</span>
                        <span>NEW: Voice responses now available!</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                        Hear your AI speak
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Unlimited conversations + voice responses. Your personal AI coach that actually talks to you.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-5xl mx-auto px-6 pb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        {/* Free Plan */}
                        <div className="relative p-8 rounded-3xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col group">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2 uppercase tracking-wide">Free</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-black">₹0</span>
                                    <span className="text-gray-500 font-medium">/forever</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-3">Great for trying out AI-Spirit</p>
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
                                className="w-full py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all mt-auto shadow-sm hover:shadow"
                            >
                                Continue Free
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="relative p-8 rounded-3xl border-2 border-black bg-gradient-to-b from-white to-gray-50 text-black shadow-2xl hover:shadow-3xl flex flex-col transition-all duration-300 hover:scale-[1.02] group">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
                                ⭐ BEST VALUE
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2 uppercase tracking-wide">Premium</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">₹249</span>
                                    <span className="text-gray-500 font-medium">/month</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-3 font-medium">Less than ₹9/day for unlimited AI</p>
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
                                className="w-full py-5 rounded-xl bg-gradient-to-r from-black via-gray-800 to-black text-white font-bold text-lg hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed mt-auto hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    'Get Premium ✨'
                                )}
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

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
                    <div className="flex justify-around items-center h-16 px-2">
                        {/* Home */}
                        <Link
                            href="/"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Home</span>
                        </Link>

                        {/* Chats */}
                        <Link
                            href="/chats"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Chats</span>
                        </Link>

                        {/* Create */}
                        <Link
                            href="/personas"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Create</span>
                        </Link>

                        {/* Account */}
                        <Link
                            href="/auth/signin"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Account</span>
                        </Link>
                    </div>
                </nav>
            </div>

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </>
    )
}
