'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        // Check if consent has already been given
        const consent = localStorage.getItem('ai-spirit-consent')
        if (!consent) {
            // Delay showing the banner for better UX
            const timer = setTimeout(() => {
                setIsVisible(true)
                setIsAnimating(true)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('ai-spirit-consent', 'accepted')
        setIsAnimating(false)
        setTimeout(() => setIsVisible(false), 300)

        // Enable analytics after consent
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
            })
        }
    }

    const handleDecline = () => {
        localStorage.setItem('ai-spirit-consent', 'declined')
        setIsAnimating(false)
        setTimeout(() => setIsVisible(false), 300)

        // Keep analytics disabled
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied',
            })
        }
    }

    if (!isVisible) return null

    return (
        <div
            className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 transition-all duration-300 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className="bg-white rounded-2xl shadow-soft-xl border border-gray-200 p-5 md:p-6">
                <div className="flex items-start gap-4">
                    {/* Cookie Icon */}
                    <div className="hidden sm:flex w-10 h-10 bg-black/5 rounded-full items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-black text-sm mb-1">Cookie Preferences</h3>
                        <p className="text-black/60 text-sm leading-relaxed mb-4">
                            We use cookies to enhance your experience. Learn more in our{' '}
                            <Link href="/privacy" className="text-black underline underline-offset-2 hover:text-black/70 transition-colors">
                                Privacy Policy
                            </Link>.
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDecline}
                                className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-5 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-black/80 transition-colors"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
