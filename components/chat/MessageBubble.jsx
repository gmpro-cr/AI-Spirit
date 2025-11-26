import { useState, useEffect, useRef } from 'react'

// Typing speeds (milliseconds per word) based on persona talking style
// Each persona has a unique speed that matches their character
const TYPING_SPEEDS = {
  'Osho': 180,              // Slow, contemplative
  'Albert Einstein': 150,    // Thoughtful, measured
  'Elon Musk': 80,          // Fast, energetic
  'Mahatma Gandhi': 160,    // Calm, deliberate
  'APJ Abdul Kalam': 140,   // Inspirational, steady
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
  const [displayedText, setDisplayedText] = useState(isUser ? message.content : '')
  const [isTyping, setIsTyping] = useState(!isUser)
  const [liked, setLiked] = useState(null) // null, 'like', or 'dislike'
  const animationRef = useRef(null)

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

  // Word-by-word streaming animation for AI messages
  useEffect(() => {
    if (isUser) return

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
  }, [message.content, isUser, personaName])

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className="relative max-w-[90%] sm:max-w-[75%] group">
        <div
          className={`relative px-4 sm:px-5 py-3 sm:py-4 rounded-3xl transition-smooth ${
            isUser
              ? 'bg-gradient-to-br from-white via-white/98 to-white/95 text-black font-medium shadow-glass hover:shadow-glass-hover hover:scale-[1.01]'
              : 'bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 text-white shadow-glass hover:shadow-glass-hover hover:from-white/18 hover:via-white/12 hover:to-white/8 hover:border-white/35 hover:scale-[1.01] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/15 before:via-transparent before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none'
          } ${language === 'hi' ? 'font-hindi' : ''}`}
        >
          <p className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-wide font-light break-words">
            {displayedText}
            {isTyping && <span className="inline-block w-1 h-4 bg-white ml-1 animate-pulse" />}
          </p>
        </div>

        {/* Action Buttons - Only show for AI messages */}
        {!isUser && (
          <div className="absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="bg-gradient-to-br from-white/22 via-white/16 to-white/12 backdrop-blur-xl border border-white/35 rounded-full p-2 hover:from-white/32 hover:via-white/24 hover:to-white/18 hover:border-white/50 shadow-glass hover:shadow-glass-hover active:scale-90 transition-smooth hover:scale-110"
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Like/Dislike Buttons - Below AI messages */}
        {!isUser && !isTyping && (
          <div className="flex items-center gap-2 mt-2 ml-1">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`group/like flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
                liked === 'like'
                  ? 'bg-green-500/20 border border-green-400/40'
                  : 'bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30'
              }`}
              title="Like this response"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-colors ${
                  liked === 'like' ? 'text-green-400 fill-green-400' : 'text-white/70 group-hover/like:text-white'
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
              className={`group/dislike flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
                liked === 'dislike'
                  ? 'bg-red-500/20 border border-red-400/40'
                  : 'bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30'
              }`}
              title="Dislike this response"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-colors ${
                  liked === 'dislike' ? 'text-red-400 fill-red-400' : 'text-white/70 group-hover/dislike:text-white'
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
