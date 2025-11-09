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
    <div className="border-t border-white/15 bg-gradient-to-b from-black-secondary/98 to-black-secondary/95 backdrop-blur-2xl p-2 sm:p-3 pb-3 sm:pb-4 shadow-[0_-8px_32px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
      {error && (
        <div className="mb-3 text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/30 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 font-light tracking-wide animate-fadeIn">
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
              className="w-full bg-gradient-to-br from-black via-black to-black/95 border border-white/30 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-3 sm:py-4 text-base text-white placeholder:text-white/50 focus:border-white/50 shadow-glass focus-glow transition-smooth disabled:opacity-50 disabled:cursor-not-allowed font-light tracking-wide"
            />
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/8 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="group relative flex-shrink-0 bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border border-white/35 text-white font-semibold px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-2xl sm:rounded-3xl hover:from-white/30 hover:via-white/22 hover:to-white/16 hover:border-white/50 shadow-glass hover:shadow-glass-hover transition-smooth disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95 hover:scale-[1.02] overflow-hidden"
          >
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl bg-white/10 -z-10" />
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
