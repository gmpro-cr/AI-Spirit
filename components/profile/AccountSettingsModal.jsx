import { useState, useEffect, useCallback, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Image from 'next/image'

const DAILY_MESSAGE_LIMIT = 100

const THEME_OPTIONS = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'Auto' },
]

/**
 * Account panel.
 *
 * Anchored rather than centred: it belongs to the account button it opens
 * from, so on desktop it sits against the side panel's edge (tracking
 * --sidebar-w, which follows the collapse state) and on mobile it rises above
 * the bottom nav as a sheet.
 *
 * Spacing is grouped, not uniform: plan and usage read as one block, the
 * settings below them as another. Equal gaps everywhere is what made the old
 * version feel like a list of unrelated rows.
 */
export default function AccountSettingsModal({ isOpen, onClose }) {
    const { user, signOut } = useAuth()
    const { theme, setTheme } = useTheme()
    const [subscriptionStatus, setSubscriptionStatus] = useState('free')
    const [messagesUsedToday, setMessagesUsedToday] = useState(0)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const panelRef = useRef(null)
    const previouslyFocused = useRef(null)
    const headingId = useId()

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

    // Escape closes; focus moves into the panel on open and back to the
    // trigger on close, so keyboard users are not dropped at the top of the
    // page when they dismiss it.
    useEffect(() => {
        if (!isOpen) return

        previouslyFocused.current = document.activeElement
        panelRef.current?.focus()

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation()
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            const trigger = previouslyFocused.current
            if (trigger instanceof HTMLElement) trigger.focus()
        }
    }, [isOpen, onClose])

    const handleSignOut = async () => {
        await signOut()
        onClose()
    }

    if (!isOpen || !mounted) return null

    const isPremium = subscriptionStatus === 'premium'
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
    const usedRatio = Math.min(messagesUsedToday / DAILY_MESSAGE_LIMIT, 1)
    const nearLimit = usedRatio >= 0.8

    return createPortal(
        <>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-fadeIn"
                style={{ zIndex: 'var(--z-overlay)' }}
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                tabIndex={-1}
                className="
                    fixed left-3 right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)]
                    md:left-[calc(var(--sidebar-w)+0.75rem)] md:right-auto md:bottom-4 md:w-[20rem]
                    rounded-2xl bg-white dark:bg-[#141416]
                    ring-1 ring-black/[0.08] dark:ring-white/[0.10]
                    shadow-soft-xl outline-none animate-scaleIn origin-bottom
                "
                style={{ zIndex: 'var(--z-popover)' }}
            >
                {/* Identity */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    {user?.user_metadata?.avatar_url ? (
                        <Image
                            src={user.user_metadata.avatar_url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black dark:bg-white">
                            <span className="text-sm font-semibold text-white dark:text-black">
                                {user?.email?.[0]?.toUpperCase() || '?'}
                            </span>
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <p id={headingId} className="truncate text-sm font-semibold text-black dark:text-white">
                            {displayName}
                        </p>
                        <p className="truncate text-xs text-black/50 dark:text-white/50">{user?.email}</p>
                    </div>

                    {/* 40px hit area around a 16px glyph. The negative right
                        margin pulls the box out so the glyph itself lands on
                        the same 16px column as the values below it. */}
                    <button
                        onClick={onClose}
                        className="-my-2 -mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-black/40 hover:bg-black/[0.05] hover:text-black dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/25 transition-colors"
                        aria-label="Close account settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

                {/* Plan and usage — one group, tight internal spacing */}
                <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-black/55 dark:text-white/55">Plan</span>
                        {loading ? (
                            <span className="h-5 w-14 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                        ) : (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${isPremium
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'bg-black/[0.06] text-black/70 dark:bg-white/[0.10] dark:text-white/70'
                                    }`}
                            >
                                {isPremium ? 'Premium' : 'Free'}
                            </span>
                        )}
                    </div>

                    {!isPremium && (
                        <div className="mt-3">
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="text-sm text-black/55 dark:text-white/55">Messages today</span>
                                {loading ? (
                                    <span className="h-4 w-12 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                                ) : (
                                    <span className="text-sm font-medium tabular-nums text-black dark:text-white">
                                        {messagesUsedToday}
                                        <span className="text-black/40 dark:text-white/40">/{DAILY_MESSAGE_LIMIT}</span>
                                    </span>
                                )}
                            </div>

                            <div
                                className="mt-2 h-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.10]"
                                role="progressbar"
                                aria-valuenow={messagesUsedToday}
                                aria-valuemin={0}
                                aria-valuemax={DAILY_MESSAGE_LIMIT}
                                aria-label="Daily messages used"
                            >
                                <div
                                    className={`h-full rounded-full transition-[width] duration-500 ease-out ${nearLimit ? 'bg-red-500' : 'bg-black dark:bg-white'}`}
                                    style={{ width: loading ? '0%' : `${usedRatio * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {!isPremium && !loading && (
                        <button
                            onClick={() => {
                                onClose()
                                window.location.href = '/premium'
                            }}
                            className="mt-3.5 w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 dark:focus-visible:ring-white/30 transition-colors"
                        >
                            Upgrade to Premium
                        </button>
                    )}
                </div>

                <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

                {/* Appearance */}
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-black/55 dark:text-white/55">Appearance</span>
                    <div
                        className="flex items-center gap-0.5 rounded-lg bg-black/[0.05] p-0.5 dark:bg-white/[0.08]"
                        role="group"
                        aria-label="Colour theme"
                    >
                        {THEME_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                aria-pressed={theme === option.value}
                                className={`rounded-[0.4rem] px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 dark:focus-visible:ring-white/30 ${theme === option.value
                                    ? 'bg-white text-black shadow-xs dark:bg-white/[0.16] dark:text-white'
                                    : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

                {/* Sign out — no leading icon, so the label starts on the same
                    16px column as Plan, Messages today and Appearance. The red
                    already carries the destructive meaning; an icon here only
                    pushed the one row out of the column. */}
                <div className="p-2">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center rounded-xl px-2 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </>,
        document.body
    )
}
