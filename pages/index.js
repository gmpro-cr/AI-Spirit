import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ParticlesBackground from '@/components/layout/ParticlesBackground'

export default function Home() {
  const features = [
    {
      icon: '🎭',
      title: '25+ Personas',
      description: 'From Einstein to Elon Musk'
    },
    {
      icon: '🎙️',
      title: 'AI Voices',
      description: 'Realistic text-to-speech'
    },
    {
      icon: '🌍',
      title: 'Multi-language',
      description: 'English, Hindi & more'
    },
    {
      icon: '⚡',
      title: 'Real-time',
      description: 'Instant AI responses'
    }
  ]

  const categories = [
    { name: 'Business Leaders', count: 5 },
    { name: 'Historical Figures', count: 8 },
    { name: 'Spiritual Teachers', count: 6 },
    { name: 'Entertainment', count: 4 }
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

      <main className="relative min-h-screen bg-gradient-dark pt-20 md:pt-24 pb-20 px-4 sm:px-6 z-10 overflow-x-hidden max-w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center pt-12 md:pt-20 pb-16 md:pb-24 animate-fadeIn">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/25 mb-8 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.12)] animate-fadeIn" style={{animationDelay: '0.1s'}}>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
              <span className="text-sm text-white/80 font-medium tracking-wide">25+ AI Personas Available</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 px-2 tracking-tight leading-[1.1] animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <span className="block bg-gradient-to-b from-white via-white to-white/90 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(255,255,255,0.25)]">
                Converse with the
              </span>
              <span className="block mt-2 bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(255,255,255,0.25)]">
                Greatest Minds
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed px-4 font-light tracking-tight animate-fadeIn" style={{animationDelay: '0.3s'}}>
              Chat with AI-powered personas spanning business icons, historical legends,
              spiritual teachers, and cultural icons—all in one place
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 mb-16 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <Link
                href="/personas"
                className="group relative bg-gradient-to-br from-white via-white/98 to-white/95 text-black font-bold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-full shadow-[0_12px_48px_-4px_rgba(255,255,255,0.3),0_6px_24px_rgba(255,255,255,0.2),inset_0_2px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_16px_64px_-4px_rgba(255,255,255,0.4),0_8px_32px_rgba(255,255,255,0.25),inset_0_2px_1px_rgba(255,255,255,1)] transition-all duration-500 ease-out hover:scale-[1.05] active:scale-[0.98] whitespace-nowrap overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />
                <span className="relative z-10 tracking-wide">Explore Personas →</span>
              </Link>

              <Link
                href="/personas"
                className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/30 text-white font-semibold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-full shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3),inset_0_2px_1px_rgba(255,255,255,0.12)] hover:shadow-[0_12px_48px_-4px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.15)] hover:from-white/20 hover:via-white/12 hover:to-white/8 hover:border-white/40 transition-all duration-500 ease-out hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <span className="relative z-10 tracking-wide">Learn More</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto animate-fadeIn" style={{animationDelay: '0.5s'}}>
              {categories.map((category, idx) => (
                <div
                  key={category.name}
                  className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/5 backdrop-blur-xl border border-white/25 rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_48px_-4px_rgba(255,255,255,0.08),inset_0_2px_1px_rgba(255,255,255,0.15)] hover:from-white/15 hover:via-white/10 hover:to-white/8 transition-all duration-500 animate-fadeIn"
                  style={{animationDelay: `${0.6 + idx * 0.1}s`}}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{category.count}</div>
                    <div className="text-xs sm:text-sm text-white/60 font-light">{category.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-20 animate-fadeIn" style={{animationDelay: '1s'}}>
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="relative group bg-gradient-to-br from-white/10 via-white/6 to-white/3 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.08)] hover:shadow-[0_12px_48px_-4px_rgba(255,255,255,0.08),inset_0_2px_1px_rgba(255,255,255,0.12)] hover:from-white/12 hover:via-white/8 hover:to-white/5 hover:border-white/30 transition-all duration-500 hover:scale-[1.02] animate-fadeIn"
                style={{animationDelay: `${1.1 + idx * 0.1}s`}}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-white font-semibold text-base sm:text-lg mb-1">{feature.title}</h3>
                  <p className="text-white/60 text-xs sm:text-sm font-light">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-center text-white/40 text-xs sm:text-sm px-4 font-light tracking-wide animate-fadeIn" style={{animationDelay: '1.5s'}}>
            AI-generated responses for entertainment and educational purposes
          </div>
        </div>
      </main>
    </>
  )
}
