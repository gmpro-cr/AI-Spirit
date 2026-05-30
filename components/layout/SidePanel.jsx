import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import AccountSettingsModal from '@/components/profile/AccountSettingsModal'

export default function SidePanel({ onBack, backButtonText, showPastChats = true, onCreatePersona, hasNavbar = true }) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [pastChats, setPastChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    if (!showPastChats) {
      setPastChats([])
      setLoading(false)
      return
    }
    try {
      const conversationsList = JSON.parse(localStorage.getItem('esperit_conversations') || '[]')
      setPastChats(conversationsList)
    } catch (error) {
      console.error('Error loading past chats:', error)
      setPastChats([])
    } finally {
      setLoading(false)
    }
  }, [showPastChats])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/personas',
      label: 'Personas',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: '/premium',
      label: 'Premium',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ]

  return (
    <aside className={`w-64 bg-white border-r border-black/[0.06] flex flex-col hidden md:flex fixed left-0 transition-colors ${hasNavbar ? 'h-[calc(100vh-5rem)] top-20' : 'h-screen top-0'}`}>
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Brand header (shown when there is no top navbar) */}
        {!hasNavbar && (
          <div className="px-5 h-16 flex items-center border-b border-black/[0.06] flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="w-12 h-12 bg-black rounded-[0.75rem] overflow-hidden flex-shrink-0 group-hover:opacity-80 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="AI Spirit" className="w-full h-full object-cover" />
              </div>
            </Link>
          </div>
        )}

        {/* Back navigation */}
        {onBack && (
          <div className="flex items-center h-[72px] px-5 border-b border-black/[0.06] flex-shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-black/40 hover:text-black transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              {backButtonText || 'Back'}
            </button>
          </div>
        )}

        {/* Navigation links (only shown when no back button) */}
        {!onBack && (
          <div className="px-3 pt-5 pb-3 flex-shrink-0">
            <p className="text-[10px] font-semibold text-black/30 uppercase tracking-widest px-2 mb-2">Navigate</p>
            {navItems.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-black/50 hover:bg-black/[0.04] hover:text-black'
                  }`}
                >
                  {item.icon(isActive)}
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Create Persona button */}
        {onCreatePersona && (
          <div className="px-4 pt-2 pb-2 flex-shrink-0">
            <button
              onClick={onCreatePersona}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-200 font-medium text-sm group"
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
            <div className="px-5 pt-4 pb-2 flex-shrink-0">
              <p className="text-[10px] font-semibold text-black/30 uppercase tracking-widest">Recent Chats</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
              {loading ? (
                <div className="px-2 space-y-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-black/[0.04] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : pastChats.length > 0 ? (
                <ul className="space-y-0.5">
                  {pastChats.map((chat) => (
                    <li key={chat.id}>
                      <button
                        onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
                        className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm text-black/50 hover:bg-black/[0.04] hover:text-black transition-all duration-200 group"
                      >
                        {chat.personaImage && (
                          <Image
                            src={chat.personaImage}
                            alt={chat.personaName}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-black/30 group-hover:text-black/50 truncate mb-0.5 uppercase tracking-wide">{chat.personaName}</p>
                          <p className="text-xs truncate text-black/70 group-hover:text-black">{chat.title}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-black/30 px-2">No recent chats yet</p>
              )}
            </div>
          </>
        )}

        {!showPastChats && <div className="flex-1" />}
      </div>

      {/* User section */}
      <div className="border-t border-black/[0.06] px-4 py-4 flex-shrink-0">
        {user ? (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center w-full hover:bg-black/[0.04] rounded-xl px-2 py-2 transition-colors group"
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
                <div className="w-8 h-8 rounded-full bg-black/[0.06] border border-black/[0.08] mr-3 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-black/60">
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black/80 truncate group-hover:text-black transition-colors leading-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] text-black/30 mt-0.5">Account settings</p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-black/20 group-hover:text-black/40 ml-2 flex-shrink-0 transition-colors"
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
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-black/90 transition-all duration-200 font-medium text-sm"
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
