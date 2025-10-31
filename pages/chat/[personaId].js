import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import ChatInterface from '@/components/chat/ChatInterface'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { INITIAL_PERSONAS } from '@/data/personas'

export default function ChatPage() {
  const router = useRouter()
  const { personaId } = router.query
  const { user } = useAuth()
  const { messages, setMessages, setIsLoading, addMessage } = useChat()
  const [persona, setPersona] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [guestMessageCount, setGuestMessageCount] = useState(0)

  useEffect(() => {
    if (personaId) {
      // Find persona from local data
      const found = INITIAL_PERSONAS.find(p => p.slug === personaId)
      if (found) {
        setPersona(found)
      }
    }
  }, [personaId])

  useEffect(() => {
    // Load guest messages from localStorage
    if (!user && persona) {
      const guestData = localStorage.getItem(`esperit_guest_${persona.slug}`)
      if (guestData) {
        const { messages: savedMessages, count } = JSON.parse(guestData)
        setMessages(savedMessages || [])
        setGuestMessageCount(count || 0)
      }
    }
  }, [persona, user])

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
          personaId: persona.id || persona.slug,
          message: messageText,
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
        <Navbar />
        <div className="min-h-screen bg-black-primary flex items-center justify-center">
          <p className="text-text-secondary">Loading persona...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Chat with {persona.name} - Esperit.AI</title>
      </Head>

      <Navbar />

      {/* Guest mode banner */}
      {!user && (
        <div className="fixed top-16 left-0 right-0 bg-neon-purple/20 border-b border-neon-purple/50 py-2 px-4 text-center z-40">
          <p className="text-sm">
            Guest Mode - {10 - guestMessageCount} messages left |{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="underline hover:text-neon-cyan"
            >
              Sign up to continue
            </button>
          </p>
        </div>
      )}

      <div className={user ? 'pt-16' : 'pt-24'}>
        <ChatInterface persona={persona} onSendMessage={handleSendMessage} />
      </div>
    </>
  )
}
