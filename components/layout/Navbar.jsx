import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'

export default function Navbar({ onMenuToggle, showMenuButton = false }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/personas', label: 'Personas' },
    { href: '/premium', label: 'Premium' },
    { href: '/contact', label: 'Contact' },
  ]

  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <>
      <nav className="fixed w-full z-50 transition-all duration-300 glass-nav">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 group-hover:opacity-80 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="AI Spirit" className="w-full h-full object-cover" />
            </div>
          </Link>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-widest uppercase hover:text-black transition-colors relative ${
                  router.pathname === link.href
                    ? 'text-black after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-black'
                    : 'text-black/50 hover:text-black/80'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              user ? (
                <button
                  onClick={handleSignOut}
                  className="glass-pill text-sm font-medium tracking-widest uppercase px-4 py-2 text-black/70 hover:text-black hover:bg-white/70 transition-all duration-300"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href={`/auth/signin?returnTo=${encodeURIComponent(router.asPath || '/')}`}
                  className="text-sm font-medium tracking-widest uppercase px-4 py-2 rounded-full bg-black text-white hover:bg-black/90 transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </div>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 glass-backdrop z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      <div
        className={`fixed top-20 left-0 right-0 bg-white/75 backdrop-blur-2xl rounded-b-[2rem] z-40 md:hidden transition-all duration-300 shadow-glass-lg ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-6 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={`block py-3 px-4 text-lg font-medium rounded-2xl transition-all duration-300 ${
                router.pathname === link.href
                  ? 'bg-black text-white'
                  : 'text-black/70 hover:bg-white/60 hover:backdrop-blur-xl hover:text-black'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!loading && (
            user ? (
              <button
                onClick={handleSignOut}
                className="w-full text-left py-3 px-4 text-lg font-medium rounded-lg text-black/70 hover:bg-black/5 hover:text-black transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href={`/auth/signin?returnTo=${encodeURIComponent(router.asPath || '/')}`}
                onClick={closeMobileMenu}
                className="block py-3 px-4 text-lg font-medium rounded-lg bg-black text-white hover:bg-black/90 transition-colors"
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </>
  )
}
