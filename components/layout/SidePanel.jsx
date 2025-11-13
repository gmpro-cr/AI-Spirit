import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function SidePanel({ onBack, backButtonText, showPastChats = true }) {
  const router = useRouter()
  const { user } = useAuth()
  const [pastChats, setPastChats] = useState([])
  const [loading, setLoading] = useState(true)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Load past chats
  useEffect(() => {
    const loadPastChats = async () => {
      if (!user || !showPastChats) {
        setPastChats([])
        setLoading(false)
        return
      }

      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session) {
          console.log('No active session for loading chats')
          setLoading(false)
          return
        }

        const userId = session.session.user.id
        console.log('Loading chats for user:', userId)

        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('session_id', userId)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(10)

        console.log('Query result - error:', error, 'data length:', data?.length)

        if (error) {
          console.error('Error fetching conversations:', error)
        } else {
          console.log('Loaded conversations:', data)
          if (data && data.length > 0) {
            const chats = data.map(conv => ({
              id: conv.id,
              title: conv.title || `Chat with ${conv.persona_type}`,
              personaSlug: conv.persona_type,
              updatedAt: conv.updated_at
            }))
            console.log('Mapped past chats:', chats)
            setPastChats(chats)
          } else {
            console.log('No conversations found for this user')
            setPastChats([])
          }
        }
      } catch (error) {
        console.error('Error loading past chats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPastChats()
  }, [user, showPastChats])

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex-col justify-between hidden md:flex h-screen fixed left-0 top-0">
      <div>
        {/* Back Button */}
        {onBack && (
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-sm text-gray-600 hover:text-black mb-4 transition-colors"
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

        {/* Past Chats */}
        {showPastChats && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Past Chats</h2>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : pastChats.length > 0 ? (
              <ul className="space-y-2">
                {pastChats.map(chat => (
                  <li key={chat.id}>
                    <button
                      onClick={() => router.push(`/chat/${chat.personaSlug}`)}
                      className="block w-full text-left p-2 rounded-md text-sm text-gray-700 hover:bg-gray-200 truncate transition-colors"
                    >
                      {chat.title}
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

      {/* User Account Section */}
      <div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-black">{user?.email || 'User'}</p>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
