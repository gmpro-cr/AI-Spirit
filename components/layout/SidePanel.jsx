import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function SidePanel() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [recentPersonas, setRecentPersonas] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting to prevent SSR issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Load recent personas with chat history from localStorage
    const loadRecentChats = () => {
      if (typeof window === 'undefined') return
      const recent = JSON.parse(localStorage.getItem('esperit_recent_personas') || '[]')

      // For each persona, get their last message from localStorage
      const recentWithMessages = recent.slice(0, 5).map(persona => {
        const guestData = localStorage.getItem(`esperit_guest_${persona.slug}`)
        let lastMessage = null

        if (guestData) {
          try {
            const { messages } = JSON.parse(guestData)
            if (messages && messages.length > 0) {
              // Get the last user message
              const userMessages = messages.filter(m => m.role === 'user')
              if (userMessages.length > 0) {
                lastMessage = userMessages[userMessages.length - 1].content
              }
            }
          } catch (error) {
            console.error('Error loading chat history:', error)
          }
        }

        return {
          ...persona,
          lastMessage
        }
      })

      setRecentPersonas(recentWithMessages)
    }

    loadRecentChats()

    // Reload when window gains focus (in case chats were updated)
    window.addEventListener('focus', loadRecentChats)
    return () => window.removeEventListener('focus', loadRecentChats)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleCreatePersona = () => {
    // Navigate to personas page and trigger modal
    router.push('/personas?create=true')
  }

  // Get username from Google metadata or email
  const getDisplayName = () => {
    if (!user) return 'Guest User'

    // Try to get name from Google OAuth metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name
    if (fullName) return fullName

    // Fallback to email username
    return user.email?.split('@')[0] || 'User'
  }

  const displayName = getDisplayName()

  // Don't render until mounted to avoid SSR hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Side Panel */}
      <div className={`fixed left-0 top-[65px] h-[calc(100vh-65px)] w-64 bg-black-secondary/98 backdrop-blur-xl border-r border-white/15 z-40 flex flex-col transition-transform duration-400 ease-premium ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-[4px_0_24px_-2px_rgba(0,0,0,0.5)]`}>
      {/* Action Buttons */}
      <div className="p-4 border-b border-white/10">
        {/* Explore Button */}
        <Link
          href="/personas"
          className="group relative block w-full bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 text-white text-sm font-semibold px-4 py-3 rounded-full hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/45 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_4px_12px_rgba(255,255,255,0.12)] transition-all duration-400 ease-premium text-center overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
          <span className="relative z-10 tracking-wide">Explore</span>
        </Link>
      </div>

      {/* Recent Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-bold text-white mb-4 tracking-tight">Recent Chats</h3>

        {recentPersonas.length > 0 ? (
          <div className="space-y-2.5">
            {recentPersonas.map((persona) => (
              <Link
                key={persona.slug}
                href={`/chat/${persona.slug}`}
                className="group relative block p-3 bg-gradient-to-br from-white/10 via-white/7 to-white/4 backdrop-blur-2xl border border-white/20 rounded-2xl hover:from-white/18 hover:via-white/12 hover:to-white/8 hover:border-white/35 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1)] transition-all duration-400 ease-premium hover:scale-[1.02] overflow-hidden"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                <div className="relative z-10 flex items-start space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 via-white/12 to-white/8 backdrop-blur-md border border-white/30 flex items-center justify-center text-xs font-bold text-white group-hover:border-white/50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-400 flex-shrink-0">
                    {persona.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate tracking-wide">
                      {persona.name}
                    </p>
                    {persona.lastMessage ? (
                      <p className="text-xs text-white/60 truncate leading-tight mt-1 font-light tracking-wide">
                        {persona.lastMessage}
                      </p>
                    ) : (
                      <p className="text-xs text-white/40 italic truncate leading-tight mt-1 font-light tracking-wide">
                        New chat
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/50 font-light tracking-wide">
            No recent chats yet. Start chatting with a persona!
          </p>
        )}
      </div>

      {/* Footer - User Menu */}
      <div className="relative border-t border-white/10">
        {user ? (
          <>
            {/* Clickable User Section */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full p-4 hover:bg-white/5 transition-all duration-400 ease-premium text-left flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate tracking-tight">
                  {displayName}
                </h3>
                <p className="text-xs text-white/60 truncate font-light tracking-wide">{user.email}</p>
              </div>
              <svg
                className={`w-4 h-4 text-white/50 transition-all duration-400 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 w-full bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 shadow-[0_-4px_24px_-2px_rgba(0,0,0,0.5),0_-2px_12px_rgba(0,0,0,0.4)] rounded-t-2xl overflow-hidden">
                <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-tr from-white/12 to-transparent opacity-50 pointer-events-none" />
                <Link
                  href="/profile"
                  className="relative z-10 block px-4 py-3.5 hover:bg-white/10 transition-all duration-400 ease-premium text-sm text-white border-b border-white/15 font-medium tracking-wide"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Profile Details
                </Link>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    handleSignOut()
                  }}
                  className="relative z-10 w-full px-4 py-3.5 hover:bg-white/10 transition-all duration-400 ease-premium text-sm text-white text-left font-medium tracking-wide"
                >
                  Sign Out
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-4">
            <Link
              href="/auth/signin"
              className="group relative block w-full bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 text-white text-center text-sm font-semibold px-4 py-2.5 rounded-full hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/45 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_4px_12px_rgba(255,255,255,0.12)] transition-all duration-400 ease-premium overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
              <span className="relative z-10 tracking-wide">Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
