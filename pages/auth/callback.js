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
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const returnTo = searchParams.get('returnTo') || router.query.returnTo || '/personas'

        // If we have tokens from custom OAuth flow, set the session
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('Error setting session:', error)
            router.push('/auth/signin')
            return
          }

          console.log('Session set successfully, redirecting to:', returnTo)
          router.replace(returnTo)
          return
        }

        // Handle standard Supabase OAuth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin')
          return
        }

        if (data.session) {
          console.log('Auth successful, redirecting to:', returnTo)
          router.replace(returnTo)
        } else {
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
