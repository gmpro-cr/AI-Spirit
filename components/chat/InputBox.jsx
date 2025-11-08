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
    <div className="border-t border-white/10 bg-black-secondary/95 backdrop-blur-2xl p-2 sm:p-3 pb-3 sm:pb-4 shadow-[0_-4px_24px_-2px_rgba(0,0,0,0.4)]">
      {error && (
        <div className="mb-3 text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/30 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 font-light tracking-wide">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <div className="flex gap-2 sm:gap-3 w-full max-w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            maxLength={MAX_CHARS}
            placeholder="Type your message..."
            className="flex-1 min-w-0 bg-black border border-white/30 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-3 sm:py-4 text-base text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.5),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-400 ease-premium disabled:opacity-50 disabled:cursor-not-allowed font-light tracking-wide"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="group relative flex-shrink-0 bg-gradient-to-br from-white/18 via-white/14 to-white/10 backdrop-blur-xl border border-white/35 text-white font-semibold px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-2xl sm:rounded-3xl hover:from-white/28 hover:via-white/22 hover:to-white/16 hover:border-white/50 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_4px_12px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-400 ease-premium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
            <span className="relative z-10 tracking-wide">Send</span>
          </button>
        </div>

        {/* Character Counter */}
        {input.length > 0 && (
          <div className="flex justify-end px-1">
            <span className={`text-xs transition-colors ${
              input.length > MAX_CHARS * 0.9
                ? 'text-orange-400'
                : input.length > MAX_CHARS * 0.8
                  ? 'text-yellow-400'
                  : 'text-white/40'
            }`}>
              {input.length} / {MAX_CHARS}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 px-1">
        <button
          onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
          className="text-white/40 text-xs hover:text-white/60 transition-colors text-left w-full cursor-pointer"
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
