import Head from 'next/head'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
// import ParticlesBackground from '@/components/layout/ParticlesBackground'

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



      {/* Header */}
      <header className="p-4 border-b border-gray-200 bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-black cursor-pointer">AI-Spirit</h1>
          </Link>
        </div>
      </header>

      <main className="relative min-h-screen bg-white pb-16 px-4 flex items-center justify-center z-10">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-black">
              Welcome to AI-Spirit
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
                      defaultButtonBorder: '#d1d5db',
                      defaultButtonText: '#FFFFFF',
                      inputBackground: '#FFFFFF',
                      inputBorder: '#d1d5db',
                      inputBorderHover: '#000000',
                      inputBorderFocus: '#000000',
                      inputText: '#000000',
                      inputPlaceholder: '#9ca3af',
                    },
                  },
                },
                style: {
                  button: {
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                  },
                  anchor: {
                    color: '#000000',
                    textDecoration: 'underline',
                  },
                  message: {
                    color: '#000000',
                  },
                },
              }}
              providers={['google']}
              redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              view="sign_in"
              showLinks={true}
            />

            <div className="mt-6 text-center text-black text-sm">
              <p>By signing in, you agree to our Terms and Privacy Policy</p>
              <p className="mt-2">AI-generated responses for entertainment purposes</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
