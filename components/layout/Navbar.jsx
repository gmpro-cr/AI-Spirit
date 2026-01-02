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
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-xs z-50 transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Only on pages with SidePanel */}
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden group relative bg-gray-50 border border-gray-200 rounded-xl p-2.5 hover:bg-gray-100 hover:border-gray-300 hover:shadow-soft transition-all duration-300"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-center gap-1.5">
                  <span className="block w-full h-0.5 bg-black rounded-full transition-all duration-300"></span>
                  <span className="block w-full h-0.5 bg-black rounded-full transition-all duration-300"></span>
                </div>
              </button>
            )}

            {/* Logo */}
            {isHomePage ? (
              <Link href="/" className="flex items-center space-x-2 group">
                <span className="font-display text-xl sm:text-2xl font-bold text-black tracking-tight group-hover:opacity-70 transition-all duration-300">
                  <span className="italic">AI</span> - Spirit
                </span>
              </Link>
            ) : (
              <Link href="/personas" className="flex items-center space-x-2 group">
                <span className="font-display text-xl sm:text-2xl font-bold text-black tracking-tight group-hover:opacity-70 transition-all duration-300">
                  <span className="italic">AI</span> - Spirit
                </span>
              </Link>
            )}
          </div>

          {/* Right Side - Premium + Contact */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/premium"
              className="text-black font-medium px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-soft transition-all duration-300"
            >
              Premium
            </Link>
            <Link
              href="/contact"
              className="bg-black text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border border-black hover:bg-white hover:text-black shadow-soft hover:shadow-lift transition-all duration-300"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
