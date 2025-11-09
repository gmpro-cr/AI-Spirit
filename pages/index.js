import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ParticlesBackground from '@/components/layout/ParticlesBackground'

export default function Home() {
  const features = [
    {
      icon: '🎭',
      title: '25+ Personas',
      description: 'From Einstein to Elon Musk',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🎙️',
      title: 'AI Voices',
      description: 'Realistic text-to-speech',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🌍',
      title: 'Multi-language',
      description: 'English, Hindi & more',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '⚡',
      title: 'Instant Responses',
      description: 'Powered by Google Gemini',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <>
      <Head>
        <title>AI-Spirit - Chat with Anyone, Real or Imagined</title>
        <meta name="description" content="Engage with AI-powered personas from history, business, entertainment, and spirituality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ParticlesBackground />
      <Navbar />

      <main className="relative min-h-screen pt-20 md:pt-28 pb-20 px-4 sm:px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center pt-16 md:pt-24 pb-20 md:pb-32 animate-fadeIn">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 mb-8 shadow-lg shadow-purple-500/20 animate-pulse-glow" style={{animationDelay: '0.1s'}}>
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm text-white font-semibold tracking-wide">25+ AI Personas | Real-time Chat</span>
            </div>

            {/* Main Heading with Gradient */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 px-2 tracking-tight leading-[1.1] animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <span className="block bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-2xl mb-2">
                Talk to the
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl bg-[length:200%_auto] animate-gradient">
                Greatest Minds
              </span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl bg-[length:200%_auto] animate-gradient text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                of All Time
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed px-4 font-light animate-fadeIn" style={{animationDelay: '0.3s'}}>
              Experience AI-powered conversations with historical figures, business leaders,
              spiritual teachers, and cultural icons
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center px-4 mb-20 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <Link
                href="/personas"
                className="group relative px-10 py-5 text-lg font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] animate-gradient"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Chatting
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/personas"
                className="group relative px-10 py-5 text-lg font-semibold text-white rounded-2xl overflow-hidden backdrop-blur-xl border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-cyan-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">Explore Personas</span>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto animate-fadeIn" style={{animationDelay: '0.5s'}}>
              {features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group relative p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 animate-scaleIn"
                  style={{animationDelay: `${0.6 + idx * 0.1}s`}}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 rounded-3xl transition-opacity`}></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>

                  <div className="relative z-10">
                    <div className={`text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 animate-fadeIn" style={{animationDelay: '1s'}}>
            {[
              { number: '25+', label: 'AI Personas', color: 'from-purple-500 to-pink-500' },
              { number: '100%', label: 'Realistic Voices', color: 'from-cyan-500 to-blue-500' },
              { number: '10+', label: 'Languages', color: 'from-green-500 to-emerald-500' },
              { number: '24/7', label: 'Available', color: 'from-orange-500 to-red-500' }
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:scale-105 animate-scaleIn"
                style={{animationDelay: `${1.1 + idx * 0.1}s`}}
              >
                <div className={`text-4xl md:text-5xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-center text-gray-500 text-sm px-4 font-light animate-fadeIn" style={{animationDelay: '1.5s'}}>
            AI-generated responses for entertainment and educational purposes
          </div>
        </div>
      </main>
    </>
  )
}
