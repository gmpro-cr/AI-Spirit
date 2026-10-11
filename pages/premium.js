import { useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ContactModal from '@/components/ContactModal'
import { FAQSchema } from '@/components/seo/StructuredData'

// FAQ data for structured data
const premiumFaqs = [
    {
        question: 'What is included in AI Spirit Premium?',
        answer: 'AI Spirit Premium gives you more messages each day and the ability to create your own custom AI personas.'
    },
    {
        question: 'How much does AI Spirit Premium cost?',
        answer: 'AI Spirit Premium costs ₹249 per month.'
    },
    {
        question: 'What is the difference between Free and Premium plans?',
        answer: 'Free plan gives you a daily message allowance and access to all personas. Premium gives you more messages each day and the ability to create custom personas.'
    },
    {
        question: 'Can I cancel my AI Spirit Premium subscription?',
        answer: 'Yes, you can cancel your Premium subscription anytime. There are no long-term commitments or cancellation fees.'
    },
    {
        question: 'Can I create custom personas for free?',
        answer: 'Custom persona creation is a Premium feature. Upgrade to design your own AI characters with unique personalities and conversation styles.'
    },
    {
        question: 'Is the payment for AI Spirit Premium secure?',
        answer: 'Yes, all payments are processed securely through Razorpay, India\'s leading payment gateway. Your payment information is encrypted and protected.'
    }
]

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
            // Get the current session token for Bearer auth (more reliable than cookies in PWA)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.access_token) {
                router.push('/auth/signin?returnTo=/premium')
                return
            }

            // Create subscription
            const res = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
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
                name: 'AI Spirit Premium',
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
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )

    // X icon component  
    const XIcon = () => (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    )

    return (
        <>
            <Head>
                <title>Premium Membership - More Messages & Custom Personas | AI Spirit</title>
                <meta name="description" content="Get more daily conversations with AI personas and create your own custom AI characters. Premium membership at ₹249/month." />
                <meta name="keywords" content="premium membership, AI chat, custom AI personas, AI Spirit premium" />
                <link rel="canonical" href="https://ai-spirit.in/premium" />
                <meta property="og:title" content="Premium Membership | AI Spirit" />
                <meta property="og:description" content="More daily messages + create custom personas for ₹249/month." />
                <meta property="og:url" content="https://ai-spirit.in/premium" />
            </Head>
            <FAQSchema faqs={premiumFaqs} />
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="beforeInteractive"
            />
            <div className="min-h-screen bg-white text-black font-sans">
                {/* Navbar */}
                <Navbar />

                <section className="pt-32 sm:pt-36 pb-12 px-5 text-center">
                    <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight leading-[1.05] mb-5">
                        Go Premium
                    </h1>
                    <p className="text-lg md:text-xl text-black/70 max-w-xl mx-auto leading-relaxed">
                        More messages each day, plus personas you design yourself.
                    </p>
                </section>

                <section className="max-w-4xl mx-auto px-5 pb-16">
                    <div className="grid md:grid-cols-2 gap-4 items-stretch">
                        {/* Free plan */}
                        <div className="p-8 rounded-2xl border border-black/10 bg-white flex flex-col">
                            <h2 className="text-sm font-medium text-black/60 mb-3">Free</h2>
                            <p className="flex items-baseline gap-2 mb-1">
                                <span className="font-display text-5xl text-black">₹0</span>
                            </p>
                            <p className="text-sm text-black/60 mb-6">For getting to know AI Spirit</p>
                            <ul className="space-y-3.5 mb-8 flex-grow text-[15px]">
                                <li className="flex items-center gap-3 text-black"><CheckIcon /><span>Daily message allowance</span></li>
                                <li className="flex items-center gap-3 text-black"><CheckIcon /><span>All 350+ personas</span></li>
                                <li className="flex items-center gap-3 text-black/55"><XIcon /><span>Create custom personas</span></li>
                            </ul>
                            <button
                                onClick={() => router.push('/personas')}
                                className="w-full py-3.5 rounded-full border border-black/15 text-black font-medium hover:bg-black/[0.04] transition-colors mt-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                            >
                                Continue free
                            </button>
                        </div>

                        {/* Premium plan */}
                        <div className="p-8 rounded-2xl bg-black text-white flex flex-col">
                            <h2 className="text-sm font-medium text-white/70 mb-3">Premium</h2>
                            <p className="flex items-baseline gap-2 mb-1">
                                <span className="font-display text-5xl">₹249</span>
                                <span className="text-white/65">/month</span>
                            </p>
                            <p className="text-sm text-white/65 mb-6">Less than ₹9 a day. Cancel any time.</p>
                            <ul className="space-y-3.5 mb-8 flex-grow text-[15px]">
                                <li className="flex items-center gap-3"><CheckIcon /><span>More messages each day</span></li>
                                <li className="flex items-center gap-3"><CheckIcon /><span>All 350+ personas</span></li>
                                <li className="flex items-center gap-3"><CheckIcon /><span>Create custom personas</span></li>
                            </ul>
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full py-3.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing…
                                    </span>
                                ) : (
                                    'Get Premium'
                                )}
                            </button>
                        </div>
                    </div>

                    <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-black/60">
                        <li>Secure payment via Razorpay</li>
                        <li>Cancel any time</li>
                        <li><a href="mailto:support@ai-spirit.in" className="hover:text-black underline-offset-2 hover:underline">support@ai-spirit.in</a></li>
                    </ul>
                </section>
            </div>

            <Footer />
            {/* Keeps the footer clear of the fixed mobile nav */}
            <div className="h-16 md:hidden" aria-hidden="true" />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </>
    )
}
