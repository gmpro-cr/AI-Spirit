'use client'
// Force rebuild: 2025-11-29T17:20:00

import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking, isSpeaking } from '../../lib/textToSpeech'

// Typing speeds (milliseconds per word) based on persona talking style
// Each persona has a unique speed that matches their character
const TYPING_SPEEDS = {
  'Osho': 180,              // Slow, contemplative
  'Albert Einstein': 150,    // Thoughtful, measured
  'Elon Musk': 80,          // Fast, energetic
  'Mahatma Gandhi': 160,    // Calm, deliberate

  'Swami Vivekananda': 130, // Passionate, flowing
  'Socrates': 170,          // Questioning, reflective
  'Astro Guide': 120,       // Mystical, moderate
  'Fitness Coach': 90,      // Energetic, quick
  'Life Coach': 110,        // Encouraging, steady
  'Career Mentor': 100,     // Professional, clear
  'Shinchan': 70,           // Childlike, fast
  'default': 120            // Default speed
}

export default function MessageBubble({ message, language, personaName }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [displayedText, setDisplayedText] = useState(message.content) // Start with full text for SSR
  const [isTyping, setIsTyping] = useState(false)
  const [liked, setLiked] = useState(null) // null, 'like', or 'dislike'
  const [speaking, setSpeaking] = useState(false)
  const animationRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  // Detect client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLike = () => {
    setLiked(liked === 'like' ? null : 'like')
    // TODO: Send feedback to backend
  }

  const handleDislike = () => {
    setLiked(liked === 'dislike' ? null : 'dislike')
    // TODO: Send feedback to backend
  }

  const handleSpeak = async () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    try {
      await speak(message.content, personaName, language, () => {
        setSpeaking(false)
      })
    } catch (err) {
      console.error('Speech failed:', err)
      setSpeaking(false)
    }
  }

  // Word-by-word streaming animation for AI messages
  useEffect(() => {
    if (isUser || !mounted) return // Only run on client-side for AI messages

    const words = message.content.split(' ')
    const typingSpeed = TYPING_SPEEDS[personaName] || TYPING_SPEEDS['default']
    console.log('[MessageBubble] Starting animation:', { personaName, typingSpeed, wordCount: words.length })
    let currentWordIndex = 0

    setDisplayedText('')
    setIsTyping(true)

    const typeNextWord = () => {
      if (currentWordIndex < words.length) {
        setDisplayedText(prev => {
          const newText = prev + (prev ? ' ' : '') + words[currentWordIndex]
          return newText
        })
        currentWordIndex++
        animationRef.current = setTimeout(typeNextWord, typingSpeed)
      } else {
        setIsTyping(false)
      }
    }

    animationRef.current = setTimeout(typeNextWord, typingSpeed / 2)

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [message.content, isUser, personaName, mounted])

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className="relative max-w-[90%] sm:max-w-[75%] group">
        <div
          className={`relative px-4 sm:px-5 py-3 sm:py-4 rounded-3xl transition-all ${isUser
            ? 'bg-black text-white font-medium shadow-sm hover:shadow hover:scale-[1.01]'
            : 'bg-gray-100 border border-gray-200 text-black shadow-sm hover:shadow hover:bg-gray-50 hover:scale-[1.01]'
            } ${language === 'hi' ? 'font-hindi' : ''}`}
        >
          <p className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-wide font-light break-words">
            {displayedText}
            {isTyping && <span className="inline-block w-1 h-4 bg-black ml-1 animate-pulse" />}
          </p>
        </div>

        {/* Action Buttons - Only show for AI messages */}
        {!isUser && (
          <div className="absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-100 hover:border-gray-300 shadow-sm hover:shadow active:scale-90 transition-all hover:scale-110"
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons - Below AI messages */}
        {!isUser && !isTyping && (
          <div className="flex items-center gap-2 mt-2 ml-1">
            {/* Speaker Button */}
            <button
              onClick={handleSpeak}
              className={`group/speak flex items-center gap-1 px-2 py-1 rounded-full transition-all ${speaking
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              title={speaking ? "Stop speaking" : "Listen to response"}
            >
              {speaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover/speak:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`group/like flex items-center gap-1 px-2 py-1 rounded-full transition-all ${liked === 'like'
                ? 'bg-green-100 border border-green-300'
                : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              title="Like this response"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-colors ${liked === 'like' ? 'text-green-600 fill-green-600' : 'text-gray-500 group-hover/like:text-black'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>

            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className={`group/dislike flex items-center gap-1 px-2 py-1 rounded-full transition-all ${liked === 'dislike'
                ? 'bg-red-100 border border-red-300'
                : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              title="Dislike this response"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-colors ${liked === 'dislike' ? 'text-red-600 fill-red-600' : 'text-gray-500 group-hover/dislike:text-black'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
