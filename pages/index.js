import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import ContactModal from '@/components/ContactModal'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Featured personas for floating images (only those with available images)
  const floatingPersonas = [
    { name: 'Albert Einstein', image: '/personas/albert-einstein.jpg' },
    { name: 'Swami Vivekananda', image: '/personas/swami-vivekananda.jpg' },
    { name: 'APJ Abdul Kalam', image: '/personas/apj-abdul-kalam.jpg' },
    { name: 'Elon Musk', image: '/personas/elon-musk.jpg' },
    { name: 'Mahatma Gandhi', image: '/personas/mahatma-gandhi.jpg' },
    { name: 'Osho', image: '/personas/osho.jpg' },
    { name: 'Ratan Tata', image: '/personas/ratan-tata.jpg' },
    { name: 'Socrates', image: '/personas/socrates.jpg' },
    { name: 'J Krishnamurti', image: '/personas/j-krishnamurti.jpg' },
    { name: 'Rabindranath Tagore', image: '/personas/rabindranath-tagore.jpg' },
  ]

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
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Floating Personas Box */}
          <div className="relative w-full max-w-4xl h-[400px] md:h-[500px] border-4 border-black rounded-2xl overflow-hidden bg-white mb-8 animate-fadeIn">
            {/* Floating Persona Images */}
            {floatingPersonas.map((persona, index) => {
              const positions = [
                'top-[10%] left-[8%]',
                'top-[15%] right-[12%]',
                'top-[35%] left-[5%]',
                'top-[50%] right-[8%]',
                'bottom-[15%] left-[15%]',
                'bottom-[20%] right-[18%]',
                'top-[60%] left-[25%]',
                'bottom-[35%] right-[28%]',
                'top-[40%] right-[35%]',
                'bottom-[45%] left-[35%]'
              ]
              const sizes = [
                'w-16 h-16 md:w-20 md:h-20',
                'w-14 h-14 md:w-18 md:h-18',
                'w-12 h-12 md:w-16 md:h-16',
                'w-14 h-14 md:w-18 md:h-18',
                'w-16 h-16 md:w-20 md:h-20',
                'w-12 h-12 md:w-16 md:h-16',
                'w-14 h-14 md:w-18 md:h-18',
                'w-16 h-16 md:w-20 md:h-20',
                'w-12 h-12 md:w-14 md:h-14',
                'w-14 h-14 md:w-16 md:h-16'
              ]
              const opacities = ['opacity-80', 'opacity-70', 'opacity-75', 'opacity-85', 'opacity-80', 'opacity-70', 'opacity-75', 'opacity-85', 'opacity-70', 'opacity-75']

              return (
                <div
                  key={index}
                  className={`absolute ${positions[index]} ${sizes[index]} ${opacities[index]} rounded-full overflow-hidden border-2 border-gray-300 shadow-lg animate-float`}
                  style={{animationDelay: `${index * 0.3}s`}}
                >
                  <img src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
                </div>
              )
            })}

            {/* Gradient orbs inside box */}
            <div className="absolute top-1/4 right-[10%] w-48 h-48 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 left-[10%] w-56 h-56 bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" style={{animationDelay: '2s'}} />
          </div>

          {/* Start Chatting Button */}
          <div className="flex justify-center animate-fadeIn" style={{animationDelay: '200ms'}}>
            <button
              onClick={handleStartChatting}
              className="px-10 py-4 bg-black text-white text-base md:text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              Start Chatting →
            </button>
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
