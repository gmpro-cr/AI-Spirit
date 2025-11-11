import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import ParticlesBackground from '@/components/layout/ParticlesBackground'
import SidePanel from '@/components/layout/SidePanel'
import ChatInterface from '@/components/chat/ChatInterface'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { INITIAL_PERSONAS } from '@/data/personas'

export default function ChatPage() {
  const router = useRouter()
  const { personaId } = router.query
  const { user, loading } = useAuth()
  const { messages, setMessages, setIsLoading, addMessage, clearMessages } = useChat()
  const [persona, setPersona] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [guestMessageCount, setGuestMessageCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Require authentication for chat pages (shared links)
  useEffect(() => {
    if (!loading && !user && personaId) {
      router.push(`/auth/signin?returnTo=/chat/${personaId}`)
    }
  }, [user, loading, personaId, router])

  // Prevent body scroll on chat page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }
  }, [])

  useEffect(() => {
    const loadPersona = async () => {
      if (!personaId) return

      // 1. Check INITIAL_PERSONAS (hardcoded personas) - exclude hidden ones
      let found = INITIAL_PERSONAS.find(p => p.slug === personaId && !p.hidden)

      // 2. Check localStorage for guest custom personas
      if (!found) {
        const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
        found = customPersonas.find(p => p.slug === personaId)
      }

      // 3. Check database for ALL custom personas (accessible to everyone)
      if (!found) {
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data, error } = await supabase
            .from('personas')
            .select('*')
            .eq('slug', personaId)
            .single()

          if (!error && data) {
            found = data
          }
        } catch (error) {
          console.error('Error loading persona from database:', error)
        }
      }

      if (found) {
        setPersona(found)

        // Track recent personas
        const recentPersonas = JSON.parse(localStorage.getItem('esperit_recent_personas') || '[]')

        // Remove if already exists (to move to front)
        const filtered = recentPersonas.filter(p => p.slug !== found.slug)

        // Add to beginning of array
        const updated = [{
          name: found.name,
          slug: found.slug,
          category: found.category
        }, ...filtered].slice(0, 10) // Keep only last 10

        localStorage.setItem('esperit_recent_personas', JSON.stringify(updated))
      }
    }

    loadPersona()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaId, user])

  useEffect(() => {
    // Clear messages when persona changes
    if (persona) {
      clearMessages()
      setGuestMessageCount(0)

      // Load guest messages from localStorage
      if (!user) {
        const guestData = localStorage.getItem(`esperit_guest_${persona.slug}`)
        if (guestData) {
          try {
            const { messages: savedMessages, count } = JSON.parse(guestData)
            setMessages(savedMessages || [])
            setGuestMessageCount(count || 0)
          } catch (error) {
            console.error('Error loading guest data:', error)
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona?.slug, user])

  const handleNewChat = () => {
    // Clear messages from context
    clearMessages()
    setGuestMessageCount(0)

    // Clear messages from localStorage for guests
    if (!user && persona) {
      localStorage.removeItem(`esperit_guest_${persona.slug}`)
    }

    // For authenticated users, clear conversation ID
    if (user) {
      setConversationId(null)
    }
  }

  const handleSendMessage = async (messageText) => {
    if (!persona) return

    // Guest mode limit check
    if (!user && guestMessageCount >= 10) {
      alert('Guest limit reached! Sign up to continue chatting.')
      router.push('/auth/signin')
      return
    }

    // Add user message optimistically
    const userMessage = { role: 'user', content: messageText }
    addMessage(userMessage)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona, // Send full persona object
          personaId: persona.id || persona.slug, // Keep for backward compatibility
          message: messageText,
          conversationHistory: messages, // Send conversation history for context
          conversationId: conversationId,
          isGuest: !user,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add AI response
      const aiMessage = { role: 'assistant', content: data.response }
      addMessage(aiMessage)

      // Update guest mode tracking
      if (!user) {
        const newCount = guestMessageCount + 1
        setGuestMessageCount(newCount)
        localStorage.setItem(
          `esperit_guest_${persona.slug}`,
          JSON.stringify({
            messages: [...messages, userMessage, aiMessage],
            count: newCount,
          })
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.message || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  if (!persona) {
    return (
      <>
        <ParticlesBackground />
        <SidePanel
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="relative min-h-screen bg-black-primary flex items-center justify-center lg:pl-72 z-10">
          <p className="text-text-secondary text-sm sm:text-base">Loading persona...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Chat with {persona.name} - AI-Spirit</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <ParticlesBackground />
      <SidePanel
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="relative z-10 lg:pl-72">
        <ChatInterface
          persona={persona}
          onSendMessage={handleSendMessage}
          onNewChat={handleNewChat}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>
    </>
  )
}
