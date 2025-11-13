import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import SidePanelNew from '@/components/layout/SidePanel'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { INITIAL_PERSONAS } from '@/data/personas'

export default function ChatPage() {
  const router = useRouter()
  const { personaId } = router.query
  const { user, loading } = useAuth()
  const { messages, setMessages, isLoading, setIsLoading, addMessage, clearMessages } = useChat()
  const [persona, setPersona] = useState(null)
  const [currentInput, setCurrentInput] = useState('')
  const [guestMessageCount, setGuestMessageCount] = useState(0)
  const [conversationId, setConversationId] = useState(null)
  const chatContainerRef = useRef(null)

  // Require authentication
  useEffect(() => {
    if (!loading && !user && personaId) {
      router.push(`/auth/signin?returnTo=/chat/${personaId}`)
    }
  }, [user, loading, personaId, router])

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
  }, [personaId, user])

  // Load or create conversation and messages
  useEffect(() => {
    const loadConversation = async () => {
      if (!persona) return

      clearMessages()
      setGuestMessageCount(0)
      setConversationId(null)

      if (user) {
        // Authenticated user - load from database
        try {
          const { supabase } = await import('@/lib/supabase')
          const { data: session } = await supabase.auth.getSession()

          if (!session?.session) return

          // Find or create conversation
          const { data: existingConv, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('session_id', session.session.user.id)
            .eq('persona_type', persona.slug)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          let convId = existingConv?.id

          if (!existingConv) {
            // Create new conversation
            const { data: newConv, error: createError } = await supabase
              .from('conversations')
              .insert({
                session_id: session.session.user.id,
                persona_type: persona.slug,
                persona_id: persona.id || null,
                title: `Chat with ${persona.name}`,
                is_active: true,
                is_guest_session: false
              })
              .select()
              .single()

            if (!createError && newConv) {
              convId = newConv.id
            }
          }

          if (convId) {
            setConversationId(convId)

            // Load messages
            const { data: msgs, error: msgsError } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', convId)
              .eq('is_deleted', false)
              .order('created_at', { ascending: true })

            if (!msgsError && msgs) {
              setMessages(msgs.map(m => ({
                role: m.role,
                content: m.content
              })))
            }
          }
        } catch (error) {
          console.error('Error loading conversation:', error)
        }
      } else {
        // Guest user - load from localStorage
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

    loadConversation()
  }, [persona?.slug, user])

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

    // Guest limit check
    if (!user && guestMessageCount >= 10) {
      alert('Guest limit reached! Sign up to continue chatting.')
      router.push('/auth/signin')
      return
    }

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
          conversationHistory: messages,
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

      // Save to database or localStorage
      if (user && conversationId) {
        // Authenticated user - save to database
        try {
          const { supabase } = await import('@/lib/supabase')

          // Save both messages
          await supabase.from('messages').insert([
            {
              conversation_id: conversationId,
              role: 'user',
              content: messageText
            },
            {
              conversation_id: conversationId,
              role: 'assistant',
              content: data.response
            }
          ])

          // Update conversation
          await supabase
            .from('conversations')
            .update({
              updated_at: new Date().toISOString(),
              message_count: messages.length + 2
            })
            .eq('id', conversationId)
        } catch (error) {
          console.error('Error saving to database:', error)
        }
      } else if (!user) {
        // Guest user - save to localStorage
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
          <header className="flex items-center p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
                className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src={persona.image_url || '/default-persona.png'}
                    alt={persona.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-persona.png'
                    }}
                  />
                )}
                <div
                  className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-black text-white rounded-br-none'
                      : 'bg-gray-100 text-black rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-4">
                <img
                  src={persona.image_url || '/default-persona.png'}
                  alt={persona.name}
                  className="w-8 h-8 rounded-full object-cover"
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

            {/* Guest message counter */}
            {!user && (
              <div className="text-center text-xs text-black mt-2">
                Guest mode: {guestMessageCount}/10 messages used
              </div>
            )}
          </footer>
        </div>
      </div>
    </>
  )
}
