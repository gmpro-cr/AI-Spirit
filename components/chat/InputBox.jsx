'use client'

import { useState } from 'react'
import { moderateContent } from '@/lib/moderation'

export default function InputBox({ onSend, disabled }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false)
  const MAX_CHARS = 2000

  const handleSend = () => {
    if (!input.trim()) return

    // Client-side moderation
    const moderationResult = moderateContent(input)
    if (moderationResult.blocked) {
      setError('Message contains inappropriate content')
      return
    }

    onSend(input)
    setInput('')
    setError('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 p-3 sm:p-4 pb-4 sm:pb-5 shadow-soft-lg">
      {error && (
        <div className="mb-3 text-red-600 text-xs sm:text-sm bg-red-50 border border-red-100 rounded-2xl px-4 py-3 animate-fadeIn">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <div className="flex gap-3 w-full max-w-full">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              maxLength={MAX_CHARS}
              placeholder="Type your message..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-base text-black placeholder:text-gray-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 shadow-xs focus:shadow-soft transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="group relative flex-shrink-0 bg-black text-white font-medium px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base rounded-2xl shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-soft disabled:hover:translate-y-0"
          >
            <span className="relative z-10">Send</span>
          </button>
        </div>

        {/* Character Counter */}
        {input.length > 0 && (
          <div className="flex justify-end px-1">
            <span className={`text-xs transition-colors duration-300 ${input.length > MAX_CHARS * 0.9
              ? 'text-red-500'
              : input.length > MAX_CHARS * 0.8
                ? 'text-gray-600'
                : 'text-gray-400'
              }`}>
              {input.length} / {MAX_CHARS}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 px-1">
        <button
          onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
          className="text-gray-400 text-xs hover:text-gray-500 transition-colors duration-300 text-left w-full cursor-pointer"
        >
          {disclaimerExpanded ? (
            <span>This chat is powered by AI that imitate real or fictional characters. Responses are computer-generated and not from real individuals.</span>
          ) : (
            <span>This chat is powered by AI that imitate real or fictional characters...</span>
          )}
        </button>
      </div>
    </div>
  )
}
