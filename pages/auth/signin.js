import Head from 'next/head'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/brand/Logo'

const PERSONA_TAGS = ['Philosophers', 'Life Coaches', 'Historical Icons', 'Mentors', 'Visionaries', 'Spiritual Guides']

export default function SignIn() {
  const router = useRouter()
  const { user } = useAuth()
  const { returnTo } = router.query
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (user) {
      router.push(returnTo || '/')
    }
  }, [user, router, returnTo])

  // Prevent SSR prerender — page is purely client-side (auth UI, browser APIs)
  if (!mounted) {
    return (
      <>
        <Head>
          <title>Sign In — AI Spirit</title>
          <meta name="description" content="Sign in to AI Spirit and start conversations with AI personas." />
        </Head>
        <div className="min-h-[100dvh] bg-[#080808]" suppressHydrationWarning />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Sign In — AI Spirit</title>
        <meta name="description" content="Sign in to AI Spirit and start conversations with AI personas." />
      </Head>

      <div className="min-h-[100dvh] bg-[#080808] text-white overflow-hidden relative">

        {/* Ambient background glow — fixed, GPU-safe */}
        <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-15%] right-[10%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.018) 0%, transparent 70%)' }}
          />
        </div>

        {/* Grain overlay — fixed, pointer-events-none, GPU-safe */}
        <div
          className="fixed inset-0 pointer-events-none z-10 opacity-[0.025]"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* Main layout */}
        <div className="relative z-20 min-h-[100dvh] flex flex-col lg:flex-row">

          {/* ── LEFT PANEL: Form ── */}
          <div
            className="flex flex-col justify-between px-8 py-10 lg:px-14 lg:py-12 lg:w-[52%] xl:w-[48%]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateY(16px)',
              transition: 'opacity 900ms cubic-bezier(0.32,0.72,0,1), transform 900ms cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* Logo */}
            <header>
              <Link
                href="/"
                style={{ display: 'inline-flex', opacity: 1, transition: 'opacity 300ms cubic-bezier(0.32,0.72,0,1)' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.55'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Logo size="sm" dark={true} />
              </Link>
            </header>

            {/* Form section */}
            <div className="w-full max-w-[360px] mx-auto lg:mx-0">

              {/* Eyebrow tag */}
              <div
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 mb-8"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateY(12px)',
                  transition: 'opacity 800ms 150ms cubic-bezier(0.32,0.72,0,1), transform 800ms 150ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse-soft" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Welcome back</span>
              </div>

              {/* Headline */}
              <h1
                className="mb-5 leading-[0.92] tracking-tight"
                style={{
                  fontFamily: '"Crimson Text", Georgia, serif',
                  fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                  fontStyle: 'italic',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateY(20px)',
                  transition: 'opacity 900ms 200ms cubic-bezier(0.32,0.72,0,1), transform 900ms 200ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                Every mind,<br />
                <span className="text-white/40">one message</span><br />
                away.
              </h1>

              <p
                className="text-white/35 text-sm leading-relaxed mb-10 max-w-[280px]"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateY(16px)',
                  transition: 'opacity 800ms 320ms cubic-bezier(0.32,0.72,0,1), transform 800ms 320ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                Connect with AI personas who think, feel, and respond like the minds who shaped history.
              </p>

              {/* Double-bezel sign-in card */}
              <div
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateY(20px)',
                  transition: 'opacity 900ms 420ms cubic-bezier(0.32,0.72,0,1), transform 900ms 420ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                {/* Outer shell */}
                <div
                  className="rounded-[1.5rem] p-[1px]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
                  }}
                >
                  {/* Inner core */}
                  <div
                    className="bg-[#0f0f0f] rounded-[calc(1.5rem-1px)] px-6 py-7"
                    style={{
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
                    }}
                  >
                    <p className="text-white/50 text-xs font-medium tracking-[0.1em] uppercase mb-5">
                      Continue with
                    </p>

                    <Auth
                      supabaseClient={supabase}
                      appearance={{
                        theme: ThemeSupa,
                        variables: {
                          default: {
                            colors: {
                              brand: '#ffffff',
                              brandAccent: '#e5e5e5',
                              brandButtonText: '#000000',
                              defaultButtonBackground: '#1a1a1a',
                              defaultButtonBackgroundHover: '#242424',
                              defaultButtonBorder: '#2a2a2a',
                              defaultButtonText: '#ffffff',
                              inputBackground: '#141414',
                              inputBorder: '#2a2a2a',
                              inputBorderHover: '#404040',
                              inputBorderFocus: '#ffffff',
                              inputText: '#ffffff',
                              inputPlaceholder: '#555555',
                              messageText: '#999999',
                              anchorTextColor: '#ffffff',
                              anchorTextHoverColor: '#cccccc',
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
                            color: '#888888',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                          },
                          message: {
                            fontSize: '0.75rem',
                            color: '#888888',
                          },
                          container: {
                            gap: '0',
                          },
                          divider: {
                            display: 'none',
                          },
                        },
                      }}
                      providers={['google']}
                      onlyThirdPartyProviders={true}
                      redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                    />

                    <div className="mt-5 pt-5 border-t border-white/[0.06]">
                      <p className="text-white/20 text-[11px] leading-relaxed">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors duration-200">
                          Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors duration-200">
                          Privacy Policy
                        </Link>.
                        AI-generated responses for entertainment purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer>
              <p className="text-white/15 text-[11px] tracking-wide">
                © 2025 AI-Spirit — All minds, always available.
              </p>
            </footer>
          </div>

          {/* ── RIGHT PANEL: Illustration showcase ── */}
          <div
            className="hidden lg:flex flex-1 items-center justify-center p-8 xl:p-14 border-l border-white/[0.04]"
            style={{
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1200ms 300ms cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            <div className="w-full max-w-[480px]">

              {/* Outer shell — double-bezel */}
              <div
                className="rounded-[2rem] p-[1.5px] relative"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
                }}
              >
                {/* Inner core */}
                <div
                  className="bg-[#0d0d0d] rounded-[calc(2rem-1.5px)] flex flex-col items-center gap-0 overflow-hidden"
                  style={{
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Illustration container */}
                  <div className="relative w-full px-10 pt-12 pb-6 flex items-center justify-center">
                    {/* Ambient glow beneath illustration */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 rounded-full blur-3xl"
                      style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
                      aria-hidden="true"
                    />

                    {/* The hero illustration — inverted for dark theme */}
                    <div className="relative w-full aspect-square max-w-[340px]">
                      <Image
                        src="/hero-illustration.png"
                        alt="AI Personas — philosophers, mentors, icons and coaches"
                        fill
                        className="object-contain"
                        style={{ filter: 'invert(1) opacity(0.88)' }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

                  {/* Persona tags */}
                  <div className="px-8 py-7 w-full">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium mb-4 text-center">
                      100+ personas to discover
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {PERSONA_TAGS.map((tag, i) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] text-white/40 text-[11px] tracking-wide"
                          style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(8px)',
                            transition: `opacity 600ms ${500 + i * 70}ms cubic-bezier(0.32,0.72,0,1), transform 600ms ${500 + i * 70}ms cubic-bezier(0.32,0.72,0,1)`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ambient glow behind the whole card */}
                <div
                  className="absolute inset-0 -z-10 rounded-[2rem] blur-2xl scale-90"
                  style={{ background: 'rgba(255,255,255,0.015)' }}
                  aria-hidden="true"
                />
              </div>

              {/* Floating stat strip below card */}
              <div
                className="mt-4 flex items-center justify-center gap-6"
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: 'opacity 800ms 800ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                {[
                  { value: '100+', label: 'Personas' },
                  { value: '24/7', label: 'Available' },
                  { value: '∞', label: 'Conversations' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p
                      className="text-white/70 font-medium text-base"
                      style={{ fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic' }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-white/25 text-[10px] uppercase tracking-[0.15em] mt-0.5">{stat.label}</p>
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
