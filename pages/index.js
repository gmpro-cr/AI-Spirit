import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import ContactModal from '@/components/ContactModal'

export default function Home() {
  const router = useRouter()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [personas, setPersonas] = useState([])
  const animationFrameRef = useRef(null)
  const boxRef = useRef(null)

  // All available personas for floating images (including For You)
  const floatingPersonas = [
    // For You personas
    { name: 'Life Coach', image: '/personas/life-coach.jpg' },
    { name: 'Career Mentor', image: '/personas/career-mentor.jpg' },
    { name: 'Travel Guide', image: '/personas/travel-guide.jpg' },
    { name: 'Fitness Coach', image: '/personas/fitness-coach.jpg' },
    { name: 'Money Manager', image: '/personas/money-manager.jpg' },
    { name: 'Astro Guide', image: '/personas/astro-guide.jpg' },
    // Historical & other personas
    { name: 'Albert Einstein', image: '/personas/albert-einstein.jpg' },
    { name: 'Swami Vivekananda', image: '/personas/swami-vivekananda.jpg' },
    { name: 'APJ Abdul Kalam', image: '/personas/apj-abdul-kalam.jpg' },
    { name: 'Elon Musk', image: '/personas/elon-musk.jpg' },
    { name: 'Mahatma Gandhi', image: '/personas/mahatma-gandhi.jpg' },
    { name: 'Osho', image: '/personas/osho.jpg' },
    { name: 'Ratan Tata', image: '/personas/ratan-tata.jpg' },
    { name: 'Socrates', image: '/personas/socrates.jpg' },
    { name: 'Charlie Munger', image: '/personas/charlie-munger.jpg' },
    { name: 'Birbal', image: '/personas/birbal.jpg' },
    { name: 'Isaac Newton', image: '/personas/isaac-newton.jpg' },
    { name: 'Shinchan', image: '/personas/shinchan.jpg' },
    { name: 'Tenali Raman', image: '/personas/tenali-raman.jpg' },
  ]

  // Initialize personas with random positions and velocities
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialPersonas = floatingPersonas.map((persona, index) => ({
      ...persona,
      id: index,
      x: Math.random() * 80 + 10, // 10-90% of container width
      y: Math.random() * 80 + 10, // 10-90% of container height
      vx: (Math.random() - 0.5) * 0.15, // Slow horizontal velocity
      vy: (Math.random() - 0.5) * 0.15, // Slow vertical velocity
      size: 60, // Same size for all personas
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

          // Bounce off walls with padding
          const padding = 5
          if (persona.x <= padding) {
            persona.x = padding
            persona.vx = Math.abs(persona.vx)
          }
          if (persona.x >= 100 - padding) {
            persona.x = 100 - padding
            persona.vx = -Math.abs(persona.vx)
          }
          if (persona.y <= padding) {
            persona.y = padding
            persona.vy = Math.abs(persona.vy)
          }
          if (persona.y >= 100 - padding) {
            persona.y = 100 - padding
            persona.vy = -Math.abs(persona.vy)
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

            // Calculate minimum distance based on uniform size (in percentage)
            const minDistance = (60 / 400) * 100 // 60px persona size relative to ~400px box height

            if (distance < minDistance && distance > 0) {
              // Calculate collision normal
              const nx = dx / distance
              const ny = dy / distance

              // Relative velocity
              const dvx = p2.vx - p1.vx
              const dvy = p2.vy - p1.vy

              // Relative velocity in collision normal direction
              const dvn = dvx * nx + dvy * ny

              // Only resolve if objects are moving toward each other
              if (dvn < 0) {
                // Apply impulse
                const impulse = dvn
                p1.vx += impulse * nx
                p1.vy += impulse * ny
                p2.vx -= impulse * nx
                p2.vy -= impulse * ny
              }

              // Separate overlapping personas
              const overlap = minDistance - distance
              const separationX = (overlap / 2) * nx
              const separationY = (overlap / 2) * ny

              p1.x -= separationX
              p1.y -= separationY
              p2.x += separationX
              p2.y += separationY
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
    router.push('/personas')
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
          <h1 className="text-xl md:text-2xl font-black tracking-tight">
            <span className="italic">AI</span> -Spirit
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="px-4 md:px-6 py-2 text-xl md:text-2xl font-semibold hover:opacity-60 transition-opacity min-h-[44px]"
            >
              Contact Us
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-8">
          {/* Headline */}
          <h2 className="text-xl md:text-5xl lg:text-6xl font-black tracking-tight text-black mb-6 animate-fadeIn">
            Enter the world of AI Personas
          </h2>

          {/* Floating Personas Box */}
          <div ref={boxRef} className="relative w-full max-w-3xl h-[350px] md:h-[400px] border-4 border-black rounded-2xl overflow-hidden bg-white mb-6 animate-fadeIn" style={{animationDelay: '100ms'}}>
            {/* Floating Persona Images */}
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="absolute rounded-full overflow-hidden border-2 border-gray-300 shadow-lg opacity-90 transition-all duration-0 ease-linear"
                style={{
                  left: `${persona.x}%`,
                  top: `${persona.y}%`,
                  width: `${persona.size}px`,
                  height: `${persona.size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img src={persona.image} alt={persona.name} className="w-full h-full object-cover object-[center_25%]" />
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
