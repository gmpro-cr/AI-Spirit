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

  // Define navigation links for the new structure
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-display text-xl pt-1">
            AI
          </div>
          <span className="font-display text-2xl tracking-tight text-black group-hover:opacity-70 transition-opacity">
            AI Spirit
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-widest uppercase hover:text-black transition-colors ${router.pathname === link.href ? 'text-black' : 'text-black/40'
                }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/personas"
            className="px-6 py-2 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-black/80 transition-colors"
          >
            Launch App
          </Link>
        </div>

        {/* Right Side - Contact (Premium hidden for now) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Premium link hidden - keeping code for future use
            <Link
              href="/premium"
              className="text-black font-medium px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-soft transition-all duration-300"
            >
              Premium
            </Link>
            */}
          <Link
            href="/contact"
            className="bg-black text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border border-black hover:bg-white hover:text-black shadow-soft hover:shadow-lift transition-all duration-300"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  )
}
