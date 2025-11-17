import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import ContactModal from '@/components/ContactModal'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const handleStartChatting = () => {
    if (user) {
      router.push('/personas')
    } else {
      router.push('/auth/signin?returnTo=/personas')
    }
  }

  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  return (
    <>
      <Head>
        <title>AI-Spirit - Enter the world of AI Personas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI-Spirit
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/30 text-white rounded-xl hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/50 transition-smooth shadow-glass hover:shadow-glass-hover min-h-[44px] text-sm md:text-base"
              >
                Contact Us
              </button>
              {!user && (
                <button
                  onClick={handleSignIn}
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-smooth shadow-glass hover:shadow-glass-hover font-semibold min-h-[44px] text-sm md:text-base"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 py-12 md:py-20 min-h-[calc(100vh-200px)]">
          {/* Hero Section */}
          <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/30 rounded-full shadow-glass">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-white/90 text-sm font-medium">22+ AI Personas Available</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              Enter the world of
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-xy">
                AI Personas
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Chat with legendary personalities, spiritual guides, and historical figures. Experience conversations powered by advanced AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button
                onClick={handleStartChatting}
                className="group relative px-8 md:px-12 py-4 md:py-5 bg-white text-black text-base md:text-lg font-bold rounded-2xl hover:scale-105 transition-smooth shadow-glass hover:shadow-glass-hover overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Start Chatting
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <button
                onClick={() => router.push('/personas')}
                className="px-8 md:px-12 py-4 md:py-5 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/30 text-white text-base md:text-lg font-semibold rounded-2xl hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/50 transition-smooth shadow-glass hover:shadow-glass-hover"
              >
                Explore Personas
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center pt-8">
              {['Spiritual Guides', 'Historical Figures', 'Philosophers', 'Scientists'].map((feature, idx) => (
                <div
                  key={feature}
                  className="px-4 py-2 bg-gradient-to-br from-white/10 via-white/5 to-white/3 backdrop-blur-xl border border-white/20 rounded-full text-white/80 text-sm animate-fadeIn"
                  style={{animationDelay: `${idx * 100}ms`}}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mt-16 md:mt-24">
            {[
              { number: '22+', label: 'AI Personas' },
              { number: '6', label: 'Categories' },
              { number: '∞', label: 'Conversations' }
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/30 rounded-2xl p-4 md:p-6 shadow-glass animate-fadeIn"
                style={{animationDelay: `${idx * 150}ms`}}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm md:text-base text-white/70">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 text-center text-white/50 text-sm">
            © 2025 AI-Spirit. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  )
}
