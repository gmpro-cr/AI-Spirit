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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/20 mb-8 backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
              <span className="text-sm text-white/80 font-medium">25+ Personas Available</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 sm:mb-8 px-2 tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(255,255,255,0.2)] animate-gradient">
              Enter the world of<br/>
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">AI Personas</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed px-4 font-light tracking-wide">
              Engage with AI-powered personas - from business icons to historical figures,
              <br className="hidden md:block"/>celebrities to fictional characters.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16 px-4">
              <div className="group relative bg-gradient-to-br from-white/8 via-white/4 to-white/2 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:from-white/12 hover:to-white/6 hover:border-white/30 transition-all duration-500 hover:scale-105">
                <div className="text-3xl mb-3">🎭</div>
                <h3 className="text-white font-semibold mb-2">Diverse Personas</h3>
                <p className="text-white/50 text-sm">Chat with icons from business, entertainment, sports & more</p>
              </div>
              <div className="group relative bg-gradient-to-br from-white/8 via-white/4 to-white/2 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:from-white/12 hover:to-white/6 hover:border-white/30 transition-all duration-500 hover:scale-105">
                <div className="text-3xl mb-3">🎙️</div>
                <h3 className="text-white font-semibold mb-2">Realistic Voices</h3>
                <p className="text-white/50 text-sm">Hear personas speak in their authentic voices</p>
              </div>
              <div className="group relative bg-gradient-to-br from-white/8 via-white/4 to-white/2 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:from-white/12 hover:to-white/6 hover:border-white/30 transition-all duration-500 hover:scale-105">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-white font-semibold mb-2">Natural Conversations</h3>
                <p className="text-white/50 text-sm">Powered by advanced AI for authentic interactions</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4 mt-12">
              <Link
                href="/personas"
                className="group relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-base sm:text-lg px-12 sm:px-14 py-5 sm:py-6 rounded-full hover:shadow-[0_0_40px_rgba(147,51,234,0.6),0_20px_50px_-12px_rgba(0,0,0,0.8)] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] transition-all duration-500 ease-premium hover:scale-[1.05] active:scale-[0.98] overflow-hidden animate-gradient-xy"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 tracking-wide flex items-center gap-3">
                  Start Chatting
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-white/30 text-xs sm:text-sm mt-16 px-4 font-light tracking-wide">
            AI-generated responses for entertainment and educational purposes
          </div>
        </div>
      </main>
    </>
  )
}
