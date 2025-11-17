import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import ContactModal from '@/components/ContactModal'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [personas, setPersonas] = useState([])
  const animationFrameRef = useRef(null)
  const boxRef = useRef(null)

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

  // Initialize personas with random positions and velocities
  useEffect(() => {
    if (typeof window === 'undefined') return

    const sizes = [80, 70, 60, 70, 80, 60, 70, 80, 65, 70]

    const initialPersonas = floatingPersonas.map((persona, index) => ({
      ...persona,
      id: index,
      x: Math.random() * 70 + 10, // 10-80% of container width
      y: Math.random() * 70 + 10, // 10-80% of container height
      vx: (Math.random() - 0.5) * 0.8, // Faster horizontal velocity
      vy: (Math.random() - 0.5) * 0.8, // Faster vertical velocity
      size: sizes[index],
    }))

    setPersonas(initialPersonas)
  }, [])

  // Animation loop with collision detection
  useEffect(() => {
    if (personas.length === 0) return

    const animate = () => {
      setPersonas(prevPersonas => {
        const newPersonas = prevPersonas.map(persona => ({ ...persona }))

        // Move each persona
        newPersonas.forEach(persona => {
          persona.x += persona.vx
          persona.y += persona.vy

          // Bounce off walls
          if (persona.x <= 0 || persona.x >= 100) {
            persona.vx *= -1
            persona.x = Math.max(0, Math.min(100, persona.x))
          }
          if (persona.y <= 0 || persona.y >= 100) {
            persona.vy *= -1
            persona.y = Math.max(0, Math.min(100, persona.y))
          }
        })

        // Check for collisions between personas
        for (let i = 0; i < newPersonas.length; i++) {
          for (let j = i + 1; j < newPersonas.length; j++) {
            const p1 = newPersonas[i]
            const p2 = newPersonas[j]

            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const minDistance = 12 // Minimum distance to avoid overlap

            if (distance < minDistance) {
              // Collision detected - swap velocities (simplified elastic collision)
              const tempVx = p1.vx
              const tempVy = p1.vy
              p1.vx = p2.vx
              p1.vy = p2.vy
              p2.vx = tempVx
              p2.vy = tempVy

              // Add some randomness to prevent getting stuck
              p1.vx += (Math.random() - 0.5) * 0.2
              p1.vy += (Math.random() - 0.5) * 0.2
              p2.vx += (Math.random() - 0.5) * 0.2
              p2.vy += (Math.random() - 0.5) * 0.2

              // Separate the personas to prevent overlap
              const angle = Math.atan2(dy, dx)
              const targetX = p1.x + Math.cos(angle) * minDistance
              const targetY = p1.y + Math.sin(angle) * minDistance
              p2.x = targetX
              p2.y = targetY
            }
          }
        }

        return newPersonas
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [personas.length])

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
          <div ref={boxRef} className="relative w-full max-w-4xl h-[400px] md:h-[500px] border-4 border-black rounded-2xl overflow-hidden bg-white mb-8 animate-fadeIn">
            {/* Floating Persona Images */}
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="absolute rounded-full overflow-hidden border-2 border-gray-300 shadow-lg opacity-90 transition-all duration-75 ease-linear"
                style={{
                  left: `${persona.x}%`,
                  top: `${persona.y}%`,
                  width: `${persona.size}px`,
                  height: `${persona.size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
              </div>
            ))}

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
