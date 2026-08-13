import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import AccountSettingsModal from '@/components/profile/AccountSettingsModal'
import { listConversations, subscribeToConversations } from '@/lib/conversationStore'
import { relativeTime, absoluteTime } from '@/lib/relativeTime'

const COLLAPSED_KEY = 'aispirit_sidebar_collapsed'
// Below this many conversations a search field is noise, not help.
const SEARCH_THRESHOLD = 6

export default function SidePanel({ onBack, backButtonText, showPastChats = true, onCreatePersona, hasNavbar = true }) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [pastChats, setPastChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')

  // The panel used to read localStorage once on mount, so a conversation
  // started in the current session never showed up. Subscribe instead.
  useEffect(() => {
    if (!showPastChats) {
      setPastChats([])
      setLoading(false)
      return
    }

    setPastChats(listConversations())
    setLoading(false)

    return subscribeToConversations(setPastChats)
  }, [showPastChats])

  // The collapse itself is CSS, keyed off data-sidebar on <html>, which the
  // bootstrap script in _document.js sets before first paint. This state only
  // mirrors it so the toggle can label itself correctly; it deliberately does
  // not drive layout, because React state would arrive a frame too late.
  useEffect(() => {
    setCollapsed(document.documentElement.dataset.sidebar === 'collapsed')
  }, [])

  const toggleCollapsed = () => {
    const next = document.documentElement.dataset.sidebar !== 'collapsed'
    document.documentElement.dataset.sidebar = next ? 'collapsed' : 'expanded'
    setCollapsed(next)
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
    } catch {
      // Private-mode storage failures are not worth surfacing.
    }
  }

  const filteredChats = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pastChats
    return pastChats.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.personaName?.toLowerCase().includes(q)
    )
  }, [pastChats, query])

  const activeConversationId = router.query.conversationId

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const railButton = (
    <div className="app-sidebar-rail-only flex-col items-center gap-2 pt-5">
      <button
        onClick={toggleCollapsed}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-black/50 dark:text-white/50 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white transition-colors"
        aria-label="Expand sidebar"
        title="Expand sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {onBack && (
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-black/50 dark:text-white/50 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white transition-colors"
          aria-label={backButtonText || 'Back'}
          title={backButtonText || 'Back'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  )

  return (
    <aside
      className={`app-sidebar bg-white/80 dark:bg-[#0B0B0C]/80 backdrop-blur-xl flex flex-col hidden md:flex fixed left-0 z-20 transition-colors ${hasNavbar ? 'h-[calc(100vh-5rem)] top-20' : 'h-screen top-0'}`}
      style={{ boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, 0.04), inset 1px 0 0 rgba(255, 255, 255, 0.7)' }}
    >
      {railButton}

      <div className="app-sidebar-body flex flex-col flex-1 overflow-hidden">

        {/* Brand header (shown when there is no top navbar) */}
        {!hasNavbar && (
          <div className="px-5 h-[72px] flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="w-12 h-12 bg-black rounded-[0.75rem] overflow-hidden flex-shrink-0 group-hover:opacity-80 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="AI Spirit" className="w-full h-full object-cover" />
              </div>
            </Link>
            <button
              onClick={toggleCollapsed}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-black/40 dark:text-white/40 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:text-black transition-colors"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Back navigation */}
        {onBack && (
          <div className="flex items-center justify-between h-[72px] px-5 border-b border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              {backButtonText || 'Back'}
            </button>
            {hasNavbar && (
              <button
                onClick={toggleCollapsed}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-black/40 dark:text-white/40 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:text-black transition-colors"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        )}


        {/* Create Persona button */}
        {onCreatePersona && (
          <div className="px-4 pt-2 pb-2 flex-shrink-0">
            <button
              onClick={onCreatePersona}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:bg-black/90 dark:hover:bg-white/90 transition-all duration-200 font-medium text-sm group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Persona
            </button>
          </div>
        )}

        {/* Recent chats */}
        {showPastChats && (
          <>
            <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
              <p className="text-[10px] font-semibold text-black/60 dark:text-white/60 uppercase tracking-widest">Recent Chats</p>
              {/* Pages without a brand header or a back row (e.g. /personas)
                  would otherwise have no way to collapse the panel. */}
              {hasNavbar && !onBack && (
                <button
                  onClick={toggleCollapsed}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-black/40 dark:text-white/40 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white transition-colors"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>

            {pastChats.length >= SEARCH_THRESHOLD && (
              <div className="px-3 pb-2 flex-shrink-0">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/30 dark:text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search chats"
                    aria-label="Search conversations"
                    className="w-full rounded-lg bg-black/[0.04] dark:bg-white/[0.04] py-1.5 pl-8 pr-2 text-xs text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 focus:bg-black/[0.06] dark:focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
              {loading ? (
                <div className="px-2 space-y-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-black/[0.04] dark:bg-white/[0.04] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredChats.length > 0 ? (
                <ul className="space-y-0.5">
                  {filteredChats.map((chat) => {
                    const isActive = chat.id === activeConversationId
                    return (
                      <li key={chat.id}>
                        <button
                          onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
                          className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm transition-all duration-200 group ${isActive
                            ? 'bg-black/[0.06] dark:bg-white/[0.06] text-black dark:text-white'
                            : 'text-black/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-black'
                            }`}
                          aria-current={isActive ? 'true' : undefined}
                        >
                          {chat.personaImage && (
                            <Image
                              src={chat.personaImage}
                              alt={chat.personaName}
                              width={32}
                              height={32}
                              className={`w-8 h-8 rounded-full object-cover flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-[10px] font-medium text-black/60 dark:text-white/60 truncate mb-0.5 uppercase tracking-wide">
                                {chat.personaName}
                              </p>
                              {chat.updatedAt && (
                                <span
                                  className="flex-shrink-0 text-[10px] text-black/35 dark:text-white/35"
                                  title={absoluteTime(chat.updatedAt)}
                                >
                                  {relativeTime(chat.updatedAt)}
                                </span>
                              )}
                            </div>
                            {/* The title is the opening message, kept stable — it
                                is what tells two chats with one persona apart. */}
                            <p className="text-xs truncate text-black/70 dark:text-white/70 group-hover:text-black">{chat.title}</p>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : query ? (
                <p className="text-xs text-black/50 dark:text-white/50 px-2">No chats match “{query}”</p>
              ) : (
                <p className="text-xs text-black/60 dark:text-white/60 px-2">No recent chats yet</p>
              )}
            </div>
          </>
        )}

        {!showPastChats && <div className="flex-1" />}
      </div>

      {/* User section */}
      <div className="app-sidebar-body border-t border-black/[0.06] dark:border-white/[0.06] px-4 py-4 flex-shrink-0">
        {user ? (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center w-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-xl px-2 py-2 transition-colors group"
          >
            <div className="flex items-center min-w-0 flex-1">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-black/[0.06] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] mr-3 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-black/60 dark:text-white/60">
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black/80 dark:text-white/80 truncate group-hover:text-black transition-colors leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] text-black/60 dark:text-white/60 mt-0.5">Account settings</p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-black/45 dark:text-white/45 group-hover:text-black/60 dark:group-hover:text-white/60 ml-2 flex-shrink-0 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => router.push('/auth/signin')}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:bg-black/90 dark:hover:bg-white/90 transition-all duration-200 font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </button>
        )}
      </div>

      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </aside>
  )
}
