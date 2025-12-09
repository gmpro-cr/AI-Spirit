import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import DOMPurify from 'isomorphic-dompurify'
import SidePanelNew from '@/components/layout/SidePanel'
import { useChat } from '@/context/ChatContext'
import { INITIAL_PERSONAS } from '@/data/personas'
import { useAuth } from '@/context/AuthContext'
import {
  incrementGuestMessageCount,
  shouldShowTimeBasedPrompt,
  updateLastPromptTime,
  isSignInRequired,
  shouldShowPremiumPrompt,
  canSendMessage
} from '@/lib/guestMessageTracking'
import SignInPromptModal from '@/components/modals/SignInPromptModal'
import PremiumPromptModal from '@/components/modals/PremiumPromptModal'

function ChatPage() {
  const router = useRouter()
  const { personaId, conversationId: urlConversationId } = router.query
  const { messages, setMessages, isLoading, setIsLoading, addMessage, clearMessages } = useChat()
  const { user, userProfile } = useAuth()
  const [persona, setPersona] = useState(null)
  const [currentInput, setCurrentInput] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [editingMessageIndex, setEditingMessageIndex] = useState(null)
  const [editedMessageText, setEditedMessageText] = useState('')
  const [messageFeedback, setMessageFeedback] = useState({}) // Store like/dislike per message index
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)
  const chatContainerRef = useRef(null)

  // Format message content with bold text
  const formatMessage = (content) => {
    // Replace **text** with <strong>text</strong>
    const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(formatted)
  }

  // Copy message to clipboard
  const handleCopyMessage = async (content, index) => {
    try {
      // Strip HTML tags before copying
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = formatMessage(content)
      const plainText = tempDiv.textContent || tempDiv.innerText || ''

      await navigator.clipboard.writeText(plainText)
      setCopiedMessageIndex(index)
      setTimeout(() => setCopiedMessageIndex(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Handle like/dislike feedback
  const handleFeedback = (index, type) => {
    setMessageFeedback(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type // Toggle if same, set if different
    }))
  }

  // Start editing user message
  const handleStartEdit = (index, content) => {
    setEditingMessageIndex(index)
    setEditedMessageText(content)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessageIndex(null)
    setEditedMessageText('')
  }

  // Save edited message and regenerate response
  const handleSaveEdit = async (index) => {
    if (!editedMessageText.trim() || isLoading) return

    const newMessages = [...messages]
    newMessages[index].content = editedMessageText.trim()

    // Remove all messages after the edited one (including assistant response)
    const messagesToKeep = newMessages.slice(0, index + 1)
    setMessages(messagesToKeep)

    setEditingMessageIndex(null)
    setEditedMessageText('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona,
          personaId: persona.id || persona.slug,
          message: editedMessageText.trim(),
          conversationHistory: messagesToKeep,
          conversationId: conversationId,
          isGuest: !user,
          userId: user?.id || null,
          userProfile: userProfile || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add new assistant response
      const assistantMessage = { role: 'assistant', content: data.response }
      addMessage(assistantMessage)

      // Update localStorage
      const allMessages = [...messagesToKeep, assistantMessage]
      if (conversationId) {
        localStorage.setItem(`esperit_conversation_${conversationId}`, JSON.stringify({
          id: conversationId,
          personaSlug: persona.slug,
          personaName: persona.name,
          messages: allMessages,
          updatedAt: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Error regenerating response:', error)
      const errorMessage = { role: 'assistant', content: "Sorry, something went wrong. Please try again." }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setCurrentInput(prev => prev + (prev ? ' ' : '') + transcript)
        }

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [])

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
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

        // Track persona view
        try {
          fetch('/api/persona-views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personaSlug: found.slug })
          })
        } catch (error) {
          console.error('Error tracking view:', error)
        }

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

  // 30-second recurring sign-in prompt for guests
  useEffect(() => {
    if (user) return // Only for guests

    const checkInterval = setInterval(() => {
      if (shouldShowTimeBasedPrompt()) {
        setShowSignInPrompt(true)
        updateLastPromptTime()
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(checkInterval)
  }, [user])

  const handleBack = () => {
    router.push('/')
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!currentInput.trim() || isLoading || !persona) return

    const messageText = currentInput.trim()

    // Guest message tracking - check if guest can send message
    if (!user) {
      const sendCheck = canSendMessage()
      if (!sendCheck.canSend) {
        // Premium limit reached - hard block
        alert(sendCheck.message)
        setShowPremiumPrompt(true)
        return
      }
    }

    // Add user message
    const userMessage = { role: 'user', content: messageText }
    addMessage(userMessage)
    setCurrentInput('')
    setIsLoading(true)

    try {
      // Use streaming for better UX
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona,
          personaId: persona.id || persona.slug,
          message: messageText,
          conversationHistory: [...messages, userMessage],
          conversationId: conversationId,
          isGuest: !user,
          userId: user?.id || null,
          userProfile: userProfile || null,
          stream: false, // Disable streaming for now (Vercel timeout issues)
        }),
      })

      // Check if we got a streaming response
      if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let streamedContent = ''

        // Add empty assistant message that we'll update as chunks arrive
        const assistantMessage = { role: 'assistant', content: '' }
        addMessage(assistantMessage)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.error) {
                  throw new Error(data.error)
                }

                if (!data.done && data.chunk) {
                  streamedContent += data.chunk
                  // Update the last message with accumulated content
                  setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { role: 'assistant', content: streamedContent }
                    return updated
                  })
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError)
              }
            }
          }
        }

        const finalResponse = streamedContent

        // For authenticated users, conversation is saved on server
        // For guest users, generate locally and save to localStorage
        let convId = conversationId

        if (!convId) {
          // Generate new conversation ID locally
          convId = user ? null : `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          if (convId) {
            setConversationId(convId)
            router.replace(`/chat/${personaId}?conversationId=${convId}`, undefined, { shallow: true })
          }
        }

        const allMessages = [...messages, userMessage, { role: 'assistant', content: finalResponse }]

        // Save conversation to localStorage for guest users
        if (convId) {
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

          const chatTitle = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '')

          const conversationMeta = {
            id: convId,
            personaSlug: persona.slug,
            personaName: persona.name,
            personaImage: persona.image_url,
            title: chatTitle,
            updatedAt: new Date().toISOString()
          }

          if (existingIndex >= 0) {
            conversationsList[existingIndex] = conversationMeta
          } else {
            conversationsList.unshift(conversationMeta)
          }

          const trimmedList = conversationsList.slice(0, 50)
          localStorage.setItem('esperit_conversations', JSON.stringify(trimmedList))
        }
      } else {
        // Fallback to non-streaming (shouldn't happen normally)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 403 && data.isLimitReached) {
            if (confirm('You have reached your daily message limit (20 messages). Upgrade to Premium for unlimited access?')) {
              router.push('/premium')
            }
            throw new Error(data.error)
          }
          throw new Error(data.error || 'Failed to send message')
        }

        const assistantMessage = { role: 'assistant', content: data.response }
        addMessage(assistantMessage)

        let convId = conversationId

        if (user && data.conversationId) {
          convId = data.conversationId
          if (!conversationId) {
            setConversationId(convId)
            router.replace(`/chat/${personaId}?conversationId=${convId}`, undefined, { shallow: true })
          }
        } else if (!convId) {
          convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          setConversationId(convId)
          router.replace(`/chat/${personaId}?conversationId=${convId}`, undefined, { shallow: true })
        }

        const allMessages = [...messages, userMessage, assistantMessage]

        localStorage.setItem(`esperit_conversation_${convId}`, JSON.stringify({
          id: convId,
          personaSlug: persona.slug,
          personaName: persona.name,
          messages: allMessages,
          updatedAt: new Date().toISOString()
        }))

        const conversationsList = JSON.parse(localStorage.getItem('esperit_conversations') || '[]')
        const existingIndex = conversationsList.findIndex(c => c.id === convId)

        const chatTitle = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '')

        const conversationMeta = {
          id: convId,
          personaSlug: persona.slug,
          personaName: persona.name,
          personaImage: persona.image_url,
          title: chatTitle,
          updatedAt: new Date().toISOString()
        }

        if (existingIndex >= 0) {
          conversationsList[existingIndex] = conversationMeta
        } else {
          conversationsList.unshift(conversationMeta)
        }

        const trimmedList = conversationsList.slice(0, 50)
        localStorage.setItem('esperit_conversations', JSON.stringify(trimmedList))
      }

      // Guest message tracking - increment counter after successful send
      if (!user) {
        incrementGuestMessageCount()

        // Check if we should show premium prompt (50 messages)
        if (shouldShowPremiumPrompt()) {
          setShowPremiumPrompt(true)
        }
        // Sign-in prompts are handled by time-based timer (every 30 seconds)
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
        <title>Chat with {persona.name} - AI - Spirit</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-white">
        {/* Side Panel */}
        <SidePanelNew onBack={handleBack} backButtonText="Back to Personas" hasNavbar={false} />

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

            {/* Share Button */}
            {messages.length > 0 && conversationId && (
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/chat/${personaId}?conversationId=${conversationId}`
                  try {
                    await navigator.clipboard.writeText(shareUrl)
                    setShareLinkCopied(true)
                    setTimeout(() => setShareLinkCopied(false), 2000)
                  } catch (error) {
                    console.error('Failed to copy:', error)
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:shadow-lg ${shareLinkCopied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                title="Share conversation"
              >
                {shareLinkCopied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                )}
                <span className="hidden md:inline font-medium">
                  {shareLinkCopied ? 'Copied!' : 'Share'}
                </span>
              </button>
            )}
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
              <div key={index} className="space-y-2">
                <div
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <img
                      src={persona.image_url || '/default-persona.png'}
                      alt={persona.name}
                      className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/default-persona.png'
                      }}
                    />
                  )}

                  <div className="flex flex-col gap-2">
                    {/* Message Bubble */}
                    {editingMessageIndex === index && msg.role === 'user' ? (
                      // Edit mode for user message
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editedMessageText}
                          onChange={(e) => setEditedMessageText(e.target.value)}
                          className="p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black text-black resize-none min-h-[60px]"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(index)}
                            disabled={!editedMessageText.trim() || isLoading}
                            className="px-3 py-1 text-sm bg-black text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save & Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Normal display
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
                    )}

                    {/* Action Buttons */}
                    {editingMessageIndex !== index && (
                      <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyMessage(msg.content, index)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Copy message"
                        >
                          {copiedMessageIndex === index ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>

                        {/* Edit Button - Only for last user message */}
                        {msg.role === 'user' && index === messages.map((m, i) => m.role === 'user' ? i : -1).filter(i => i !== -1).pop() && (
                          <button
                            onClick={() => handleStartEdit(index, msg.content)}
                            disabled={isLoading}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {/* Like/Dislike - Only for assistant messages */}
                        {msg.role === 'assistant' && (
                          <>
                            <button
                              onClick={() => handleFeedback(index, 'like')}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                              title="Like response"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${messageFeedback[index] === 'like' ? 'text-green-600 fill-current' : 'text-gray-500 group-hover:text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleFeedback(index, 'dislike')}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                              title="Dislike response"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${messageFeedback[index] === 'dislike' ? 'text-red-600 fill-current' : 'text-gray-500 group-hover:text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold flex-shrink-0">
                      U
                    </div>
                  )}
                </div>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{persona.name} is thinking</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
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

              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-full transition-colors ${isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                disabled={isLoading}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>

              {/* Send Button */}
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

      {/* Guest Message Limit Modals */}
      <SignInPromptModal
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
      />
      <PremiumPromptModal
        isOpen={showPremiumPrompt}
        onClose={() => setShowPremiumPrompt(false)}
      />
    </>
  )
}

export default ChatPage
