import { useState } from 'react'
import { moderateContent } from '@/lib/moderation'

export default function InputBox({ onSend, disabled }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

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
    <div className="border-t border-white/10 bg-black-secondary/80 backdrop-blur-md p-3 sm:p-4">
      {error && (
        <div className="mb-2 text-red-500 text-xs sm:text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
          {error}
        </div>
      )}
      <div className="flex gap-2 sm:gap-3 w-full max-w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="Type your message..."
          className="flex-1 min-w-0 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-2.5 sm:py-4 text-sm sm:text-base text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none shadow-inner transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="relative flex-shrink-0 bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl border-2 border-white/60 text-white font-bold px-4 sm:px-8 py-2.5 sm:py-4 text-sm sm:text-base rounded-2xl sm:rounded-3xl hover:from-white/35 hover:via-white/30 hover:to-white/20 hover:border-white/80 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_24px_0_rgba(255,255,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95 before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-3xl before:bg-gradient-to-tr before:from-white/35 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-2xl sm:after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/10 after:to-white/15 after:pointer-events-none"
        >
          <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Send</span>
        </button>
      </div>
    </div>
  )
}
