import { useRouter } from 'next/router'
import { useState, useEffect, useRef, useMemo } from 'react'
import Head from 'next/head'
import DOMPurify from 'isomorphic-dompurify'
import SidePanelNew from '@/components/layout/SidePanel'
import { useChat } from '@/context/ChatContext'
import { INITIAL_PERSONAS } from '@/data/personas'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { PersonaSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'
import {
  incrementGuestMessageCount,
  canSendMessage
} from '@/lib/guestMessageTracking'
import { speak, stopSpeaking } from '@/lib/textToSpeech'
import { withAuth } from '@/middleware/withAuth'

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
  const [speakingIndex, setSpeakingIndex] = useState(null)
  const chatContainerRef = useRef(null)

  // Index of the last user message — used to decide which user bubble shows the Edit button.
  // Memoize so the lookup runs once per messages change instead of O(n) per rendered bubble.
  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i
    }
    return -1
  }, [messages])

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

  // Handle speak button for assistant messages
  const handleSpeak = async (content, index) => {
    if (speakingIndex === index) {
      stopSpeaking()
      setSpeakingIndex(null)
      return
    }
    // Stop any currently playing audio
    stopSpeaking()
    setSpeakingIndex(index)
    try {
      // Strip HTML tags for clean TTS
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = formatMessage(content)
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      await speak(plainText, persona?.name, persona?.language || 'en', () => {
        setSpeakingIndex(null)
      })
    } catch (err) {
      console.error('Speech failed:', err)
      setSpeakingIndex(null)
    }
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
      const headers = await getAuthHeaders()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
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
        if (response.status === 401) {
          router.push(`/auth/signin?returnTo=/chat/${personaId}`)
          throw new Error(data.error || 'Session expired')
        }
        throw new Error(data.error || 'Failed to send message')
      }

      // Add new assistant response
      const assistantMessage = { role: 'assistant', content: data.response || "I'm having trouble responding right now. Please try again." }
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
      if (!error.message?.includes('Session expired') && !error.message?.includes('Sign in required')) {
        const errorMessage = { role: 'assistant', content: error.message || "Sorry, something went wrong. Please try again." }
        addMessage(errorMessage)
      }
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
    // setMessages/clearMessages come from ChatContext and aren't memoized;
    // `persona` reference changes each load. We only want this effect to fire on
    // persona slug or url conversation id changes — adding the others would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona?.slug, urlConversationId])

  // Lock body scroll so iOS Safari keyboard doesn't scroll the page out of bounds
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.overflow = 'hidden'
    body.style.height = '100%'
    return () => {
      html.style.overflow = prevHtmlOverflow
      html.style.height = ''
      body.style.overflow = prevBodyOverflow
      body.style.height = ''
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])


  const handleBack = () => {
    router.push('/personas')
  }

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!currentInput.trim() || isLoading || !persona) return

    const messageText = currentInput.trim()
    let addedAssistantMessagePlaceholder = false

    // Guest message tracking - check if guest can send message
    if (!user) {
      const sendCheck = canSendMessage()
      if (!sendCheck.canSend) {
        alert(sendCheck.message)
        return
      }
    }

    // Add user message
    const userMessage = { role: 'user', content: messageText }
    addMessage(userMessage)
    setCurrentInput('')
    setIsLoading(true)

    try {
      const headers = await getAuthHeaders()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          persona: persona,
          personaId: persona.id || persona.slug,
          message: messageText,
          conversationHistory: [...messages, userMessage],
          conversationId: conversationId,
          isGuest: !user,
          userId: user?.id || null,
          userProfile: userProfile || null,
          stream: true,
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
        addedAssistantMessagePlaceholder = true

        let streamError = null
        let serverConversationId = null
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          
          if (value) {
            buffer += decoder.decode(value, { stream: true })
          }

          const lines = buffer.split('\n')
          if (done) {
            buffer = ''
          } else {
            buffer = lines.pop() || ''
          }

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue
            if (!trimmedLine.startsWith('data: ')) continue
            let data
            try {
              data = JSON.parse(trimmedLine.slice(6))
            } catch (err) {
              console.warn('[SSE] Failed to parse line:', trimmedLine, err)
              continue // skip malformed SSE lines
            }

            if (data.error) {
              streamError = data.error
              break
            }

            if (data.done) {
              if (data.conversationId) serverConversationId = data.conversationId
            } else if (data.chunk) {
              streamedContent += data.chunk
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: streamedContent }
                return updated
              })
            }
          }
          if (streamError) break
          if (done) break
        }

        if (!streamedContent) {
          // Nothing arrived — replace the empty placeholder with an error
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: streamError || 'Sorry, something went wrong. Please try again.',
            }
            return updated
          })
          setIsLoading(false)
          return
        }

        if (streamError) {
          // Partial content arrived before error — keep it visible, just log
          console.warn('[SSE] Stream ended with error after partial content:', streamError)
        }

        const finalResponse = streamedContent

        // Resolve the conversation ID:
        // - auth users: use server-assigned UUID from done event (or existing state)
        // - guest users: generate a local ID
        let convId = conversationId || serverConversationId

        if (!convId) {
          convId = user ? null : `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        if (convId && convId !== conversationId) {
          setConversationId(convId)
          router.replace(`/chat/${personaId}?conversationId=${convId}`, undefined, { shallow: true })
        }

        const allMessages = [...messages, userMessage, { role: 'assistant', content: finalResponse }]

        // Save conversation metadata to localStorage so past-chats list stays current
        // (auth users: convId comes from server; guest users: local ID generated above)
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
          if (response.status === 401) {
            // Session expired — redirect to signin
            router.push(`/auth/signin?returnTo=/chat/${personaId}`)
            throw new Error(data.error || 'Session expired')
          }
          if (response.status === 403 && data.isLimitReached) {
            if (confirm('You have reached your daily message limit (100 messages). Upgrade to Premium for unlimited access?')) {
              router.push('/premium')
            }
            throw new Error(data.error)
          }
          throw new Error(data.error || 'Failed to send message')
        }

        const assistantMessage = { role: 'assistant', content: data.response || "I'm having trouble responding right now. Please try again." }
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
        // Premium prompts disabled - keeping code for future use
        // if (shouldShowPremiumPrompt()) {
        //   setShowPremiumPrompt(true)
        // }
        // Sign-in prompts are handled by time-based timer (every 30 seconds)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      // Don't add error message if we redirected to signin
      if (!error.message?.includes('Session expired') && !error.message?.includes('Sign in required')) {
        const errorText = error.message || "Sorry, something went wrong. Please try again."
        if (addedAssistantMessagePlaceholder) {
          setMessages(prev => {
            const updated = [...prev]
            if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
              updated[updated.length - 1] = { role: 'assistant', content: errorText }
            } else {
              updated.push({ role: 'assistant', content: errorText })
            }
            return updated
          })
        } else {
          addMessage({ role: 'assistant', content: errorText })
        }
      } else {
        if (addedAssistantMessagePlaceholder) {
          setMessages(prev => {
            const updated = [...prev]
            if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
              updated.pop()
            }
            return updated
          })
        }
      }
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
        {/* Primary Meta Tags */}
        <title>{`Chat with ${persona.name} - ${persona.category || 'AI'} Companion | AI Spirit`}</title>
        <meta name="description" content={persona.description ? `${persona.description}. Chat with ${persona.name} on AI Spirit - your 24/7 AI companion for engaging conversations.` : `Talk to ${persona.name} on AI Spirit. Get instant, judgment-free conversations 24/7 with this ${persona.category || 'AI'} persona.`} />
        <meta name="keywords" content={`chat with ${persona.name}, ${persona.name} AI, ${persona.category || 'AI'} AI chat, talk to ${persona.name}, AI Spirit, AI persona chat, ${persona.name?.toLowerCase()} chatbot`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
        <link rel="canonical" href={`https://ai-spirit.in/chat/${personaId}`} />

        {/* Open Graph / Social Media Preview Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Chat with ${persona.name} - ${persona.category || 'AI'} Companion | AI Spirit`} />
        <meta property="og:description" content={persona.description || `Talk to ${persona.name} on AI Spirit. Get instant guidance and support 24/7.`} />
        <meta property="og:url" content={`https://ai-spirit.in/chat/${personaId}`} />
        <meta property="og:site_name" content="AI - Spirit" />
        <meta property="og:image" content={`https://ai-spirit.in/api/og?title=${encodeURIComponent(`Chat with ${persona.name}`)}&description=${encodeURIComponent(persona.description || `Talk to ${persona.name} on AI Spirit`)}&persona=${encodeURIComponent(persona.name)}&avatar=${encodeURIComponent(persona.avatar_url || '')}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`Chat with ${persona.name} on AI Spirit`} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Chat with ${persona.name} - ${persona.category || 'AI'} Companion | AI Spirit`} />
        <meta name="twitter:description" content={persona.description || `Talk to ${persona.name} on AI Spirit. Get instant guidance and support 24/7.`} />
        <meta name="twitter:image" content={`https://ai-spirit.in/api/og?title=${encodeURIComponent(`Chat with ${persona.name}`)}&description=${encodeURIComponent(persona.description || `Talk to ${persona.name} on AI Spirit`)}&persona=${encodeURIComponent(persona.name)}&avatar=${encodeURIComponent(persona.avatar_url || '')}`} />
        <meta name="twitter:image:alt" content={`Chat with ${persona.name} on AI Spirit`} />
      </Head>

      {/* Structured Data for SEO */}
      <PersonaSchema persona={{
        name: persona.name,
        description: persona.description,
        image: persona.image_url ? `https://ai-spirit.in${persona.image_url}` : null,
        slug: persona.slug,
        category: persona.category
      }} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://ai-spirit.in/' },
        { name: persona.category || 'Personas', url: `https://ai-spirit.in/?category=${encodeURIComponent(persona.category || 'All')}` },
        { name: persona.name, url: `https://ai-spirit.in/chat/${persona.slug}` }
      ]} />

      <div className="fixed inset-0 flex bg-white overflow-hidden">
        {/* Side Panel */}
        <SidePanelNew onBack={handleBack} backButtonText="Back to Personas" hasNavbar={false} />

        {/* Chat Area */}
        <div className="flex flex-col flex-1 min-h-0 md:ml-64">
          {/* Header */}
          <header className="flex items-center justify-between px-5 h-[72px] flex-shrink-0 glass-nav z-10">
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
                className="w-9 h-9 rounded-full mr-3 object-cover border border-gray-100"
                onError={(e) => {
                  e.target.src = '/default-persona.png'
                }}
              />
              <div>
                <h2 className="text-base font-semibold text-black leading-tight">{persona.name}</h2>
                {persona.description && (
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{persona.description}</p>
                )}
              </div>
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
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl shadow-glass-dark hover:bg-gray-900 transition-all duration-200 group text-sm font-medium"
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

            {/* Share Button — flips conversation to public, then copies the public /share/<id> URL */}
            {messages.length > 0 && conversationId && user && (
              <button
                onClick={async () => {
                  try {
                    const headers = await getAuthHeaders()
                    const res = await fetch('/api/share/enable', {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({ conversationId }),
                    })
                    if (!res.ok) {
                      const { error } = await res.json().catch(() => ({}))
                      console.error('Failed to enable sharing:', error || res.status)
                      return
                    }
                    const shareUrl = `${window.location.origin}/share/${conversationId}`
                    await navigator.clipboard.writeText(shareUrl)
                    setShareLinkCopied(true)
                    setTimeout(() => setShareLinkCopied(false), 2000)
                  } catch (error) {
                    console.error('Failed to share:', error)
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${shareLinkCopied
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
          <main ref={chatContainerRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5 scrollbar-hide">
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
                      className="w-full p-4 text-left glass-matte hover:bg-white/85 transition-all duration-200 text-black text-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              msg.role === 'assistant' && !msg.content.trim() ? null : (
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
                        className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                          ? 'bg-black text-white rounded-br-sm shadow-glass-dark'
                          : 'glass-matte rounded-bl-sm text-black'
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
                        {msg.role === 'user' && index === lastUserMessageIndex && (
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

                        {/* Speak / Like / Dislike - Only for assistant messages */}
                        {msg.role === 'assistant' && (
                          <>
                            {/* Speaker Button */}
                            <button
                              onClick={() => handleSpeak(msg.content, index)}
                              className={`p-1.5 rounded-lg transition-colors group ${speakingIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                              title={speakingIndex === index ? 'Stop speaking' : 'Listen'}
                            >
                              {speakingIndex === index ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                  <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                              )}
                            </button>
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
                    <div className="w-8 h-8 rounded-full bg-black border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              )
            ))}

            {isLoading && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content.trim()) && (
              <div className="flex items-center gap-4">
                <img
                  src={persona.image_url || '/default-persona.png'}
                  alt={persona.name}
                  className="w-8 h-8 rounded-full object-cover object-top"
                  onError={(e) => {
                    e.target.src = '/default-persona.png'
                  }}
                />
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm glass-matte">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{persona.name} is thinking</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Input Box */}
          <footer className="px-5 py-4 flex-shrink-0 bg-white/75 backdrop-blur-2xl" style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 -4px 24px rgba(0, 0, 0, 0.04)' }}>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={`Message ${persona.name}...`}
                className="flex-1 px-5 py-3 glass-matte focus:outline-none focus:ring-2 focus:ring-black/10 text-black text-sm placeholder:text-gray-400 focus:bg-white/90 transition-all duration-200 disabled:opacity-50"
                disabled={isLoading}
              />

              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-xl transition-all duration-200 ${isListening
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
                className="bg-black text-white p-2.5 rounded-xl shadow-glass-dark hover:bg-gray-900 transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
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
