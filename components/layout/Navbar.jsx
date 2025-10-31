import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 w-full bg-black-secondary border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              Esperit.AI
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/personas" className="text-text-secondary hover:text-text-primary transition">
              Personas
            </Link>

            {user ? (
              <>
                <Link href="/profile" className="text-text-secondary hover:text-text-primary transition">
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-text-secondary hover:text-text-primary transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="btn-gradient">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
