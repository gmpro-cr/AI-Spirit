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
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Only on pages with SidePanel */}
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden group relative bg-gray-100 border border-gray-200 rounded-lg p-2 hover:bg-gray-200 active:scale-95 transition-all"
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
                <span className="text-xl sm:text-2xl font-bold text-black tracking-tight group-hover:scale-[1.02] transition-transform">
                  <span className="italic">AI</span>-Spirit
                </span>
              </Link>
            ) : (
              <Link href="/personas" className="flex items-center space-x-2 group">
                <span className="text-xl sm:text-2xl font-bold text-black tracking-tight group-hover:scale-[1.02] transition-transform">
                  <span className="italic">AI</span>-Spirit
                </span>
              </Link>
            )}
          </div>

          {/* Right Side - Contact Us */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="bg-black text-white font-medium px-5 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
