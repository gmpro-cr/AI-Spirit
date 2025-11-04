import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ParticlesBackground from '@/components/layout/ParticlesBackground'

export default function Home() {
  return (
    <>
      <Head>
        <title>AI-Spirit - Chat with Anyone, Real or Imagined</title>
        <meta name="description" content="Conversational AI platform with 45+ personas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ParticlesBackground />
      <Navbar />

      <main className="relative min-h-screen bg-gradient-dark pt-24 md:pt-32 pb-16 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center animate-fadeIn">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Chat with Anyone Real or Imagined
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-text-secondary mb-12 sm:mb-24 md:mb-48 max-w-2xl mx-auto leading-relaxed px-4">
              Engage with AI-powered personas - from business icons to historical figures,
              celebrities to fictional characters.
            </p>

            {/* Login/Signup Options - Moved Down */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
              <Link
                href="/personas"
                className="relative bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl border-2 border-white/60 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-3xl hover:from-white/35 hover:via-white/30 hover:to-white/20 hover:border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_0_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-95 hover:scale-105 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/30 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none"
              >
                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Start Chatting</span>
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-text-muted text-xs sm:text-sm mt-4 px-4">
            AI-generated responses for entertainment and educational purposes
          </div>
        </div>
      </main>
    </>
  )
}
