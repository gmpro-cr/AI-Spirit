import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'

export default function Navbar({ onMenuToggle, showMenuButton = false }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Escape closes the menu, and the page behind it must not scroll while it is open.
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/personas', label: 'Personas' },
    // /chats had no link anywhere in the app; surface it once signed in.
    ...(user ? [{ href: '/chats', label: 'Chats' }] : []),
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
                aria-current={router.pathname === link.href ? 'page' : undefined}
                className={`text-sm font-medium tracking-widest uppercase transition-colors relative rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                  router.pathname === link.href
                    ? 'text-black dark:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-black dark:after:bg-white'
                    : 'text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              user ? (
                <button
                  onClick={handleSignOut}
                  className="glass-pill text-sm font-medium tracking-widest uppercase px-4 py-2 text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white hover:bg-white/70 dark:hover:bg-[#0B0B0C]/70 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href={`/auth/signin?returnTo=${encodeURIComponent(router.asPath || '/')}`}
                  className="text-sm font-medium tracking-widest uppercase px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </div>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 glass-backdrop z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      {/* top-16 matches the h-16 navbar under sm; top-20 was leaving a 15px strip of
          page content showing between the navbar and this panel. */}
      <div
        id="mobile-menu"
        className={`fixed top-16 sm:top-20 left-0 right-0 bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-2xl rounded-b-[2rem] z-40 md:hidden transition-all duration-300 shadow-glass-lg ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-6 py-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              aria-current={router.pathname === link.href ? 'page' : undefined}
              className={`block py-3 px-4 text-lg font-medium rounded-2xl transition-all duration-300 ${
                router.pathname === link.href
                  ? 'bg-black/[0.06] dark:bg-white/[0.06] text-black dark:text-white'
                  : 'text-black/75 dark:text-white/75 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-black dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!loading && (
            user ? (
              <button
                onClick={handleSignOut}
                className="w-full text-left py-3 px-4 text-lg font-medium rounded-2xl text-black/75 dark:text-white/75 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-black dark:hover:text-white transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href={`/auth/signin?returnTo=${encodeURIComponent(router.asPath || '/')}`}
                onClick={closeMobileMenu}
                className="mt-3 block py-3 px-4 text-lg font-medium rounded-2xl bg-black text-white dark:bg-white dark:text-black text-center hover:bg-black/90 dark:hover:bg-white/90 transition-colors"
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
