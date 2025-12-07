import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

export default function AccountSettingsModal({ isOpen, onClose }) {
    const { user, userProfile, signOut } = useAuth()
    const [subscriptionStatus, setSubscriptionStatus] = useState('free')
    const [messagesUsedToday, setMessagesUsedToday] = useState(0)
    const [loading, setLoading] = useState(true)
    const [darkMode, setDarkMode] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        if (isOpen && user) {
            loadSubscriptionStatus()
            loadDarkModePreference()
        }
    }, [isOpen, user])

    const loadSubscriptionStatus = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/user/subscription-status')
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
    }

    const loadDarkModePreference = () => {
        const saved = localStorage.getItem('esperit_dark_mode')
        setDarkMode(saved === 'true')
    }

    const toggleDarkMode = () => {
        const newValue = !darkMode
        setDarkMode(newValue)
        localStorage.setItem('esperit_dark_mode', String(newValue))
        // Apply dark mode to document
        if (newValue) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

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
            <div className="fixed bottom-20 left-4 md:left-72 w-80 bg-white rounded-xl shadow-2xl z-[9999] overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
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
                            <p className="font-semibold text-black truncate">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Subscription Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Subscription</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${subscriptionStatus === 'premium'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                            {loading ? '...' : subscriptionStatus === 'premium' ? '⭐ Premium' : 'Free'}
                        </span>
                    </div>

                    {/* Messages Used */}
                    {subscriptionStatus !== 'premium' && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Messages Today</span>
                            <span className="text-sm font-medium text-gray-900">
                                {loading ? '...' : `${messagesUsedToday}/20`}
                            </span>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dark Mode</span>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-black' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Upgrade Button (for free users) */}
                    {subscriptionStatus !== 'premium' && (
                        <button
                            onClick={() => {
                                onClose()
                                window.location.href = '/premium'
                            }}
                            className="w-full py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Upgrade to Premium
                        </button>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
