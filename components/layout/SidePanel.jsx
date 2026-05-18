import { useRouter } from 'next/router'
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

  return (
    <aside className={`w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex fixed left-0 transition-colors ${hasNavbar ? 'h-[calc(100vh-5rem)] top-20' : 'h-screen top-0'}`}>
      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Back Navigation — fixed h-[72px] to align border-b with chat header border-b */}
        {onBack && (
          <div className="flex items-center h-[72px] px-5 border-b border-gray-100 flex-shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              {backButtonText || 'Back'}
            </button>
          </div>
        )}

        {/* Create Persona Button */}
        {onCreatePersona && (
          <div className="px-4 pt-5 pb-2">
            <button
              onClick={onCreatePersona}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-200 font-medium text-sm group"
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

        {/* Past Chats Header */}
        <div className="px-5 pt-6 pb-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Past Chats</h2>
        </div>

        {/* Past Chats List */}
        {showPastChats && (
          <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
            {loading ? (
              <p className="text-xs text-gray-400 px-2">Loading...</p>
            ) : pastChats.length > 0 ? (
              <ul className="space-y-0.5">
                {pastChats.map(chat => (
                  <li key={chat.id}>
                    <button
                      onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
                      className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-all duration-200 group"
                    >
                      {chat.personaImage && (
                        <Image
                          src={chat.personaImage}
                          alt={chat.personaName}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 truncate mb-0.5 uppercase tracking-wide">{chat.personaName}</p>
                        <p className="text-xs truncate text-gray-700 group-hover:text-black">{chat.title}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 px-2">No past chats yet</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section — User Info or Sign In */}
      <div className="border-t border-gray-100 px-4 py-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Settings</p>

        {user ? (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center w-full hover:bg-gray-50 rounded-xl px-2 py-2 transition-colors group"
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
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 mr-3 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 truncate group-hover:text-black transition-colors">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-300 group-hover:text-gray-500 ml-2 flex-shrink-0 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => router.push('/auth/signin')}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-200 font-medium text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
