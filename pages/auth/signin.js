import Head from 'next/head'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const { user } = useAuth()
  const { returnTo } = router.query


  useEffect(() => {
    if (user) {
      // Redirect to the returnTo URL if provided, otherwise go to personas
      const redirectUrl = returnTo || '/'
      router.push(redirectUrl)
    }
  }, [user, router, returnTo])

  return (
    <>
      <Head>
        <title>Sign In - AI - Spirit</title>
      </Head>

      <div className="min-h-screen bg-white dark:bg-spirit-bg-dark text-black dark:text-spirit-primary-dark flex flex-col transition-colors">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center animate-fadeIn relative z-20">
          <Link href="/">
            <h1 className="text-xl md:text-2xl font-black tracking-tight cursor-pointer text-black dark:text-spirit-primary-dark">
              <span className="italic">AI</span> -Spirit
            </h1>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 relative">
          {/* Sign In Form */}
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white dark:bg-spirit-bg-secondary-dark border-2 border-black dark:border-spirit-accent rounded-lg shadow-xl p-8 transition-colors">
              <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-spirit-primary-dark">
                Welcome to AI -Spirit
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
                onlyThirdPartyProviders={true}
                redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              />

              <div className="mt-6 text-center text-black dark:text-spirit-primary-dark text-sm">
                <p>By signing in, you agree to our Terms and Privacy Policy</p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">AI-generated responses for entertainment purposes</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
