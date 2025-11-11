import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function SidePanel({ onBack, backButtonText, showPastChats = true }) {
  const router = useRouter()
  const { user } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Mock past chats - you can replace this with real data from your database
  const pastChats = [
    { id: 1, title: "Chat with Elon Musk" },
    { id: 2, title: "Business with Warren" },
    { id: 3, title: "Philosophy with Socrates" },
  ]

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
            <h2 className="text-lg font-semibold mb-4">Past Chats</h2>
            <ul className="space-y-2">
              {pastChats.map(chat => (
                <li key={chat.id}>
                  <a
                    href="#"
                    className="block p-2 rounded-md text-sm text-gray-700 hover:bg-gray-200 truncate transition-colors"
                  >
                    {chat.title}
                  </a>
                </li>
              ))}
            </ul>
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
              <p className="font-semibold text-sm truncate">{user?.email || 'User'}</p>
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
