'use client'

import { useState } from 'react'
import { speak, stopSpeaking } from '../../lib/textToSpeech'

export default function MessageBubble({ message, language, personaName }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(null) // null | 'like' | 'dislike'
  const [speaking, setSpeaking] = useState(false)

  const isStreaming = !isUser && message.content === ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLike = () => setLiked(liked === 'like' ? null : 'like')
  const handleDislike = () => setLiked(liked === 'dislike' ? null : 'dislike')

  const handleSpeak = async () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    try {
      await speak(message.content, personaName, language, () => setSpeaking(false))
    } catch {
      setSpeaking(false)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fadeIn`}>
      <div className={`relative ${isUser ? 'max-w-[82%] sm:max-w-[70%]' : 'max-w-[88%] sm:max-w-[76%]'}`}>
        {/* Bubble */}
        <div
          className={`px-4 sm:px-5 py-3 sm:py-3.5 rounded-3xl ${language === 'hi' ? 'font-hindi' : ''} ${
            isUser
              ? 'bg-black text-white rounded-br-lg shadow-glass-dark'
              : 'glass-matte rounded-bl-lg text-black'
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed text-[15px] break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-[3px] h-4 bg-current ml-1 rounded-full animate-pulse opacity-70" />
            )}
          </p>
        </div>

        {/* Action row — always visible for AI messages, positioned below bubble */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center gap-1.5 mt-2 ml-1">
            {/* Speak */}
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 active:scale-90 ${
                speaking
                  ? 'bg-black text-white rounded-full shadow-glass-dark'
                  : 'glass-pill text-black/50 hover:text-black hover:bg-white/80'
              }`}
              title={speaking ? 'Stop' : 'Listen'}
            >
              {speaking ? (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 active:scale-90 ${
                liked === 'like'
                  ? 'bg-black text-white rounded-full shadow-glass-dark'
                  : 'glass-pill text-black/50 hover:text-black hover:bg-white/80'
              }`}
              title="Helpful"
            >
              <svg className="h-3 w-3" fill={liked === 'like' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>

            {/* Dislike */}
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 active:scale-90 ${
                liked === 'dislike'
                  ? 'bg-black text-white rounded-full shadow-glass-dark'
                  : 'glass-pill text-black/50 hover:text-black hover:bg-white/80'
              }`}
              title="Not helpful"
            >
              <svg className="h-3 w-3" fill={liked === 'dislike' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 active:scale-90 ${
                copied
                  ? 'bg-black text-white rounded-full shadow-glass-dark'
                  : 'glass-pill text-black/50 hover:text-black hover:bg-white/80'
              }`}
              title={copied ? 'Copied' : 'Copy'}
            >
              {copied ? (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
