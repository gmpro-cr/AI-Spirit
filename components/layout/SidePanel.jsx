import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function SidePanel({ onBack, backButtonText, showPastChats = true }) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [pastChats, setPastChats] = useState([])
  const [loading, setLoading] = useState(true)

  // Load past chats from localStorage
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
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col justify-between hidden md:flex h-screen fixed left-0 top-0">
      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Back Navigation */}
        {onBack && (
          <div className="mb-4 pb-4 border-b border-gray-300">
            <button
              onClick={onBack}
              className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {backButtonText || 'Back'}
            </button>
          </div>
        )}

        {/* Past Chats Header */}
        <h2 className="text-lg font-semibold mb-4 text-black">Past Chats</h2>

        {/* Past Chats List */}
        {showPastChats && (
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : pastChats.length > 0 ? (
              <ul className="space-y-2">
                {pastChats.map(chat => (
                  <li key={chat.id}>
                    <button
                      onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
                      className="flex items-center gap-2 w-full text-left p-2 rounded-md text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {chat.personaImage && (
                        <img
                          src={chat.personaImage}
                          alt={chat.personaName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">{chat.personaName}</p>
                        <p className="truncate">{chat.title}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No past chats yet</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section - User Info & Logout */}
      {user && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-700 truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-2 p-1.5 text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
              title="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
