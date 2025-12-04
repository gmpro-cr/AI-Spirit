import { useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function Pricing() {
    const router = useRouter()
    const { user, userProfile } = useAuth()
    const [loading, setLoading] = useState(false)

    async function handleSubscribe() {
        if (!user) {
            router.push('/auth/signin?returnTo=/pricing')
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
                name: 'AI-Spirit Premium',
                description: 'Monthly Subscription - ₹499/month',
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

    return (
        <>
            <Head>
                <title>Pricing - AI-Spirit Premium</title>
            </Head>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="beforeInteractive"
            />
            <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                    <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                        <h1 className="text-2xl font-bold tracking-tighter">AI-Spirit</h1>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-300"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="pt-32 pb-20 px-6 text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Limitless</span> Potential
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                        Experience AI conversations without boundaries. Upgrade to Premium for unlimited access and exclusive features.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-5xl mx-auto px-6 pb-24">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <div className="relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                            <div className="mb-8">
                                <h3 className="text-xl font-medium text-gray-300 mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">Free</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Perfect for getting started</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>20 messages per day</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Access to basic personas</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Standard response speed</span>
                                </li>
                            </ul>

                            <button
                                disabled
                                className="w-full py-4 rounded-xl border border-white/10 text-gray-400 font-medium cursor-not-allowed"
                            >
                                Current Plan
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="relative p-8 rounded-3xl border border-white bg-white text-black transform md:-translate-y-4 shadow-2xl shadow-white/10">
                            <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                                MOST POPULAR
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-medium mb-2">Premium</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold">₹499</span>
                                    <span className="text-gray-600 font-medium">/month</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">For power users who want more</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Unlimited messages</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Access to ALL personas</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Faster AI responses</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Ad-free experience</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Priority support</span>
                                </li>
                            </ul>

                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-black text-white font-bold text-lg hover:bg-gray-900 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Get Premium Access'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-gray-500 text-sm">
                        <p className="mb-2">Secure payment via Razorpay • Cancel anytime</p>
                        <p>Need help? Contact support@ai-spirit.in</p>
                    </div>
                </div>
            </div>
        </>
    )
}
