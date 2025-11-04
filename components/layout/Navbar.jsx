import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Determine if logo should be clickable
  const shouldLogoRedirect = !user || isHomePage

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-b from-black/75 via-black/65 to-black/55 backdrop-blur-3xl border-b border-white/20 z-50 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.05)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.08] before:to-transparent before:pointer-events-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo - Extreme Left */}
          {shouldLogoRedirect ? (
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:scale-[1.02] transition-all duration-300 ease-premium bg-gradient-to-br from-white via-white to-white/90 bg-clip-text drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
                AI-Spirit
              </span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight bg-gradient-to-br from-white via-white to-white/90 bg-clip-text drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                AI-Spirit
              </span>
            </div>
          )}

          {/* Sign In/User Info - Upper Right (only on homepage) */}
          {isHomePage && (
            <>
              {!user ? (
                <Link
                  href="/auth/signin"
                  className="group relative bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border border-white/30 text-white font-medium px-5 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:from-white/30 hover:via-white/22 hover:to-white/15 hover:border-white/50 transition-all duration-400 ease-premium hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                  <span className="relative z-10 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Sign In</span>
                </Link>
              ) : (
                <div className="text-white/90 text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none tracking-wide">
                  Welcome, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
