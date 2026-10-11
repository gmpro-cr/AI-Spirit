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
            role="region"
            aria-label="Cookie preferences"
            className={`fixed inset-x-3 bottom-3 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-lg z-50 transition-all duration-300 motion-reduce:transition-none ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <p className="flex-1 text-[13px] leading-snug text-black/70">
                    We use cookies for analytics.{' '}
                    <Link href="/privacy" className="text-black underline underline-offset-2 hover:text-black/70 transition-colors">
                        Privacy policy
                    </Link>
                </p>
                <button
                    onClick={handleDecline}
                    className="px-3 py-2 text-[13px] font-medium text-black/65 hover:text-black hover:bg-black/5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                    Decline
                </button>
                <button
                    onClick={handleAccept}
                    className="px-4 py-2 text-[13px] font-medium bg-black text-white rounded-full hover:bg-black/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                    Accept
                </button>
            </div>
        </div>
    )
}
