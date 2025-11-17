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

      <div className="min-h-screen bg-white text-black flex flex-col relative overflow-hidden">
        {/* Minimalistic Background Animations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating circles */}
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-gray-200 rounded-full animate-float opacity-60" />
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-gray-200 rounded-full animate-float opacity-50" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 border-2 border-gray-200 rounded-full animate-float opacity-40" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-gray-200 rounded-full animate-float opacity-50" style={{animationDelay: '3s'}} />

          {/* Gradient orbs */}
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-3xl opacity-40 animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center animate-fadeIn relative z-10">
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

            {/* CTA Button */}
            <div className="flex justify-center animate-fadeIn" style={{animationDelay: '200ms'}}>
              <button
                onClick={handleStartChatting}
                className="px-10 py-4 bg-black text-white text-base font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                Start Chatting →
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  )
}
