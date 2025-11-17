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
        <title>AI-Spirit - Chat with Legendary Minds</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white text-black flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center animate-fadeIn">
          <h1 className="text-xl md:text-2xl font-black tracking-tight">AI-Spirit</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="px-4 md:px-6 py-2 text-sm md:text-base font-semibold hover:opacity-60 transition-opacity min-h-[44px]"
            >
              Contact
            </button>
            {!user && (
              <button
                onClick={handleSignIn}
                className="px-4 md:px-6 py-2 bg-black text-white text-sm md:text-base font-semibold rounded-full hover:opacity-80 transition-opacity min-h-[44px]"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
            {/* Main Headline */}
            <div className="space-y-4 animate-fadeIn" style={{animationDelay: '100ms'}}>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
                Chat with
                <br />
                Legendary Minds
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                22+ AI personas. Spiritual guides, historical figures, philosophers, and scientists.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn" style={{animationDelay: '200ms'}}>
              <button
                onClick={handleStartChatting}
                className="w-full sm:w-auto px-10 py-4 bg-black text-white text-base font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                Start Chatting →
              </button>
              <button
                onClick={() => router.push('/personas')}
                className="w-full sm:w-auto px-10 py-4 border-2 border-black text-black text-base font-bold rounded-full hover:bg-black hover:text-white transition-colors"
              >
                Explore Personas
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 md:pt-12 animate-fadeIn" style={{animationDelay: '300ms'}}>
              <div>
                <div className="text-3xl md:text-5xl font-black mb-1">22+</div>
                <div className="text-xs md:text-sm text-gray-600 uppercase tracking-wider">Personas</div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-black mb-1">6</div>
                <div className="text-xs md:text-sm text-gray-600 uppercase tracking-wider">Categories</div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-black mb-1">∞</div>
                <div className="text-xs md:text-sm text-gray-600 uppercase tracking-wider">Conversations</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-6 border-t border-gray-200 animate-fadeIn" style={{animationDelay: '400ms'}}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-gray-600">© 2025 AI-Spirit</div>
            <div className="flex gap-6">
              <button onClick={() => setIsContactModalOpen(true)} className="text-gray-600 hover:text-black transition-colors">
                Contact
              </button>
              <button onClick={() => router.push('/personas')} className="text-gray-600 hover:text-black transition-colors">
                Personas
              </button>
            </div>
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
