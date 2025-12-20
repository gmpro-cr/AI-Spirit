import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Navbar({ onMenuToggle, showMenuButton = false }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-spirit-bg-dark border-b border-gray-200 dark:border-spirit-border-dark z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Only on pages with SidePanel */}
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden group relative bg-gray-100 border border-gray-200 rounded-md p-2 hover:bg-gray-200 transition-colors"
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
                <span className="font-display text-xl sm:text-2xl font-bold text-spirit-primary dark:text-spirit-primary-dark tracking-tight group-hover:text-spirit-accent transition-colors">
                  <span className="italic">AI</span> - Spirit
                </span>
              </Link>
            ) : (
              <Link href="/personas" className="flex items-center space-x-2 group">
                <span className="font-display text-xl sm:text-2xl font-bold text-spirit-primary dark:text-spirit-primary-dark tracking-tight group-hover:text-spirit-accent transition-colors">
                  <span className="italic">AI</span> - Spirit
                </span>
              </Link>
            )}
          </div>

          {/* Right Side - Theme Toggle + Premium + Contact */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/premium"
              className="text-spirit-primary dark:text-spirit-primary-dark font-medium px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-gray-300 dark:border-spirit-border-dark hover:border-spirit-primary hover:bg-gray-50 dark:hover:bg-spirit-bg-secondary-dark transition-all"
            >
              Premium
            </Link>
            <Link
              href="/contact"
              className="bg-spirit-primary dark:bg-spirit-accent text-white font-medium px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-md border border-spirit-primary dark:border-spirit-accent hover:bg-white dark:hover:bg-spirit-bg-dark hover:text-spirit-primary dark:hover:text-spirit-accent transition-all"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
