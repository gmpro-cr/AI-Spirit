import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function Pricing() {
    const router = useRouter()
    const { user, userProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [isPremium, setIsPremium] = useState(false)

    useEffect(() => {
        if (user) {
            checkSubscriptionStatus()
        }
    }, [user])

    async function checkSubscriptionStatus() {
        try {
            const res = await fetch(`/api/user/subscription-status?userId=${user.id}`)
            const data = await res.json()
            setIsPremium(data.isPremium)
        } catch (error) {
            console.error('Failed to check subscription:', error)
        }
    }

    async function handleSubscribe() {
        if (!user) {
            router.push('/auth/signin?returnTo=/pricing')
            return
        }

        setLoading(true)

        try {
            // Create subscription
            const res = await fetch('/api/razorpay/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email,
                    userName: userProfile?.full_name || user.email.split('@')[0],
                }),
            })

            const data = await res.json()

            if (!data.success) {
                alert(data.error || 'Failed to create subscription')
                setLoading(false)
                return
            }

            // Open Razorpay checkout
            const options = {
                key: data.subscription.razorpay_key,
                subscription_id: data.subscription.id,
                name: 'AI-Spirit Premium',
                description: 'Monthly Subscription - ₹499/month',
                handler: async function (response) {
                    // Verify payment
                    const verifyRes = await fetch('/api/razorpay/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user.id,
                        }),
                    })

                    const verifyData = await verifyRes.json()

                    if (verifyData.success) {
                        alert('🎉 Welcome to Premium! Your subscription is now active.')
                        router.push('/dashboard')
                    } else {
                        alert('Payment verification failed. Please contact support.')
                    }
                    setLoading(false)
                },
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
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
                {/* Header */}
                <header className="p-4 border-b bg-white/80 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-black">AI-Spirit</h1>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition"
                        >
                            Dashboard
                        </button>
                    </div>
                </header>

                {/* Pricing Content */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                            Choose Your Plan
                        </h2>
                        <p className="text-xl text-gray-600">
                            Unlock unlimited conversations with AI personas
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-black mb-2">Free</h3>
                                <div className="text-4xl font-bold text-black mb-4">
                                    ₹0<span className="text-lg text-gray-600">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">20 messages per day</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">Access to select personas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-gray-400">Standard response time</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-gray-400">Limited chat history</span>
                                </li>
                            </ul>

                            <button
                                className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold cursor-not-allowed"
                                disabled
                            >
                                Current Plan
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 border-2 border-purple-400 relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                                POPULAR
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                                <div className="text-4xl font-bold text-white mb-4">
                                    ₹499<span className="text-lg text-purple-200">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white font-semibold">Unlimited messages</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white font-semibold">Access to ALL personas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white font-semibold">Faster AI responses</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white font-semibold">Ad-free experience</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white font-semibold">Early access to voice chat</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-white font-semibold">Extended chat history</span>
                                </li>
                            </ul>

                            <button
                                onClick={handleSubscribe}
                                disabled={loading || isPremium}
                                className="w-full py-3 px-6 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPremium ? '✓ Already Subscribed' : loading ? 'Processing...' : 'Subscribe Now'}
                            </button>
                        </div>
                    </div>

                    {/* FAQ/Info */}
                    <div className="mt-16 text-center text-gray-600">
                        <p className="mb-2">✓ Cancel anytime • ✓ Secure payment via Razorpay • ✓ Instant activation</p>
                        <p className="text-sm">Have questions? Contact support@ai-spirit.in</p>
                    </div>
                </div>
            </div>
        </>
    )
}
