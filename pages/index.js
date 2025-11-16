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

  const features = [
    {
      icon: '🎭',
      title: 'Diverse AI Personas',
      description: 'Choose from a rich collection of AI personalities, each with unique traits and expertise.'
    },
    {
      icon: '💬',
      title: 'Natural Conversations',
      description: 'Experience fluid, context-aware dialogues that feel genuinely human and engaging.'
    },
    {
      icon: '🎨',
      title: 'Custom Creation',
      description: 'Design and create your own AI personas tailored to your specific needs and preferences.'
    },
    {
      icon: '🚀',
      title: 'Instant Responses',
      description: 'Get lightning-fast, intelligent replies powered by cutting-edge AI technology.'
    }
  ]

  return (
    <>
      <Head>
        <title>AI-Spirit - Enter the world of AI Personas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Spirit
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
              >
                Contact Us
              </button>
              {!user && (
                <button
                  onClick={handleSignIn}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                Enter the World of
                <br />
                AI Personas
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Discover a new dimension of AI interaction. Chat with specialized AI personalities or create your own.
              </p>
              <button
                onClick={handleStartChatting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold px-12 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                Start Chatting
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom CTA Section */}
            <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Begin Your AI Journey?
              </h3>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of users exploring the future of AI conversations today.
              </p>
              <button
                onClick={handleStartChatting}
                className="bg-white text-blue-600 font-bold px-10 py-4 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                Get Started Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} AI-Spirit. All rights reserved.</p>
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
