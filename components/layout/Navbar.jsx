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
    <nav className="fixed top-0 w-full bg-black-secondary/95 backdrop-blur-2xl border-b border-white/10 z-50 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo - Extreme Left */}
          {shouldLogoRedirect ? (
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:scale-[1.02] transition-all duration-300 ease-premium bg-gradient-to-br from-white to-white/90 bg-clip-text">
                AI-Spirit
              </span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight bg-gradient-to-br from-white to-white/90 bg-clip-text">
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
                  className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 text-white font-medium px-5 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/50 transition-all duration-400 ease-premium hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <span className="relative z-10 tracking-wide">Sign In</span>
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
