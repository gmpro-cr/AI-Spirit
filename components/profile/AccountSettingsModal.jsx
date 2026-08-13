import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Image from 'next/image'

export default function AccountSettingsModal({ isOpen, onClose }) {
    const { user, userProfile, signOut } = useAuth()
    const { theme, setTheme } = useTheme()
    const [subscriptionStatus, setSubscriptionStatus] = useState('free')
    const [messagesUsedToday, setMessagesUsedToday] = useState(0)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const loadSubscriptionStatus = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            const res = await fetch(`/api/user/subscription-status?userId=${user.id}`)
            if (res.ok) {
                const data = await res.json()
                setSubscriptionStatus(data.status || 'free')
                setMessagesUsedToday(data.messagesUsedToday || 0)
            }
        } catch (error) {
            console.error('Error loading subscription status:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (isOpen && user) {
            loadSubscriptionStatus()
        }
    }, [isOpen, user, loadSubscriptionStatus])

    const handleSignOut = async () => {
        await signOut()
        onClose()
    }

    if (!isOpen || !mounted) return null

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[9998]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-20 right-2 md:left-72 md:right-auto w-80 bg-white dark:bg-[#141416] rounded-xl shadow-2xl z-[9999] overflow-hidden border border-gray-200 dark:border-white/[0.12]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-white/[0.10] bg-gray-50 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        {user?.user_metadata?.avatar_url ? (
                            <Image
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                                <span className="text-lg font-bold text-white">
                                    {user?.email?.[0]?.toUpperCase() || '?'}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-black dark:text-white truncate">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-white/50 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-white/[0.14] rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Subscription Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-white/60">Subscription</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${subscriptionStatus === 'premium'
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-700 dark:bg-white/[0.08] dark:text-white/80'
                            }`}>
                            {loading ? '...' : subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
                        </span>
                    </div>

                    {/* Messages Used */}
                    {subscriptionStatus !== 'premium' && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-white/60">Messages Today</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {loading ? '...' : `${messagesUsedToday}/100`}
                            </span>
                        </div>
                    )}

                    {/* Upgrade Button (for free users) */}
                    {subscriptionStatus !== 'premium' && (
                        <button
                            onClick={() => {
                                onClose()
                                window.location.href = '/premium'
                            }}
                            className="w-full py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
                        >
                            Upgrade to Premium
                        </button>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-white/[0.12]" />

                    {/* Appearance */}
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-600 dark:text-white/60">Appearance</span>
                        <div
                            className="flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.08] p-0.5"
                            role="group"
                            aria-label="Colour theme"
                        >
                            {[
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'system', label: 'Auto' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value)}
                                    aria-pressed={theme === option.value}
                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${theme === option.value
                                        ? 'bg-white dark:bg-white/[0.16] text-black dark:text-white shadow-xs'
                                        : 'text-gray-500 dark:text-white/50 hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-white/[0.12]" />

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        className="w-full py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </>,
        document.body
    )
}
