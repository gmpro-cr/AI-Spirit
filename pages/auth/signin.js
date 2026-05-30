import Head from 'next/head'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const TRUST_ITEMS = [
  { label: 'Private & Encrypted', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> },
  { label: 'No Data Selling', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
  { label: 'Zero Judgment', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
]

const PERSONA_CATEGORIES = [
  { label: 'Spiritual Guides', color: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
  { label: 'Tech Visionaries', color: 'from-blue-50 to-sky-50', border: 'border-blue-100' },
  { label: 'Historical Figures', color: 'from-stone-50 to-gray-50', border: 'border-stone-100' },
  { label: 'Scientists', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
  { label: 'Philosophers', color: 'from-violet-50 to-purple-50', border: 'border-violet-100' },
  { label: 'Companions', color: 'from-rose-50 to-pink-50', border: 'border-rose-100' },
]

export default function SignIn() {
  const router = useRouter()
  const { user } = useAuth()
  const { returnTo } = router.query
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (user) router.push(returnTo || '/')
  }, [user, router, returnTo])

  if (!mounted) {
    return (
      <>
        <Head>
          <title>Sign In — AI Spirit</title>
          <meta name="description" content="Sign in to AI Spirit and start conversations with AI personas." />
        </Head>
        <div className="min-h-[100dvh] bg-white" suppressHydrationWarning />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Sign In — AI Spirit</title>
        <meta name="description" content="Sign in to AI Spirit and start conversations with AI personas." />
      </Head>

      <div className="min-h-[100dvh] bg-white font-sans">
        <div className="min-h-[100dvh] flex flex-col lg:flex-row">

          {/* ── LEFT: Form panel ── */}
          <div className="flex flex-col justify-between px-8 py-10 lg:px-14 lg:py-12 lg:w-[52%] xl:w-[48%]">

            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 group w-fit">
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-display text-sm pt-0.5">
                AI
              </div>
              <span className="font-display text-xl tracking-tight text-black group-hover:opacity-60 transition-opacity duration-300">
                AI Spirit
              </span>
            </Link>

            {/* Form */}
            <div className="w-full max-w-[380px] mx-auto lg:mx-0 py-10">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-black/30" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-medium">Welcome</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05] text-black mb-4">
                Every mind,<br />
                <span className="text-black/30 italic">one message away.</span>
              </h1>

              <p className="text-black/50 text-sm leading-relaxed mb-10 max-w-[300px]">
                Connect with 350+ AI personas — spiritual guides, visionaries, philosophers, and more.
              </p>

              {/* Double-bezel card */}
              <div className="p-1.5 rounded-[1.5rem] ring-1 ring-black/[0.06] bg-black/[0.03]">
                <div className="bg-white rounded-[calc(1.5rem-0.375rem)] border border-black/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] px-6 py-7">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-black/30 mb-5">
                    Continue with
                  </p>

                  <Auth
                    supabaseClient={supabase}
                    appearance={{
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#000000',
                            brandAccent: '#1a1a1a',
                            brandButtonText: '#ffffff',
                            defaultButtonBackground: '#f5f5f5',
                            defaultButtonBackgroundHover: '#ebebeb',
                            defaultButtonBorder: '#e5e5e5',
                            defaultButtonText: '#000000',
                            inputBackground: '#fafafa',
                            inputBorder: '#e5e5e5',
                            inputBorderHover: '#c0c0c0',
                            inputBorderFocus: '#000000',
                            inputText: '#000000',
                            inputPlaceholder: '#aaaaaa',
                            messageText: '#666666',
                            anchorTextColor: '#000000',
                            anchorTextHoverColor: '#333333',
                          },
                          space: {
                            buttonPadding: '12px 20px',
                            inputPadding: '12px 16px',
                          },
                          borderWidths: {
                            buttonBorderWidth: '1px',
                            inputBorderWidth: '1px',
                          },
                          radii: {
                            borderRadiusButton: '0.75rem',
                            buttonBorderRadius: '0.75rem',
                            inputBorderRadius: '0.75rem',
                          },
                          fontSizes: {
                            baseButtonSize: '0.875rem',
                          },
                        },
                      },
                      style: {
                        button: {
                          fontWeight: '500',
                          letterSpacing: '0.01em',
                          transition: 'all 300ms cubic-bezier(0.32,0.72,0,1)',
                        },
                        anchor: {
                          color: '#666666',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                        },
                        message: {
                          fontSize: '0.75rem',
                          color: '#666666',
                        },
                        container: { gap: '0' },
                        divider: { display: 'none' },
                      },
                    }}
                    providers={['google']}
                    onlyThirdPartyProviders={true}
                    redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                  />

                  <div className="mt-5 pt-5 border-t border-black/[0.06]">
                    <p className="text-black/30 text-[11px] leading-relaxed">
                      By continuing, you agree to our{' '}
                      <Link href="/terms" className="text-black/50 hover:text-black underline underline-offset-2 transition-colors duration-200">
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-black/50 hover:text-black underline underline-offset-2 transition-colors duration-200">
                        Privacy Policy
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust items */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-7">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-black/30">
                    {item.icon}
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-black/20 text-[11px] tracking-wide">
              © {new Date().getFullYear()} AI Spirit. All rights reserved.
            </p>
          </div>

          {/* ── RIGHT: Showcase panel (desktop only) ── */}
          <div className="hidden lg:flex flex-1 bg-[#F7F7F5] items-center justify-center p-10 xl:p-16 border-l border-black/[0.05]">
            <div className="w-full max-w-[420px]">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 mb-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-medium">350+ Personas</span>
              </div>

              <h2 className="font-display text-3xl xl:text-4xl text-black tracking-tight leading-tight mb-3">
                Who will you<br />
                <span className="text-black/30 italic">talk to today?</span>
              </h2>
              <p className="text-black/40 text-sm leading-relaxed mb-10">
                Every persona is a distinct mind — explore wisdom across history, philosophy, science, and beyond.
              </p>

              {/* Category grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {PERSONA_CATEGORIES.map((cat) => (
                  <div
                    key={cat.label}
                    className={`p-1 rounded-xl ring-1 ring-black/[0.05] bg-white/60`}
                  >
                    <div className={`bg-gradient-to-br ${cat.color} border ${cat.border} rounded-[calc(0.75rem-2px)] px-4 py-3`}>
                      <span className="text-xs font-medium text-black/60">{cat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-10 pt-8 border-t border-black/[0.08] flex items-center gap-10">
                {[
                  { value: '350+', label: 'Personas' },
                  { value: '10K+', label: 'Conversations' },
                  { value: '4.9', label: 'Rating' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl text-black">{stat.value}</p>
                    <p className="text-[10px] text-black/30 tracking-wide uppercase mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
