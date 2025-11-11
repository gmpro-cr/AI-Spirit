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
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          // Redirect to sign in on error
          router.push('/auth/signin')
          return
        }

        if (data.session) {
          // Get returnTo from query params, with fallback to /personas
          const searchParams = new URLSearchParams(window.location.search)
          const returnTo = searchParams.get('returnTo') || router.query.returnTo
          const redirectUrl = returnTo || '/personas'

          console.log('Auth successful, redirecting to:', redirectUrl)

          // Use replace instead of push to avoid back button issues
          router.replace(redirectUrl)
        } else {
          // No session, redirect to sign in
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        router.push('/auth/signin')
      }
    }

    // Wait for router to be ready to ensure query params are available
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
