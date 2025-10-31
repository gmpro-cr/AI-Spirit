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

  useEffect(() => {
    if (user) {
      router.push('/personas')
    }
  }, [user, router])

  return (
    <>
      <Head>
        <title>Sign In - Esperit.AI</title>
      </Head>

      <ParticlesBackground />
      <Navbar />

      <main className="relative min-h-screen bg-black-primary pt-24 pb-16 px-4 flex items-center justify-center z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Welcome to{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Esperit.AI
              </span>
            </h1>

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#00F5FF',
                      brandAccent: '#B026FF',
                      defaultButtonBackground: '#0A0A0A',
                      defaultButtonBackgroundHover: '#141414',
                      inputBackground: '#141414',
                      inputBorder: '#333333',
                      inputBorderHover: '#00F5FF',
                      inputBorderFocus: '#00F5FF',
                    },
                  },
                },
              }}
              providers={['google']}
              redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/personas`}
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
