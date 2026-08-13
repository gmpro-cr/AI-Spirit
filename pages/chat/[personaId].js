import { useRouter } from 'next/router'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Head from 'next/head'
import SidePanelNew from '@/components/layout/SidePanel'
import MessageContent from '@/components/chat/MessageContent'
import { toPlainText } from '@/lib/plainText'
import { relativeTime, absoluteTime } from '@/lib/relativeTime'
import { saveConversation, loadConversation } from '@/lib/conversationStore'
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const chatContainerRef = useRef(null)
  const composerRef = useRef(null)
  // Lets the send button double as a stop control mid-stream.
  const abortControllerRef = useRef(null)
  // While the user is reading further up, new tokens must not yank them down.
  const isPinnedToBottomRef = useRef(true)

  // Auto-grow the composer with its content, up to the max-h-40 cap set in the class.
  useEffect(() => {
    const el = composerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [currentInput])

  // Enter sends, Shift+Enter inserts a newline (standard chat behaviour).
  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (!isLoading && currentInput.trim()) handleSendMessage(e)
    }
  }

  const focusComposer = () => composerRef.current?.focus()

  // Index of the last user message — used to decide which user bubble shows the Edit button.
  // Memoize so the lookup runs once per messages change instead of O(n) per rendered bubble.
  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i
    }
    return -1
  }, [messages])

  // Only the newest reply offers Regenerate — retrying an earlier one would
  // orphan every turn that came after it.
  const lastAssistantMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i
    }
    return -1
  }, [messages])

  // Copy message to clipboard — markdown syntax stripped, not the text inside it
  const handleCopyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(toPlainText(content))
      setCopiedMessageIndex(index)
      setTimeout(() => setCopiedMessageIndex(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Like/dislike. Optimistic locally, then persisted — this is the only
  // response-quality signal the product collects, so it should outlive the tab.
  const handleFeedback = async (index, type) => {
    const next = messageFeedback[index] === type ? null : type
    setMessageFeedback(prev => ({ ...prev, [index]: next }))

    if (!user || !conversationId) return

    try {
      const headers = await getAuthHeaders()
      await fetch('/api/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId,
          messageIndex: index,
          personaSlug: persona?.slug,
          rating: next,
        }),
      })
    } catch (error) {
      // Feedback is a side signal — never interrupt the conversation for it.
      console.error('Failed to record feedback:', error)
    }
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
      // Read the words, not the markdown
      const plainText = toPlainText(content)
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

    // Replace the edited message rather than mutating it in place, and drop
    // everything after it — the reply it produced no longer applies.
    const messagesToKeep = messages
      .slice(0, index + 1)
      .map((m, i) => (i === index ? { ...m, content: editedMessageText.trim() } : m))
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
      const assistantMessage = {
        role: 'assistant',
        content: data.response || "I'm having trouble responding right now. Please try again.",
        createdAt: new Date().toISOString(),
      }
      addMessage(assistantMessage)

      const allMessages = [...messagesToKeep, assistantMessage]
      if (conversationId) {
        saveConversation({ id: conversationId, persona, messages: allMessages })
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
      const savedConv = loadConversation(urlConversationId)
      if (savedConv) {
        setMessages(savedConv.messages || [])
        setConversationId(urlConversationId)
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

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const el = chatContainerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    isPinnedToBottomRef.current = true
    setShowScrollToBottom(false)
  }, [])

  // Track whether the reader is at the bottom. Anything above that threshold
  // means they scrolled up deliberately and streaming must not drag them back.
  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return

    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      const pinned = distanceFromBottom < 80
      isPinnedToBottomRef.current = pinned
      setShowScrollToBottom(!pinned && el.scrollHeight > el.clientHeight + 240)
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [persona?.slug])

  // Follow new content only while pinned to the bottom
  useEffect(() => {
    if (!isPinnedToBottomRef.current) return
    const el = chatContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
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

  // Abort an in-flight reply. Whatever streamed in so far stays on screen —
  // stopping is an edit, not an undo.
  const handleStopGeneration = () => {
    abortControllerRef.current?.abort()
  }

  /**
   * Send a turn to the model.
   *
   * `options.retryOf` re-runs an existing user message instead of taking the
   * composer's contents: the trailing assistant reply has already been dropped
   * by the caller, so the request is identical to the original send.
   */
  const handleSendMessage = async (e, options = {}) => {
    e?.preventDefault?.()

    const { retryOf } = options
    const isRetry = typeof retryOf === 'string'
    const messageText = isRetry ? retryOf : currentInput.trim()

    if (!messageText || isLoading || !persona) return

    let addedAssistantMessagePlaceholder = false
    // Hoisted so the abort handler can persist whatever arrived before the stop.
    let streamedContent = ''
    let assistantStartedAt = null

    // Guest message tracking - check if guest can send message
    if (!user) {
      const sendCheck = canSendMessage()
      if (!sendCheck.canSend) {
        alert(sendCheck.message)
        return
      }
    }

    // On a retry the user message is already in the thread. The caller passes
    // the trimmed history explicitly, because its setMessages has not flushed
    // by the time we read state here.
    const userMessage = { role: 'user', content: messageText, createdAt: new Date().toISOString() }
    const historyBase = options.history || (isRetry ? messages : [...messages, userMessage])

    if (!isRetry) {
      addMessage(userMessage)
      setCurrentInput('')
    }
    // A new turn always means the reader wants to see the answer.
    isPinnedToBottomRef.current = true
    setIsLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const headers = await getAuthHeaders()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          persona: persona,
          personaId: persona.id || persona.slug,
          message: messageText,
          conversationHistory: historyBase,
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

        // Add empty assistant message that we'll update as chunks arrive
        assistantStartedAt = new Date().toISOString()
        const assistantMessage = { role: 'assistant', content: '', createdAt: assistantStartedAt }
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
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: streamedContent,
                  createdAt: assistantStartedAt,
                }
                return updated
              })
            }
          }
          if (streamError) break
          if (done) break
        }

        if (!streamedContent) {
          // Nothing arrived. If the user hit stop before the first token there
          // is nothing to report — just drop the empty placeholder.
          setMessages(prev => {
            const updated = [...prev]
            if (controller.signal.aborted) {
              updated.pop()
              return updated
            }
            updated[updated.length - 1] = {
              role: 'assistant',
              content: streamError || 'Sorry, something went wrong. Please try again.',
              createdAt: assistantStartedAt,
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

        const allMessages = [
          ...historyBase,
          { role: 'assistant', content: finalResponse, createdAt: assistantStartedAt },
        ]

        // Persist + notify the past-chats readers (auth users: convId comes
        // from the server; guests: local ID generated above)
        if (convId) {
          saveConversation({
            id: convId,
            persona,
            messages: allMessages,
            firstUserMessage: historyBase.find((m) => m.role === 'user')?.content || messageText,
          })
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

        const assistantMessage = {
          role: 'assistant',
          content: data.response || "I'm having trouble responding right now. Please try again.",
          createdAt: new Date().toISOString(),
        }
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

        const allMessages = [...historyBase, assistantMessage]

        saveConversation({
          id: convId,
          persona,
          messages: allMessages,
          firstUserMessage: historyBase.find((m) => m.role === 'user')?.content || messageText,
        })
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
      // A user-initiated stop is not a failure. Keep whatever streamed in, and
      // discard the placeholder only if nothing did.
      if (error?.name === 'AbortError' || controller.signal.aborted) {
        const partial = streamedContent.trim()

        if (addedAssistantMessagePlaceholder && !partial) {
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.role === 'assistant' && !last.content?.trim()) updated.pop()
            return updated
          })
        }

        // Persist the stopped turn, or the on-screen thread and storage drift
        // apart and a reload silently drops the user's own message too. Only
        // possible once a conversation exists — an abort on the very first
        // message has no id to write under (the server never sent one), and
        // inventing one would desync the server-side conversation.
        if (conversationId) {
          saveConversation({
            id: conversationId,
            persona,
            messages: partial
              ? [...historyBase, { role: 'assistant', content: partial, createdAt: assistantStartedAt }]
              : historyBase,
            firstUserMessage: historyBase.find((m) => m.role === 'user')?.content || messageText,
          })
        }
        return
      }

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
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }

  /**
   * Ask the persona for a different answer: drop the trailing assistant turn
   * and replay the user message that produced it.
   */
  const handleRegenerate = () => {
    if (isLoading || !persona) return

    const lastUser = messages[lastUserMessageIndex]
    if (!lastUser) return

    // Everything after that user message is what we are replacing.
    const trimmed = messages.slice(0, lastUserMessageIndex + 1)
    setMessages(trimmed)
    handleSendMessage(null, { retryOf: lastUser.content, history: trimmed })
  }

  // Esc backs out of whatever is in progress — editing first, then generation.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return
      if (editingMessageIndex !== null) {
        handleCancelEdit()
      } else if (isLoading) {
        handleStopGeneration()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingMessageIndex, isLoading])

  // Never leave a request running behind a navigation.
  useEffect(() => () => abortControllerRef.current?.abort(), [])

  if (!persona) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0B0B0C]">
        <p className="text-black dark:text-white">Loading persona...</p>
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

      <div className="fixed inset-0 flex bg-white dark:bg-[#0B0B0C] overflow-hidden">
        {/* Side Panel */}
        <SidePanelNew onBack={handleBack} backButtonText="Back to Personas" hasNavbar={false} />

        {/* Chat Area — relative so the scroll-to-bottom control can float over it */}
        <div className="app-shell-offset relative flex flex-col flex-1 min-h-0">
          {/* Header */}
          <header className="flex items-center justify-between px-5 h-[72px] flex-shrink-0 glass-nav z-10">
            <div className="flex items-center flex-1">
              <button
                onClick={handleBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.08] md:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-black dark:text-white"
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
                className="w-9 h-9 rounded-full mr-3 object-cover border border-gray-100 dark:border-white/[0.08]"
                onError={(e) => {
                  e.target.src = '/default-persona.png'
                }}
              />
              <div>
                <h2 className="text-base font-semibold text-black dark:text-white leading-tight">{persona.name}</h2>
                {persona.description && (
                  <p className="text-xs text-gray-400 dark:text-white/40 truncate max-w-[200px]">{persona.description}</p>
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
              className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl shadow-glass-dark hover:bg-gray-900 dark:hover:bg-white/90 transition-all duration-200 group text-sm font-medium"
              aria-label="Start a new chat"
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
                  : 'bg-gray-100 dark:bg-white/[0.08] text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/[0.14]'
                  }`}
                aria-label="Copy share link for this conversation"
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

          {/* Messages — held to a reading column so the eye is not thrown
              across the full width of a desktop display */}
          <main ref={chatContainerRef} className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="mx-auto w-full max-w-3xl px-5 py-6 space-y-5">
              {/* Suggested Questions - shown only when no messages */}
              {messages.length === 0 && !isLoading && persona.conversation_starters && (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-full space-y-3">
                    <p className="text-center text-gray-600 dark:text-white/60 mb-6">Start a conversation with {persona.name}</p>
                    {persona.conversation_starters.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentInput(question)
                          focusComposer()
                        }}
                        className="group flex w-full items-center gap-3 p-4 text-left glass-matte hover:bg-white/85 dark:hover:bg-[#0B0B0C]/85 transition-all duration-200 text-black dark:text-white text-sm"
                      >
                        <svg className="h-4 w-4 flex-shrink-0 text-black/30 dark:text-white/30 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
                        </svg>
                        <span className="flex-1">{question}</span>
                        <svg className="h-4 w-4 flex-shrink-0 text-black/20 dark:text-white/20 group-hover:text-black/50 dark:group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => {
                if (msg.role === 'assistant' && !msg.content.trim()) return null

                const isUser = msg.role === 'user'
                const isEditing = editingMessageIndex === index
                const canRetry = !isUser && index === lastAssistantMessageIndex && !isLoading
                const stamp = msg.createdAt ? relativeTime(msg.createdAt) : ''

                return (
                  <div key={index} className="space-y-2">
                    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
                      {!isUser && (
                        <img
                          src={persona.image_url || '/default-persona.png'}
                          alt={persona.name}
                          className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0"
                          onError={(e) => {
                            e.target.src = '/default-persona.png'
                          }}
                        />
                      )}

                      <div className={`flex min-w-0 flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                        {isEditing && isUser ? (
                          // Edit mode for user message
                          <div className="flex w-full flex-col gap-2">
                            <textarea
                              value={editedMessageText}
                              onChange={(e) => setEditedMessageText(e.target.value)}
                              className="min-w-[16rem] p-3 border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black text-black dark:text-white resize-none min-h-[60px] text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-sm bg-gray-200 dark:bg-white/[0.14] hover:bg-gray-300 dark:hover:bg-white/20 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(index)}
                                disabled={!editedMessageText.trim() || isLoading}
                                className="px-3 py-1 text-sm bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save &amp; Regenerate
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                              ? 'max-w-[85%] bg-black text-white dark:bg-white/[0.14] dark:text-white rounded-br-sm shadow-glass-dark'
                              : 'max-w-full glass-matte rounded-bl-sm text-black dark:text-white'
                              }`}
                          >
                            <MessageContent content={msg.content} tone={isUser ? 'dark' : 'light'} />
                          </div>
                        )}

                        {/* Action Buttons */}
                        {!isEditing && (
                          <div className={`flex items-center gap-1 ${isUser ? 'justify-end' : ''}`}>
                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyMessage(msg.content, index)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg transition-colors group"
                              aria-label={copiedMessageIndex === index ? 'Copied' : 'Copy message'}
                            >
                              {copiedMessageIndex === index ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-white/50 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>

                            {/* Edit Button - Only for last user message */}
                            {isUser && index === lastUserMessageIndex && (
                              <button
                                onClick={() => handleStartEdit(index, msg.content)}
                                disabled={isLoading}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Edit message"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-white/50 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}

                            {/* Speak / Like / Dislike / Retry - assistant only */}
                            {!isUser && (
                              <>
                                <button
                                  onClick={() => handleSpeak(msg.content, index)}
                                  className={`p-1.5 rounded-lg transition-colors group ${speakingIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100 dark:hover:bg-white/[0.08]'}`}
                                  aria-label={speakingIndex === index ? 'Stop reading aloud' : 'Read aloud'}
                                >
                                  {speakingIndex === index ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                      <rect x="6" y="6" width="12" height="12" rx="2" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-white/50 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                  )}
                                </button>

                                {/* Regenerate — only on the newest reply, since
                                    retrying an earlier one would orphan the turns after it */}
                                {canRetry && (
                                  <button
                                    onClick={handleRegenerate}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg transition-colors group"
                                    aria-label="Regenerate response"
                                    title="Regenerate response"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-white/50 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleFeedback(index, 'like')}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg transition-colors group"
                                  aria-label="Good response"
                                  aria-pressed={messageFeedback[index] === 'like'}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${messageFeedback[index] === 'like' ? 'text-green-600 fill-current' : 'text-gray-500 dark:text-white/50 group-hover:text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleFeedback(index, 'dislike')}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg transition-colors group"
                                  aria-label="Bad response"
                                  aria-pressed={messageFeedback[index] === 'dislike'}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${messageFeedback[index] === 'dislike' ? 'text-red-600 fill-current' : 'text-gray-500 dark:text-white/50 group-hover:text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                  </svg>
                                </button>
                              </>
                            )}

                            {stamp && (
                              <span
                                className="px-1 text-[11px] text-black/30 dark:text-white/30 select-none"
                                title={absoluteTime(msg.createdAt)}
                              >
                                {stamp}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white/[0.14] border border-gray-200 dark:border-white/[0.12] flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {isLoading && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content.trim()) && (
                <div className="flex items-center gap-3">
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
                      <span className="text-xs text-gray-400 dark:text-white/40">{persona.name} is thinking</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Jump back to the live end of the thread after scrolling up */}
          {showScrollToBottom && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-[#0B0B0C]/90 text-black dark:text-white shadow-soft-md backdrop-blur-xl ring-1 ring-black/[0.06] dark:ring-white/[0.06] hover:bg-white transition-all duration-200 animate-fadeIn"
              aria-label="Scroll to latest message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}

          {/* Composer — one container, controls inside it */}
          <footer className="px-5 pb-4 pt-2 flex-shrink-0 bg-white/75 dark:bg-[#0B0B0C]/75 backdrop-blur-2xl" style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 -4px 24px rgba(0, 0, 0, 0.04)' }}>
            <div className="mx-auto w-full max-w-3xl">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-1.5 rounded-3xl glass-matte py-2 pl-4 pr-2 transition-colors duration-200 focus-within:bg-white/90 dark:focus-within:bg-[#0B0B0C]/90 focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10"
              >
                <label htmlFor="chat-composer" className="sr-only">
                  {`Message ${persona.name}`}
                </label>
                <textarea
                  id="chat-composer"
                  ref={composerRef}
                  rows={1}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder={`Message ${persona.name}...`}
                  className="flex-1 min-w-0 bg-transparent border-0 py-2 text-black dark:text-white text-sm placeholder:text-gray-500 dark:placeholder:text-white/40 focus:outline-none resize-none overflow-y-auto max-h-40 leading-relaxed"
                />

                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${isListening
                    ? 'bg-black text-white dark:bg-white dark:text-black ring-2 ring-black/20 dark:ring-white/20 animate-pulse'
                    : 'text-black/50 dark:text-white/50 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white'
                    }`}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  aria-pressed={isListening}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>

                {/* Send, or stop while a reply is streaming */}
                {isLoading ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-glass-dark hover:bg-gray-900 dark:hover:bg-white/90 transition-all duration-200"
                    aria-label="Stop generating"
                    title="Stop generating (Esc)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="6" width="12" height="12" rx="2.5" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-glass-dark hover:bg-gray-900 dark:hover:bg-white/90 transition-all duration-200 disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed"
                    disabled={!currentInput.trim()}
                    aria-label="Send message"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                )}
              </form>

              {/* Disclaimer */}
              <div className="text-center text-[10px] md:text-xs text-gray-500 dark:text-white/50 mt-2.5 px-2">
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
            </div>
          </footer>
        </div>
      </div>

    </>
  )
}

export default withAuth(ChatPage)
