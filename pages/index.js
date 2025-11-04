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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6 sm:mb-8 px-2 tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              Enter the world of AI Personas
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-12 sm:mb-24 md:mb-48 max-w-3xl mx-auto leading-relaxed px-4 font-light tracking-tight">
              Engage with AI-powered personas - from business icons to historical figures,
              celebrities to fictional characters.
            </p>

            {/* Login/Signup Options - Moved Down */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
              <Link
                href="/personas"
                className="group relative bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-2xl border border-white/40 text-white font-semibold text-base sm:text-lg px-10 sm:px-12 py-4 sm:py-5 rounded-full hover:from-white/30 hover:via-white/20 hover:to-white/15 hover:border-white/60 transition-all duration-400 ease-premium hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_12px_48px_-4px_rgba(0,0,0,0.5),0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/5 to-white/10" />
                <span className="relative z-10 tracking-wide">Start Chatting</span>
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-white/40 text-xs sm:text-sm mt-6 px-4 font-light tracking-wide">
            AI-generated responses for entertainment and educational purposes
          </div>
        </div>
      </main>
    </>
  )
}
