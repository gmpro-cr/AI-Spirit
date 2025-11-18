import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SidePanel({ onBack, backButtonText, showPastChats = true }) {
  const router = useRouter()
  const [pastChats, setPastChats] = useState([])
  const [loading, setLoading] = useState(true)

  // Since we removed authentication, past chats are not available
  useEffect(() => {
    setPastChats([])
    setLoading(false)
  }, [showPastChats])

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
                      onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
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
    </aside>
  )
}
