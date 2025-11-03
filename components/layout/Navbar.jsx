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
    <nav className="fixed top-0 w-full bg-black-secondary/90 backdrop-blur-lg border-b border-white/10 z-50 shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Extreme Left */}
          {shouldLogoRedirect ? (
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-xl sm:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
                AI-Spirit
              </span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-white">
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
                  className="relative bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border-2 border-white/50 text-white font-semibold px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-3xl hover:from-white/30 hover:via-white/25 hover:to-white/15 hover:border-white/70 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.3)] transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none"
                >
                  <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Sign In</span>
                </Link>
              ) : (
                <div className="text-white text-xs sm:text-sm font-semibold truncate max-w-[150px] sm:max-w-none">
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
