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
    <nav className="fixed top-0 w-full bg-gradient-to-b from-white/10 via-white/[0.06] to-transparent backdrop-blur-3xl border-b border-white/30 z-50 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(255,255,255,0.08),0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.12] before:via-white/[0.04] before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent after:pointer-events-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo - Extreme Left */}
          {shouldLogoRedirect ? (
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:scale-[1.02] transition-all duration-300 ease-premium bg-gradient-to-br from-white via-white to-white/90 bg-clip-text drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                AI-Spirit
              </span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight bg-gradient-to-br from-white via-white to-white/90 bg-clip-text drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
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
                  className="group relative bg-gradient-to-br from-white/25 via-white/18 to-white/12 backdrop-blur-xl border border-white/40 text-white font-medium px-5 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:from-white/35 hover:via-white/28 hover:to-white/20 hover:border-white/60 transition-all duration-400 ease-premium hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(255,255,255,0.08),0_0_30px_rgba(255,255,255,0.08)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_2px_12px_rgba(255,255,255,0.2),inset_0_2px_0_rgba(255,255,255,0.3)] overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.15] to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />
                  <span className="relative z-10 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Sign In</span>
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
