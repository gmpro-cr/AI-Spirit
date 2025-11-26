import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Head from 'next/head'
import ParticlesBackground from '@/components/layout/ParticlesBackground'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if there's a code in the URL (OAuth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)

        // Supabase automatically handles the OAuth callback, we just need to wait for the session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin')
          return
        }

        if (session) {
          // Get returnTo from query params, with fallback to /personas
          const returnTo = searchParams.get('returnTo') || router.query.returnTo || '/personas'

          console.log('Auth successful, redirecting to:', returnTo)

          // Use window.location for hard redirect to ensure cookies are properly read
          window.location.href = returnTo
        } else {
          // No session yet, might still be processing
          console.log('No session found, redirecting to sign in')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        router.push('/auth/signin')
      }
    }

    if (router.isReady) {
      handleAuthCallback()
    }
  }, [router, router.isReady])

  return (
    <>
      <Head>
        <title>Authenticating - AI-Spirit</title>
      </Head>

      <ParticlesBackground />

      <main className="relative min-h-screen bg-black-primary flex items-center justify-center z-10">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Completing Sign In...
          </h1>
          <p className="text-text-secondary">
            Please wait while we authenticate you
          </p>
        </div>
      </main>
    </>
  )
}
