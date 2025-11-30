import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import DOMPurify from 'isomorphic-dompurify'
import SidePanelNew from '@/components/layout/SidePanel'
import { useChat } from '@/context/ChatContext'
import { INITIAL_PERSONAS } from '@/data/personas'
import { withAuth } from '@/middleware/withAuth'
import { useAuth } from '@/context/AuthContext'

function ChatPage() {
  const router = useRouter()
  const { personaId, conversationId: urlConversationId } = router.query
  const { messages, setMessages, isLoading, setIsLoading, addMessage, clearMessages } = useChat()
  const { user, userProfile } = useAuth()
  const [persona, setPersona] = useState(null)
  const [currentInput, setCurrentInput] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const chatContainerRef = useRef(null)

  // Format message content with bold text
  const formatMessage = (content) => {
    // Replace **text** with <strong>text</strong>
    const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(formatted)
  }

  // Load persona
  useEffect(() => {
    const loadPersona = async () => {
      if (!personaId) return

      // Check hardcoded personas
      let found = INITIAL_PERSONAS.find(p => p.slug === personaId && !p.hidden)

      // Check localStorage
      if (!found) {
        const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
        found = customPersonas.find(p => p.slug === personaId)
      }

      // Check database
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
          console.error('Error loading persona:', error)
        }
      }

      if (found) {
        setPersona(found)

        // Track recent personas
        const recentPersonas = JSON.parse(localStorage.getItem('esperit_recent_personas') || '[]')
        const filtered = recentPersonas.filter(p => p.slug !== found.slug)
        const updated = [{
          name: found.name,
          slug: found.slug,
          category: found.category
        }, ...filtered].slice(0, 10)
        localStorage.setItem('esperit_recent_personas', JSON.stringify(updated))
      }
    }

    loadPersona()
  }, [personaId])

  // Load conversation
  useEffect(() => {
    if (!persona) return

    // If conversation ID is in URL, load that conversation
    if (urlConversationId) {
      const savedConv = localStorage.getItem(`esperit_conversation_${urlConversationId}`)
      if (savedConv) {
        try {
          const { messages: savedMessages } = JSON.parse(savedConv)
          setMessages(savedMessages || [])
          setConversationId(urlConversationId)
        } catch (error) {
          console.error('Error loading conversation:', error)
          clearMessages()
          setConversationId(null)
        }
      } else {
        // Conversation ID in URL but not found in localStorage
        clearMessages()
        setConversationId(null)
      }
    } else {
      // No conversation ID in URL - start fresh
      clearMessages()
      setConversationId(null)
    }
  }, [persona?.slug, urlConversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleBack = () => {
    router.push('/personas')
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!currentInput.trim() || isLoading || !persona) return

    const messageText = currentInput.trim()

    // Add user message
    const userMessage = { role: 'user', content: messageText }
    addMessage(userMessage)
    setCurrentInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona,
          personaId: persona.id || persona.slug,
          message: messageText,
          conversationHistory: [...messages, userMessage],
          conversationId: conversationId,
          isGuest: !user, // Not guest if user is authenticated
          userId: user?.id || null,
          userProfile: userProfile || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add AI response
      const aiMessage = { role: 'assistant', content: data.response }
      addMessage(aiMessage)

      // Save conversation to localStorage
      let convId = conversationId
      if (!convId) {
        // Create new conversation ID
        convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setConversationId(convId)
        // Update URL with conversation ID
        router.replace(`/chat/${personaId}?conversationId=${convId}`, undefined, { shallow: true })
      }

      const allMessages = [...messages, userMessage, aiMessage]

      // Save conversation
      localStorage.setItem(`esperit_conversation_${convId}`, JSON.stringify({
        id: convId,
        personaSlug: persona.slug,
        personaName: persona.name,
        messages: allMessages,
        updatedAt: new Date().toISOString()
      }))

      // Update conversations list
      const conversationsList = JSON.parse(localStorage.getItem('esperit_conversations') || '[]')
      const existingIndex = conversationsList.findIndex(c => c.id === convId)

      // Use first user message as title (truncated)
      const firstUserMessage = allMessages.find(m => m.role === 'user')
      const chatTitle = firstUserMessage
        ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : `Chat with ${persona.name}`

      const conversationMeta = {
        id: convId,
        personaSlug: persona.slug,
        personaName: persona.name,
        personaImage: persona.image,
        title: chatTitle,
        updatedAt: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        conversationsList[existingIndex] = conversationMeta
      } else {
        conversationsList.unshift(conversationMeta)
      }

      // Keep only last 50 conversations
      const trimmedList = conversationsList.slice(0, 50)
      localStorage.setItem('esperit_conversations', JSON.stringify(trimmedList))

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = { role: 'assistant', content: "Sorry, something went wrong. Please try again." }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!persona) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-black">Loading persona...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Chat with {persona.name} - AI-Spirit</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-white">
        {/* Side Panel */}
        <SidePanelNew onBack={handleBack} backButtonText="Back to Personas" />

        {/* Chat Area */}
        <div className="flex flex-col flex-1 h-screen md:ml-64">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
            <div className="flex items-center flex-1">
              <button
                onClick={handleBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 md:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <img
                src={persona.image_url || '/default-persona.png'}
                alt={persona.name}
                className="w-10 h-10 rounded-full mr-4 object-cover"
                onError={(e) => {
                  e.target.src = '/default-persona.png'
                }}
              />
              <h2 className="text-xl font-bold text-black">{persona.name}</h2>
            </div>

            {/* New Chat Button */}
            <button
              onClick={async () => {
                if (messages.length > 0) {
                  if (confirm('Start a new chat? Your current conversation will be saved.')) {
                    // Clear current conversation
                    clearMessages()
                    setConversationId(null)

                    // Remove conversationId from URL
                    router.replace(`/chat/${personaId}`, undefined, { shallow: true })
                  }
                } else {
                  // No messages, just reload
                  router.replace(`/chat/${personaId}`, undefined, { shallow: true })
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all hover:shadow-lg group"
              title="Start a new chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform group-hover:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden md:inline font-medium">New Chat</span>
            </button>
          </header>

          {/* Messages */}
          <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Suggested Questions - shown only when no messages */}
            {messages.length === 0 && !isLoading && persona.conversation_starters && (
              <div className="flex items-center justify-center h-full">
                <div className="max-w-2xl w-full space-y-3">
                  <p className="text-center text-gray-600 mb-6">Start a conversation with {persona.name}</p>
                  {persona.conversation_starters.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentInput(question)
                        document.querySelector('input[type="text"]')?.focus()
                      }}
                      className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-black"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src={persona.image_url || '/default-persona.png'}
                    alt={persona.name}
                    className="w-8 h-8 rounded-full object-cover object-top"
                    onError={(e) => {
                      e.target.src = '/default-persona.png'
                    }}
                  />
                )}
                <div
                  className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-black text-white rounded-br-none'
                    : 'bg-gray-100 text-black rounded-bl-none'
                    }`}
                >
                  <p
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-4">
                <img
                  src={persona.image_url || '/default-persona.png'}
                  alt={persona.name}
                  className="w-8 h-8 rounded-full object-cover object-top"
                  onError={(e) => {
                    e.target.src = '/default-persona.png'
                  }}
                />
                <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-gray-100 text-black rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Input Box */}
          <footer className="p-4 sticky bottom-0 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={`Message ${persona.name}...`}
                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-black"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-black text-white p-3 rounded-full disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
                disabled={isLoading || !currentInput.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>

            {/* Disclaimer */}
            <div className="text-center text-[10px] md:text-xs text-gray-500 mt-3 px-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 md:h-3.5 md:w-3.5 inline-block mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              These are AI generated responses and not from real person
            </div>

          </footer>
        </div>
      </div>
    </>
  )
}

export default withAuth(ChatPage)
