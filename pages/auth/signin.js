import Head from 'next/head'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import ParticlesBackground from '@/components/layout/ParticlesBackground'

export default function SignIn() {
  const router = useRouter()
  const { user } = useAuth()
  const { returnTo } = router.query

  useEffect(() => {
    if (user) {
      // Redirect to the returnTo URL if provided, otherwise go to personas
      const redirectUrl = returnTo || '/personas'
      router.push(redirectUrl)
    }
  }, [user, router, returnTo])

  return (
    <>
      <Head>
        <title>Sign In - AI-Spirit</title>
      </Head>

      <ParticlesBackground />
      <Navbar />

      <main className="relative min-h-screen bg-black-primary pt-24 pb-16 px-4 flex items-center justify-center z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Welcome to{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                AI-Spirit
              </span>
            </h1>

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#000000',
                      brandAccent: '#1a1a1a',
                      brandButtonText: '#FFFFFF',
                      defaultButtonBackground: '#000000',
                      defaultButtonBackgroundHover: '#1a1a1a',
                      defaultButtonBorder: 'rgba(255, 255, 255, 0.3)',
                      defaultButtonText: '#FFFFFF',
                      inputBackground: '#000000',
                      inputBorder: '#333333',
                      inputBorderHover: '#FFFFFF',
                      inputBorderFocus: '#FFFFFF',
                      inputText: '#FFFFFF',
                      inputPlaceholder: '#666666',
                    },
                  },
                },
                style: {
                  button: {
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                  },
                  anchor: {
                    color: '#FFFFFF',
                    textDecoration: 'underline',
                  },
                  message: {
                    color: '#666666',
                  },
                },
              }}
              providers={['google']}
              redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              view="sign_in"
              showLinks={true}
            />

            <div className="mt-6 text-center text-text-muted text-sm">
              <p>By signing in, you agree to our Terms and Privacy Policy</p>
              <p className="mt-2">AI-generated responses for entertainment purposes</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
