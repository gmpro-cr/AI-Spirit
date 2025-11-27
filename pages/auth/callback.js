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
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')

        // Get returnTo parameter
        const returnTo = searchParams.get('returnTo') || router.query.returnTo || '/personas'

        console.log('[Auth Callback] Starting authentication flow', { code: !!code, returnTo })

        if (code) {
          // Exchange the code for a session
          console.log('[Auth Callback] Exchanging code for session...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('[Auth Callback] Code exchange error:', error)
            router.push('/auth/signin')
            return
          }

          if (data.session) {
            console.log('[Auth Callback] Session established successfully')
            // Use window.location for hard redirect to ensure cookies are set
            console.log('[Auth Callback] Redirecting to:', returnTo)
            window.location.href = returnTo
            return
          }
        }

        // Fallback: check if there's already a session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[Auth Callback] Session check error:', error)
          router.push('/auth/signin')
          return
        }

        if (session) {
          console.log('[Auth Callback] Existing session found, redirecting to:', returnTo)
          window.location.href = returnTo
        } else {
          console.log('[Auth Callback] No session or code found, redirecting to sign in')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error)
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
