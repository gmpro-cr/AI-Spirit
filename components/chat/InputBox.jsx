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
    <div className="border-t border-gray-200 bg-white p-2 sm:p-3 pb-3 sm:pb-4 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.1)]">
      {error && (
        <div className="mb-3 text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 font-light tracking-wide animate-fadeIn">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <div className="flex gap-2 sm:gap-3 w-full max-w-full">
          <div className="relative flex-1 min-w-0 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              maxLength={MAX_CHARS}
              placeholder="Type your message..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-3 sm:py-4 text-base text-black placeholder:text-gray-400 focus:border-gray-400 focus:bg-white shadow-sm focus:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-light tracking-wide outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="group relative flex-shrink-0 bg-black border border-black text-white font-semibold px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-2xl sm:rounded-3xl hover:bg-gray-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95 hover:scale-[1.02]"
          >
            <span className="relative z-10 tracking-wide">Send</span>
          </button>
        </div>

        {/* Character Counter */}
        {input.length > 0 && (
          <div className="flex justify-end px-1">
            <span className={`text-xs transition-colors ${
              input.length > MAX_CHARS * 0.9
                ? 'text-orange-500'
                : input.length > MAX_CHARS * 0.8
                  ? 'text-yellow-600'
                  : 'text-gray-400'
            }`}>
              {input.length} / {MAX_CHARS}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 px-1">
        <button
          onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
          className="text-gray-400 text-xs hover:text-gray-600 transition-colors text-left w-full cursor-pointer"
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
