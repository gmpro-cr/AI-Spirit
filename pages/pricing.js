import { useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import ContactModal from '@/components/ContactModal'

export default function Pricing() {
    const router = useRouter()
    const { user, userProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isContactModalOpen, setIsContactModalOpen] = useState(false)

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
            <div className="min-h-screen bg-white text-black font-sans">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-0 md:px-2 py-4 flex justify-between items-center">
                        <button
                            onClick={() => router.push('/')}
                            className="text-xl md:text-2xl font-bold text-black pl-3 md:pl-0 hover:text-gray-600 transition-colors"
                        >
                            <span className="italic">AI</span> - Spirit
                        </button>
                        <nav className="flex items-center gap-6 pr-3 md:pr-6">
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="text-base md:text-lg font-semibold text-black hover:text-gray-600 transition-colors"
                            >
                                Contact Us
                            </button>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="pt-32 pb-20 px-6 text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-black">
                        Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">Limitless</span> Potential
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                        Experience AI conversations without boundaries. Upgrade to Premium for unlimited access and exclusive features.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-5xl mx-auto px-6 pb-24">
                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        {/* Free Plan */}
                        <div className="relative p-8 rounded-3xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-medium text-gray-700 mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-black">Free</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Perfect for getting started</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="flex items-center gap-3 text-black">
                                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>20 messages per day</span>
                                </li>
                                <li className="flex items-center gap-3 text-black">
                                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Access to basic personas</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Standard response speed</span>
                                </li>
                            </ul>

                            <button
                                disabled
                                className="w-full py-4 rounded-xl border border-gray-300 text-gray-500 font-medium cursor-not-allowed bg-white mt-auto"
                            >
                                Current Plan
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="relative p-8 rounded-3xl border-2 border-black bg-white text-black shadow-2xl flex flex-col">
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

                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Unlimited messages</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Access to ALL personas</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Faster AI responses</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Ad-free experience</span>
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Priority support</span>
                                </li>
                            </ul>

                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-black text-white font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                            >
                                {loading ? 'Processing...' : 'Get Premium Access'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-gray-600 text-sm">
                        <p className="mb-2">Secure payment via Razorpay • Cancel anytime</p>
                        <p>Need help? Contact support@ai-spirit.in</p>
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
