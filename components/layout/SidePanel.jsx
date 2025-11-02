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

  useEffect(() => {
    // Load recent personas with chat history from localStorage
    const loadRecentChats = () => {
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed left-4 top-20 z-50 w-10 h-10 bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl border-2 border-white/60 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.3)] transition-all duration-300"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div className={`fixed left-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-64 bg-black border-r border-white/30 z-40 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Action Buttons */}
      <div className="p-4 border-b border-white/20 space-y-3">
        {/* Explore Button */}
        <Link
          href="/personas"
          className="relative block w-full bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border-2 border-white/50 text-white text-sm font-semibold px-4 py-3 rounded-3xl hover:from-white/30 hover:via-white/25 hover:to-white/15 hover:border-white/70 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.3)] transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none text-center"
        >
          <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Explore</span>
        </Link>

        {/* Create Persona Button */}
        <button
          onClick={handleCreatePersona}
          className="relative w-full bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border-2 border-white/50 text-white text-sm font-semibold px-4 py-3 rounded-3xl hover:from-white/30 hover:via-white/25 hover:to-white/15 hover:border-white/70 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.3)] transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none"
        >
          <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Create Persona</span>
        </button>
      </div>

      {/* Recent Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-bold text-white mb-3">Recent Chats</h3>

        {recentPersonas.length > 0 ? (
          <div className="space-y-2">
            {recentPersonas.map((persona) => (
              <Link
                key={persona.slug}
                href={`/chat/${persona.slug}`}
                className="relative block p-3 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 rounded-3xl hover:from-white/25 hover:via-white/20 hover:to-white/10 hover:border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.2)] transition-all duration-300 group before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none"
              >
                <div className="relative z-10 flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-xs font-bold text-white group-hover:border-white/80 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)] transition-all duration-300 flex-shrink-0">
                    {persona.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate drop-shadow-[0_1px_4px_rgba(255,255,255,0.2)]">
                      {persona.name}
                    </p>
                    {persona.lastMessage ? (
                      <p className="text-xs text-white/70 truncate leading-tight mt-0.5">
                        {persona.lastMessage}
                      </p>
                    ) : (
                      <p className="text-xs text-white/50 italic truncate leading-tight mt-0.5">
                        New chat
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-secondary">
            No recent chats yet. Start chatting with a persona!
          </p>
        )}
      </div>

      {/* Footer - User Menu */}
      <div className="relative border-t border-white/20">
        {user ? (
          <>
            {/* Clickable User Section */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full p-4 hover:bg-black-secondary transition text-left flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">
                  {displayName}
                </h3>
                <p className="text-xs text-text-secondary truncate">{user.email}</p>
              </div>
              <svg
                className={`w-4 h-4 text-text-secondary transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 w-full bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-t-3xl overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/20 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-t-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none">
                <Link
                  href="/profile"
                  className="relative z-10 block px-4 py-3 hover:bg-white/15 transition-all duration-300 text-sm text-white border-b border-white/30 drop-shadow-sm"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Profile Details
                </Link>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    handleSignOut()
                  }}
                  className="relative z-10 w-full px-4 py-3 hover:bg-white/15 transition-all duration-300 text-sm text-white text-left drop-shadow-sm"
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
              className="relative block w-full bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border-2 border-white/50 text-white text-center text-sm font-semibold px-4 py-2 rounded-3xl hover:from-white/30 hover:via-white/25 hover:to-white/15 hover:border-white/70 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.3)] transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none"
            >
              <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
