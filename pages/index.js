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

      <main className="relative min-h-screen bg-gradient-dark pt-24 md:pt-32 pb-16 px-4 sm:px-6 z-10 overflow-x-hidden max-w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center animate-fadeIn">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6 sm:mb-8 px-2 tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-float">
              Enter the world of AI Personas
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/75 mb-32 sm:mb-24 md:mb-48 max-w-3xl mx-auto leading-relaxed px-4 font-light tracking-tight">
              Engage with AI-powered personas - from business icons to historical figures,
              celebrities to fictional characters.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4 mt-8 sm:mt-0 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <Link
                href="/personas"
                className="group relative bg-gradient-to-br from-white/20 via-white/12 to-white/8 backdrop-blur-2xl border border-white/35 text-white font-semibold text-base sm:text-lg px-10 sm:px-12 py-4 sm:py-5 rounded-full shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3),inset_0_2px_1px_rgba(255,255,255,0.15),inset_0_-2px_1px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_-4px_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.2),inset_0_-2px_1px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out hover:scale-[1.03] hover:border-white/50 hover:from-white/25 hover:via-white/15 hover:to-white/10 active:scale-[0.98] whitespace-nowrap overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl bg-white/20 -z-10" />
                <span className="relative z-10 tracking-wide">Start Chatting</span>
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-white/40 text-xs sm:text-sm mt-6 px-4 font-light tracking-wide animate-fadeIn" style={{animationDelay: '0.4s'}}>
            AI-generated responses for entertainment and educational purposes
          </div>
        </div>
      </main>
    </>
  )
}
