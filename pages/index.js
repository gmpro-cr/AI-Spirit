import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import ContactModal from '@/components/ContactModal'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [showTyping, setShowTyping] = useState(false)
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayedMessages, setDisplayedMessages] = useState([])

  // Featured personas
  const featuredPersonas = [
    { name: 'Astro Guide', image: '/personas/astro-guide.jpg', slug: 'astro-guide' },
    { name: 'Albert Einstein', image: '/personas/albert-einstein.jpg', slug: 'albert-einstein' },
    { name: 'Fitness Coach', image: '/personas/fitness-coach.jpg', slug: 'fitness-coach' },
    { name: 'Elon Musk', image: '/personas/elon-musk.jpg', slug: 'elon-musk' },
    { name: 'Shinchan', image: '/personas/shinchan.jpg', slug: 'shinchan' },
    { name: 'Mahatma Gandhi', image: '/personas/mahatma-gandhi.jpg', slug: 'mahatma-gandhi' },
    { name: 'Career Mentor', image: '/personas/career-mentor.jpg', slug: 'career-mentor' },
    { name: 'Osho', image: '/personas/osho.jpg', slug: 'osho' },
  ]

  // Chat preview personas with their messages
  const chatPersonas = [
    {
      name: 'Astro Guide',
      image: '/personas/astro-guide.jpg',
      category: 'Cosmic Advisor',
      messages: [
        { type: 'user', text: 'What do the stars say about my day?' },
        { type: 'ai', text: 'Mercury is in retrograde, so communication may feel challenging. But Jupiter\'s alignment with your natal chart brings opportunities for growth. Stay grounded.' },
        { type: 'user', text: 'Should I make important decisions now?' },
        { type: 'ai', text: 'The moon is waxing in your career house. This is an excellent time for new beginnings. Trust your intuition—the cosmos is supporting your journey.' }
      ]
    },
    {
      name: 'Albert Einstein',
      image: '/personas/albert-einstein.jpg',
      category: 'Physicist',
      messages: [
        { type: 'user', text: 'What is time?' },
        { type: 'ai', text: 'Time is relative. What you perceive as absolute is merely a frame of reference.' },
        { type: 'user', text: 'Can you explain more?' },
        { type: 'ai', text: 'Imagine two observers moving at different velocities. They will disagree about the simultaneity of events. Time is not a universal constant—it bends with space itself.' }
      ]
    },
    {
      name: 'Elon Musk',
      image: '/personas/elon-musk.jpg',
      category: 'Entrepreneur',
      messages: [
        { type: 'user', text: 'How do you stay productive?' },
        { type: 'ai', text: 'I work 80-100 hours a week. Sleep is overrated. Also, I have like 47 companies to run. No big deal. 😅' },
        { type: 'user', text: 'Any advice for startups?' },
        { type: 'ai', text: 'First principles thinking. Also, don\'t start a rocket company. I tried to buy Russian ICBMs and they laughed at me. So naturally, I built SpaceX. Normal Tuesday.' }
      ]
    },
    {
      name: 'Osho',
      image: '/personas/osho.jpg',
      category: 'Spiritual Teacher',
      messages: [
        { type: 'user', text: 'How do I find inner peace?' },
        { type: 'ai', text: 'Peace is not something to be found. It is already here. You are just too occupied with the noise of the mind to notice it.' },
        { type: 'user', text: 'But my mind is always busy...' },
        { type: 'ai', text: 'Watch the mind, don\'t fight it. Be a witness. When you simply watch without judgment, thoughts dissolve like clouds in the sky. What remains is pure consciousness—your true nature.' }
      ]
    }
  ]

  // Reset when persona changes
  useEffect(() => {
    setCurrentMessageIndex(0)
    setDisplayedMessages([])
    setTypingText('')
    setShowTyping(false)
  }, [currentPersonaIndex])

  // Progressive message loading with typing animation
  useEffect(() => {
    const messages = chatPersonas[currentPersonaIndex].messages
    
    if (currentMessageIndex >= messages.length) {
      // All messages shown, wait then rotate to next persona
      const rotateTimer = setTimeout(() => {
        setCurrentPersonaIndex((prevIndex) => (prevIndex + 1) % chatPersonas.length)
      }, 2000)
      return () => clearTimeout(rotateTimer)
    }

    const currentMessage = messages[currentMessageIndex]
    
    if (currentMessage.type === 'user') {
      // User messages appear instantly
      setDisplayedMessages(prev => [...prev, currentMessage])
      const nextMessageTimer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1)
      }, 800)
      return () => clearTimeout(nextMessageTimer)
    } else {
      // AI messages type out
      let charIndex = 0
      setShowTyping(true)
      setTypingText('')
      
      const typingInterval = setInterval(() => {
        if (charIndex <= currentMessage.text.length) {
          setTypingText(currentMessage.text.slice(0, charIndex))
          charIndex++
        } else {
          setShowTyping(false)
          clearInterval(typingInterval)
          // Clear typing text immediately to avoid duplicate display
          setTypingText('')
          // Add completed message to displayed list
          setDisplayedMessages(prev => [...prev, currentMessage])
          // Move to next message after a brief pause
          setTimeout(() => {
            setCurrentMessageIndex(prev => prev + 1)
          }, 800)
        }
      }, 30)

      return () => clearInterval(typingInterval)
    }
  }, [currentPersonaIndex, currentMessageIndex])

  const handleStartChatting = async () => {
    if (user) {
      router.push('/personas')
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=/personas`
        }
      })
      if (error) {
        console.error('Sign in error:', error)
      }
    }
  }

  return (
    <>
      <Head>
        <title>AI-Spirit - Enter the world of AI Personas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Have meaningful conversations with AI personas of legendary figures. Get wisdom, guidance, and perspectives from history's greatest thinkers." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-black">
              <span className="italic">AI</span> - Spirit
            </h1>
            <nav className="flex items-center pr-3 md:pr-6">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="text-xl md:text-2xl font-bold text-black hover:text-gray-600 transition-colors"
              >
                Contact Us
              </button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-20 sm:pt-24 md:pt-32 lg:pt-40 pb-12 sm:pb-16 md:pb-20 lg:pb-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {/* Left Column - Content (Desktop) / Title Only (Mobile) */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-black mb-6 lg:mb-12 leading-tight lg:whitespace-nowrap">
                  Enter the world of AI Personas
                </h2>
                {/* Tagline - Hidden on mobile, visible on desktop */}
                <p className="hidden lg:block text-base sm:text-lg md:text-xl text-gray-600 mb-10 md:mb-16 lg:mb-20 max-w-xl leading-relaxed text-justify">
                  Chat with legendary thinkers like Einstein and Gandhi, or get personalized guidance from an Astro Guide, Fitness Coach, Life Coach, and more. All powered by AI.
                </p>
                {/* Button - Hidden on mobile, shown on desktop */}
                <button
                  onClick={handleStartChatting}
                  className="hidden lg:inline-block px-10 py-4 bg-black text-white text-lg font-semibold rounded-full hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                >
                  Start Chatting
                </button>
              </div>

              {/* Right Column - Chat Preview */}
              <div className="lg:col-span-1 flex justify-center lg:justify-end order-2 lg:order-none">
                <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100 transition-all duration-500 w-full max-w-md h-[400px] sm:h-[450px] md:h-[500px] flex flex-col">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 pb-4 sm:pb-5 md:pb-6 border-b border-gray-100 flex-shrink-0">
                    <img
                      src={chatPersonas[currentPersonaIndex].image}
                      alt={chatPersonas[currentPersonaIndex].name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-black text-base sm:text-lg">{chatPersonas[currentPersonaIndex].name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{chatPersonas[currentPersonaIndex].category}</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto">
                    {/* Show all completed messages */}
                    {displayedMessages.map((message, index) => (
                      <div key={`completed-${index}`}>
                        {message.type === 'user' ? (
                          /* User message */
                          <div className="flex justify-end">
                            <div className="bg-black text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-br-sm max-w-[85%]">
                              <p className="text-xs sm:text-sm">{message.text}</p>
                            </div>
                          </div>
                        ) : (
                          /* AI response */
                          <div className="flex gap-1.5 sm:gap-2">
                            <img
                              src={chatPersonas[currentPersonaIndex].image}
                              alt={chatPersonas[currentPersonaIndex].name}
                              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="bg-gray-100 text-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-bl-sm max-w-[85%]">
                              <p className="text-xs sm:text-sm">{message.text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Show currently typing message */}
                    {currentMessageIndex < chatPersonas[currentPersonaIndex].messages.length &&
                     chatPersonas[currentPersonaIndex].messages[currentMessageIndex].type === 'ai' &&
                     typingText && (
                      <div className="flex gap-1.5 sm:gap-2">
                        <img
                          src={chatPersonas[currentPersonaIndex].image}
                          alt={chatPersonas[currentPersonaIndex].name}
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="bg-gray-100 text-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-bl-sm max-w-[85%]">
                          <p className="text-xs sm:text-sm">{typingText}</p>
                          {showTyping && (
                            <span className="inline-block w-1 h-3 sm:h-4 bg-black ml-1 animate-pulse" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-only Start Chatting Button - Below Chat Preview */}
            <div className="lg:hidden flex justify-center mt-8">
              <button
                onClick={handleStartChatting}
                className="px-10 py-4 bg-black text-white text-lg font-semibold rounded-full hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
              >
                Start Chatting
              </button>
            </div>
          </div>
        </section>

        {/* Persona Showcase */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black text-center mb-8 sm:mb-12 md:mb-16">
              Featured Personas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {featuredPersonas.map((persona, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mb-2 sm:mb-3 md:mb-4 shadow-lg">
                    <img
                      src={persona.image}
                      alt={persona.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-semibold text-black text-sm sm:text-base md:text-lg">{persona.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black text-center mb-8 sm:mb-12 md:mb-16">
              Why AI-Spirit
            </h3>
            <div className="grid md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2 sm:mb-3">Authentic Conversations</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Talk naturally with legendary minds. Ask questions, seek advice, explore ideas.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2 sm:mb-3">Always Available</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Access wisdom anytime. No appointments, no waiting. Just start chatting.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2 sm:mb-3">Privacy First</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Your conversations are private. We respect your data and protect your privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black text-center mb-8 sm:mb-12 md:mb-16">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                  <span className="text-3xl sm:text-3xl md:text-4xl font-bold text-black">1</span>
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2 sm:mb-3">Choose a Persona</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Browse our collection of legendary minds and pick who you want to talk to.
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center -mt-12">
                <span className="text-4xl text-gray-300">→</span>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                  <span className="text-3xl sm:text-3xl md:text-4xl font-bold text-black">2</span>
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2 sm:mb-3">Start Chatting</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Ask questions, seek advice, or just have a conversation. It&apos;s that simple.
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center -mt-12">
                <span className="text-4xl text-gray-300">→</span>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                  <span className="text-3xl sm:text-3xl md:text-4xl font-bold text-black">3</span>
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2 sm:mb-3">Get Insights</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Receive wisdom and perspectives from history&apos;s greatest thinkers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-3 sm:mb-4">
              Ready to start?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
              Join thousands exploring AI personas
            </p>
            <button
              onClick={handleStartChatting}
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-black text-white text-base sm:text-lg font-semibold rounded-full hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
            >
              Start Chatting
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
              {/* Left - Branding */}
              <div>
                <h4 className="text-xl font-bold text-black mb-2"><span className="italic">AI</span> - Spirit</h4>
                <p className="text-sm text-gray-600">
                  Conversations with legendary minds
                </p>
              </div>

              {/* Center - Navigation (horizontal) */}
              <nav className="flex items-center gap-6">
                <button onClick={() => setIsContactModalOpen(true)} className="text-sm text-black hover:text-gray-600 transition-colors">
                  Contact Us
                </button>
                <button onClick={() => router.push('/privacy')} className="text-sm text-black hover:text-gray-600 transition-colors">
                  Privacy
                </button>
                <button onClick={() => router.push('/terms')} className="text-sm text-black hover:text-gray-600 transition-colors">
                  Terms
                </button>
              </nav>

              {/* Right - Copyright */}
              <div>
                <p className="text-sm text-gray-500">
                  © 2025 AI-Spirit. All rights reserved.
                </p>
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
    </>
  )
}
