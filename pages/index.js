import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import ContactModal from '@/components/ContactModal'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
        <title>AI-Spirit - Chat with Legendary Minds</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="relative min-h-screen bg-white overflow-hidden">
        {/* Animated cursor follower */}
        <div
          className="hidden md:block fixed w-96 h-96 rounded-full bg-black opacity-5 pointer-events-none blur-3xl transition-all duration-300 ease-out"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
        />

        {/* Floating shapes */}
        <div className="absolute top-20 right-10 w-32 h-32 border-2 border-black/10 rounded-full animate-float" />
        <div className="absolute bottom-40 left-10 w-24 h-24 border-2 border-black/10 rounded-lg rotate-45 animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-black/5 rounded-lg animate-float" style={{animationDelay: '2s'}} />

        {/* Header */}
        <header className="relative z-10 px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">AI-Spirit</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-4 md:px-6 py-2.5 md:py-3 border-2 border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 font-semibold text-sm md:text-base min-h-[44px]"
              >
                Contact
              </button>
              {!user && (
                <button
                  onClick={handleSignIn}
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 font-semibold text-sm md:text-base min-h-[44px]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 px-4 md:px-8 pt-12 md:pt-20 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black rounded-full bg-white">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold">22+ AI Personas Live</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center mb-12 animate-fadeIn" style={{animationDelay: '100ms'}}>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-none">
                Chat with
                <br />
                <span className="relative inline-block">
                  Legendary Minds
                  <svg className="absolute -bottom-4 left-0 w-full" height="20" viewBox="0 0 500 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 15 Q 250 5, 495 15" stroke="black" strokeWidth="3" fill="none" className="animate-draw-line"/>
                  </svg>
                </span>
              </h2>
              <p className="text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
                From spiritual leaders to scientists, philosophers to revolutionaries — experience AI-powered conversations with history&apos;s greatest minds.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fadeIn" style={{animationDelay: '200ms'}}>
              <button
                onClick={handleStartChatting}
                className="group px-8 md:px-12 py-4 md:py-5 bg-black text-white rounded-full font-bold text-base md:text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
              >
                Start Chatting
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/personas')}
                className="px-8 md:px-12 py-4 md:py-5 border-2 border-black text-black rounded-full font-bold text-base md:text-lg hover:bg-black hover:text-white transition-all duration-300"
              >
                Explore Personas
              </button>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mb-20">
              {[
                { icon: '🧘', title: 'Spiritual', desc: 'Guides & Teachers' },
                { icon: '📚', title: 'Historical', desc: 'Leaders & Icons' },
                { icon: '🔬', title: 'Scientific', desc: 'Minds & Innovators' },
                { icon: '💭', title: 'Philosophical', desc: 'Thinkers & Sages' }
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className="group p-6 border-2 border-black rounded-3xl hover:bg-black hover:text-white transition-all duration-300 cursor-pointer animate-fadeIn"
                  style={{animationDelay: `${300 + idx * 100}ms`}}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="font-black text-lg mb-1">{item.title}</h3>
                  <p className="text-sm opacity-70">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-4xl mx-auto mb-20">
              {[
                { number: '22+', label: 'Personas' },
                { number: '6', label: 'Categories' },
                { number: '∞', label: 'Possibilities' }
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="text-center animate-fadeIn"
                  style={{animationDelay: `${700 + idx * 100}ms`}}
                >
                  <div className="text-4xl md:text-6xl font-black mb-2">{stat.number}</div>
                  <div className="text-sm md:text-base text-gray-600 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial-style Quote */}
            <div className="max-w-3xl mx-auto text-center animate-fadeIn" style={{animationDelay: '1s'}}>
              <div className="p-8 md:p-12 border-2 border-black rounded-3xl bg-white relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center text-2xl">
                  💬
                </div>
                <blockquote className="text-xl md:text-2xl font-bold mb-4">
                  &ldquo;Every conversation is a journey through time and wisdom&rdquo;
                </blockquote>
                <p className="text-gray-600">Experience AI-powered dialogues that inspire, educate, and transform.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t-2 border-black py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="font-bold">© 2025 AI-Spirit</div>
              <div className="flex gap-6">
                <button onClick={() => setIsContactModalOpen(true)} className="text-gray-600 hover:text-black transition-colors font-semibold">
                  Contact
                </button>
                <button onClick={() => router.push('/personas')} className="text-gray-600 hover:text-black transition-colors font-semibold">
                  Personas
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <style jsx>{`
        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-line {
          animation: draw-line 2s ease-out forwards;
          animation-delay: 500ms;
        }
      `}</style>
    </>
  )
}
