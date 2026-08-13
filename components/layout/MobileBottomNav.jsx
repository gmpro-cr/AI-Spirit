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
  const [avatarError, setAvatarError] = useState(false)

  const handleCreateClick = () => {
    if (onCreatePersona) {
      onCreatePersona()
    } else {
      // Only /personas handles the ?create=true param — sending it to / silently did nothing.
      router.push('/personas?create=true')
    }
  }

  const isActive = (path) => currentPath === path

  const NavItem = ({ href, label, active, children }) => (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="flex flex-col items-center gap-[3px] flex-1 py-2 min-h-[52px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-2xl"
    >
      <span
        className={`flex flex-col items-center gap-[3px] px-2.5 py-1.5 rounded-2xl transition-all duration-200 ${
          active ? 'bg-black/[0.06] dark:bg-white/[0.06]' : ''
        }`}
      >
        {children}
        <span
          className={`text-[11px] font-medium tracking-wide transition-colors duration-200 ${
            active ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'
          }`}
        >
          {label}
        </span>
      </span>
    </Link>
  )

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0"
        style={{ zIndex: 'var(--z-bottom-nav)', touchAction: 'manipulation' }}
      >
        <div
          className="bg-white/98 dark:bg-[#0B0B0C]/98 backdrop-blur-2xl border-t border-black/[0.07] dark:border-white/[0.07]"
          style={{
            boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
            paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))',
          }}
        >
          <div className="flex items-center justify-around px-1 pt-1">

            {/* Home */}
            <NavItem href="/" label="Home" active={isActive('/')}>
              <svg
                aria-hidden="true"
                className={`h-[22px] w-[22px] transition-all duration-200 ${isActive('/') ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}
                fill={isActive('/') ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isActive('/') ? 0 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </NavItem>

            {/* Personas */}
            <NavItem href="/personas" label="Personas" active={isActive('/personas')}>
              <svg
                aria-hidden="true"
                className={`h-[22px] w-[22px] transition-all duration-200 ${isActive('/personas') ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}
                fill={isActive('/personas') ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isActive('/personas') ? 0 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </NavItem>

            {/* Create — elevated FAB */}
            <button
              type="button"
              onClick={handleCreateClick}
              className="flex-1 flex flex-col items-center justify-center py-2 min-h-[52px] active:scale-90 transition-transform duration-150"
              aria-label="Create persona"
            >
              <div
                className="w-12 h-12 rounded-[18px] bg-black dark:bg-white flex items-center justify-center"
                style={{
                  boxShadow: '0 4px 14px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.12)',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>

            {/* Chats for signed-in users (nothing else in the app links to /chats),
                Premium for guests — Premium stays reachable via the navbar menu. */}
            {user ? (
              <NavItem href="/chats" label="Chats" active={isActive('/chats')}>
                <svg
                  aria-hidden="true"
                  className={`h-[22px] w-[22px] transition-all duration-200 ${isActive('/chats') ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}
                  fill={isActive('/chats') ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive('/chats') ? 0 : 1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </NavItem>
            ) : (
              <NavItem href="/premium" label="Premium" active={isActive('/premium')}>
                <svg
                  aria-hidden="true"
                  className={`h-[22px] w-[22px] transition-all duration-200 ${isActive('/premium') ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}
                  fill={isActive('/premium') ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive('/premium') ? 0 : 1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </NavItem>
            )}

            {/* Account */}
            {user ? (
              <button
                type="button"
                onClick={() => setIsAccountOpen(true)}
                className="flex-1 flex flex-col items-center justify-center py-2 min-h-[52px]"
                aria-label="Account"
              >
                <span className="flex flex-col items-center gap-[3px] px-3 py-1.5 rounded-2xl">
                  {user.user_metadata?.avatar_url && !avatarError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Account"
                      className="w-[22px] h-[22px] rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-[22px] h-[22px] rounded-full bg-black/[0.08] dark:bg-white/[0.08] border border-black/10 dark:border-white/10 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-black/60 dark:text-white/60">
                        {user.email?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] font-medium text-black/60 dark:text-white/60 tracking-wide">Account</span>
                </span>
              </button>
            ) : (
              <NavItem href="/auth/signin" label="Sign in" active={isActive('/auth/signin')}>
                <svg
                  aria-hidden="true"
                  className={`h-[22px] w-[22px] transition-all duration-200 ${isActive('/auth/signin') ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </NavItem>
            )}
          </div>
        </div>
      </nav>

      <AccountSettingsModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </>
  )
}
