import Head from 'next/head'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const { user } = useAuth()
  const { returnTo } = router.query
  const [personas, setPersonas] = useState([])
  const animationFrameRef = useRef(null)
  const boxRef = useRef(null)

  // All available personas for floating images
  const floatingPersonas = [
    { name: 'Albert Einstein', image: '/personas/albert-einstein.jpg' },
    { name: 'Swami Vivekananda', image: '/personas/swami-vivekananda.jpg' },

    { name: 'Elon Musk', image: '/personas/elon-musk.jpg' },
    { name: 'Mahatma Gandhi', image: '/personas/mahatma-gandhi.jpg' },
    { name: 'Osho', image: '/personas/osho.jpg' },
    { name: 'Ratan Tata', image: '/personas/ratan-tata.jpg' },
    { name: 'Socrates', image: '/personas/socrates.jpg' },
    { name: 'J Krishnamurti', image: '/personas/j-krishnamurti.jpg' },
    { name: 'Rabindranath Tagore', image: '/personas/rabindranath-tagore.jpg' },
    { name: 'Birbal', image: '/personas/birbal.jpg' },
    { name: 'Charlie Munger', image: '/personas/charlie-munger.jpg' },
    { name: 'Isaac Newton', image: '/personas/isaac-newton.jpg' },
    { name: 'Jawaharlal Nehru', image: '/personas/jawaharlal-nehru.jpg' },
    { name: 'Sardar Patel', image: '/personas/sardar-vallabhbhai-patel.jpg' },
    { name: 'Shaktiman', image: '/personas/shaktiman.jpg' },
    { name: 'Shinchan', image: '/personas/shinchan.jpg' },
    { name: 'Subhas Chandra Bose', image: '/personas/subhas-chandra-bose.jpg' },
    { name: 'Tenali Raman', image: '/personas/tenali-raman.jpg' },
  ]

  useEffect(() => {
    if (user) {
      // Redirect to the returnTo URL if provided, otherwise go to personas
      const redirectUrl = returnTo || '/personas'
      router.push(redirectUrl)
    }
  }, [user, router, returnTo])

  // Initialize personas with random positions and velocities
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialPersonas = floatingPersonas.map((persona, index) => ({
      ...persona,
      id: index,
      x: Math.random() * 80 + 10, // 10-90% of container width
      y: Math.random() * 80 + 10, // 10-90% of container height
      vx: (Math.random() - 0.5) * 0.4, // Horizontal velocity
      vy: (Math.random() - 0.5) * 0.4, // Vertical velocity
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

  return (
    <>
      <Head>
        <title>Sign In - AI-Spirit</title>
      </Head>

      <div className="min-h-screen bg-white text-black flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center animate-fadeIn relative z-20">
          <Link href="/">
            <h1 className="text-xl md:text-2xl font-black tracking-tight cursor-pointer">
              <span className="italic">AI</span> -Spirit
            </h1>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 relative">
          {/* Floating Personas Box - Background */}
          <div
            ref={boxRef}
            className="absolute inset-0 max-w-full overflow-hidden pointer-events-none opacity-20"
          >
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
          </div>

          {/* Sign In Form - Foreground */}
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white border-2 border-black rounded-lg shadow-xl p-8">
              <h1 className="text-3xl font-bold mb-6 text-center text-black">
                Welcome to AI -Spirit
              </h1>

              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#000000',
                        brandAccent: '#1a1a1a',
                        brandButtonText: '#FFFFFF',
                        defaultButtonBackground: '#000000',
                        defaultButtonBackgroundHover: '#1a1a1a',
                        defaultButtonBorder: '#d1d5db',
                        defaultButtonText: '#FFFFFF',
                        inputBackground: '#FFFFFF',
                        inputBorder: '#d1d5db',
                        inputBorderHover: '#000000',
                        inputBorderFocus: '#000000',
                        inputText: '#000000',
                        inputPlaceholder: '#9ca3af',
                      },
                    },
                  },
                  style: {
                    button: {
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                    },
                    anchor: {
                      color: '#000000',
                      textDecoration: 'underline',
                    },
                    message: {
                      color: '#000000',
                    },
                  },
                }}
                providers={['google']}
                onlyThirdPartyProviders={true}
                redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              />

              <div className="mt-6 text-center text-black text-sm">
                <p>By signing in, you agree to our Terms and Privacy Policy</p>
                <p className="mt-2">AI-generated responses for entertainment purposes</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
