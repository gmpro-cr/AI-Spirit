import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import AccountSettingsModal from '@/components/profile/AccountSettingsModal'

export default function MobileBottomNav({ onCreatePersona }) {
  const router = useRouter()
  const { user } = useAuth()
  const currentPath = router.pathname
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const handleCreateClick = () => {
    if (onCreatePersona) {
      onCreatePersona()
    } else {
      router.push('/?create=true')
    }
  }

  const isActive = (path) => currentPath === path

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] safe-area-bottom"
        style={{ touchAction: 'manipulation', zIndex: 99999 }}
      >
        <div className="flex justify-around items-end px-1 pb-1 pt-2" style={{ minHeight: '68px' }}>

          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center justify-end flex-1 pb-2 gap-1 min-h-[44px] relative"
          >
            {isActive('/') && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-black" />
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-all duration-200 ${isActive('/') ? 'text-black scale-110' : 'text-black/30'}`}
              fill={isActive('/') ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isActive('/') ? 0 : 1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`text-[10px] tracking-wide transition-all duration-200 ${isActive('/') ? 'text-black font-semibold' : 'text-black/30 font-medium'}`}>
              Home
            </span>
          </Link>

          {/* Personas */}
          <Link
            href="/personas"
            className="flex flex-col items-center justify-end flex-1 pb-2 gap-1 min-h-[44px] relative"
          >
            {isActive('/personas') && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-black" />
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-all duration-200 ${isActive('/personas') ? 'text-black scale-110' : 'text-black/30'}`}
              fill={isActive('/personas') ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isActive('/personas') ? 0 : 1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-[10px] tracking-wide transition-all duration-200 ${isActive('/personas') ? 'text-black font-semibold' : 'text-black/30 font-medium'}`}>
              Personas
            </span>
          </Link>

          {/* Create — center action */}
          <button
            type="button"
            onClick={handleCreateClick}
            className="flex flex-col items-center justify-end flex-1 pb-2 gap-1 min-h-[44px] active:scale-95 transition-transform duration-150"
          >
            <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-shadow duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>

          {/* Premium */}
          <Link
            href="/premium"
            className="flex flex-col items-center justify-end flex-1 pb-2 gap-1 min-h-[44px] relative"
          >
            {isActive('/premium') && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-black" />
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-all duration-200 ${isActive('/premium') ? 'text-black scale-110' : 'text-black/30'}`}
              fill={isActive('/premium') ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isActive('/premium') ? 0 : 1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className={`text-[10px] tracking-wide transition-all duration-200 ${isActive('/premium') ? 'text-black font-semibold' : 'text-black/30 font-medium'}`}>
              Premium
            </span>
          </Link>

          {/* Account */}
          {user ? (
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className="flex flex-col items-center justify-end flex-1 pb-2 gap-1 min-h-[44px]"
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Account"
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-black/10"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-black/[0.08] border border-black/10 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-black/60">
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <span className="text-[10px] text-black/30 font-medium tracking-wide">Account</span>
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="flex flex-col items-center justify-end flex-1 pb-2 gap-1 min-h-[44px] relative"
            >
              {isActive('/auth/signin') && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-black" />
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-all duration-200 ${isActive('/auth/signin') ? 'text-black scale-110' : 'text-black/30'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-[10px] tracking-wide transition-all duration-200 ${isActive('/auth/signin') ? 'text-black font-semibold' : 'text-black/30 font-medium'}`}>
                Sign In
              </span>
            </Link>
          )}
        </div>
      </nav>

      <AccountSettingsModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </>
  )
}
