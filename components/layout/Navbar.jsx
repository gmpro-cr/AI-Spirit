import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'

export default function Navbar({ onMenuToggle, showMenuButton = false }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-b from-white/10 via-white/[0.06] to-transparent backdrop-blur-3xl border-b border-white/30 z-50 shadow-glass relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.12] before:via-white/[0.04] before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent after:pointer-events-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Left Side - Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Only on pages with SidePanel */}
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden group relative bg-gradient-to-br from-white/22 via-white/16 to-white/12 backdrop-blur-xl border border-white/35 rounded-lg p-2 hover:from-white/32 hover:via-white/24 hover:to-white/18 hover:border-white/50 shadow-glass hover:shadow-glass-hover active:scale-90 transition-smooth"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-center gap-1.5">
                  <span className="block w-full h-0.5 bg-white rounded-full transition-all duration-300"></span>
                  <span className="block w-full h-0.5 bg-white rounded-full transition-all duration-300"></span>
                </div>
              </button>
            )}

            {/* Logo */}
            {isHomePage ? (
              <Link href="/" className="flex items-center space-x-2 group">
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:scale-[1.02] transition-smooth bg-gradient-to-br from-white via-white to-white/90 bg-clip-text drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                  AI-Spirit
                </span>
              </Link>
            ) : (
              <Link href="/personas" className="flex items-center space-x-2 group">
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:scale-[1.02] transition-smooth bg-gradient-to-br from-white via-white to-white/90 bg-clip-text drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                  AI-Spirit
                </span>
              </Link>
            )}
          </div>

          {/* Right Side - Dashboard + Sign In/User Info */}
          {isHomePage && (
            <div className="flex items-center gap-3">
              {user && (
                <Link
                  href="/dashboard"
                  className="group relative bg-gradient-to-br from-purple-500/25 via-purple-600/18 to-purple-700/12 backdrop-blur-xl border border-purple-400/40 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:from-purple-500/35 hover:via-purple-600/28 hover:to-purple-700/20 hover:border-purple-400/60 transition-smooth hover:scale-[1.02] active:scale-[0.98] shadow-glass hover:shadow-glass-hover overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-400/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                  <span className="relative z-10 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">📊 Dashboard</span>
                </Link>
              )}

              {!user ? (
                <Link
                  href="/auth/signin"
                  className="group relative bg-gradient-to-br from-white/25 via-white/18 to-white/12 backdrop-blur-xl border border-white/40 text-white font-medium px-5 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:from-white/35 hover:via-white/28 hover:to-white/20 hover:border-white/60 transition-smooth hover:scale-[1.02] active:scale-[0.98] shadow-glass hover:shadow-glass-hover overflow-hidden"
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
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
