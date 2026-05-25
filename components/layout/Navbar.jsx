import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Logo from '@/components/brand/Logo'

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
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center">
          <Link href="/" className="group" style={{ opacity: 1, transition: 'opacity 300ms cubic-bezier(0.32,0.72,0,1)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Logo size="md" dark={false} />
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
                  className="text-sm font-medium tracking-widest uppercase px-4 py-2 rounded-full border border-black/20 text-black/70 hover:text-black hover:border-black/40 transition-colors"
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
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      <div
        className={`fixed top-20 left-0 right-0 bg-white z-40 md:hidden transition-all duration-300 border-b border-black/10 shadow-soft-lg ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-6 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={`block py-3 px-4 text-lg font-medium rounded-lg transition-colors ${
                router.pathname === link.href
                  ? 'bg-black text-white'
                  : 'text-black/70 hover:bg-black/5 hover:text-black'
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
