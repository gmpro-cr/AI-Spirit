import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const { user } = useAuth()
  const { returnTo } = router.query

  // If already signed in, skip straight to destination
  useEffect(() => {
    if (user) router.push(returnTo || '/')
  }, [user, router, returnTo])

  // Once the router is ready (query params resolved), fire Google OAuth immediately
  useEffect(() => {
    if (!router.isReady) return
    if (user) return

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${
      returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''
    }`

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }, [router.isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>Signing in — AI Spirit</title>
      </Head>
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 bg-black rounded-xl overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="AI Spirit" className="w-full h-full object-cover" />
          </div>
          <span className="font-display text-xl tracking-tight text-black">AI Spirit</span>
        </Link>
        <div className="flex items-center gap-2 text-black/30">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Redirecting to Google…</span>
        </div>
      </div>
    </>
  )
}
