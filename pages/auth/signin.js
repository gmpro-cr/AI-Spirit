import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const { user } = useAuth()
  // Next.js query values can be string | string[] | undefined — coerce to a single string
  const returnToRaw = router.query.returnTo
  const returnTo = Array.isArray(returnToRaw) ? returnToRaw[0] : returnToRaw

  const [status, setStatus] = useState('idle') // idle | redirecting | error
  const [errorMessage, setErrorMessage] = useState('')

  // If already signed in, skip straight to destination (replace so signin isn't in back-stack)
  useEffect(() => {
    if (user) router.replace(returnTo || '/')
  }, [user, router, returnTo])

  // Deliberately NOT auto-fired on mount. Auto-redirecting to Google gave the user no
  // chance to see what they were signing into, and made Back re-trigger OAuth instantly
  // (a back-button trap). The user now opts in with a click.
  const handleGoogleSignIn = async () => {
    setStatus('redirecting')
    setErrorMessage('')

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${
      returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''
    }`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message || 'We could not reach Google. Please try again.')
    }
  }

  return (
    <>
      <Head>
        <title>Sign in — AI Spirit</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-flex mb-8" aria-label="AI Spirit home">
            <div className="w-16 h-16 bg-black rounded-2xl overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="AI Spirit" className="w-full h-full object-cover" />
            </div>
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl text-black leading-tight mb-3">
            Sign in to start talking.
          </h1>
          <p className="text-[15px] text-black/60 leading-relaxed mb-8">
            Your conversations are private and saved to your account, so you can pick up
            where you left off on any device.
          </p>

          {status === 'error' && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 rounded-2xl bg-black/[0.04] border border-black/10 text-sm text-black/80 text-left"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={status === 'redirecting'}
            className="w-full inline-flex items-center justify-center gap-3 bg-black text-white rounded-full px-6 py-3.5 text-[15px] font-medium transition-all duration-300 hover:bg-black/90 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            {status === 'redirecting' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to Google…
              </>
            ) : (
              <>
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-6 text-xs text-black/50 leading-relaxed">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-black transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-black transition-colors">
              Privacy Policy
            </Link>
            .
          </p>

          <Link
            href="/personas"
            className="mt-8 inline-block text-sm text-black/60 hover:text-black transition-colors underline decoration-black/20 hover:decoration-black/60"
          >
            Browse personas without signing in
          </Link>
        </div>
      </main>
    </>
  )
}
