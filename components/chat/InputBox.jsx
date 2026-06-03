'use client'

import { useState, useRef, useEffect } from 'react'
import { moderateContent } from '@/lib/moderation'

export default function InputBox({ onSend, disabled }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false)
  const textareaRef = useRef(null)
  const MAX_CHARS = 2000

  // Auto-grow textarea up to ~4 lines
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  const handleSend = () => {
    if (!input.trim()) return

    const moderationResult = moderateContent(input)
    if (moderationResult.blocked) {
      setError('Message contains inappropriate content')
      return
    }

    onSend(input)
    setInput('')
    setError('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = !disabled && input.trim().length > 0

  return (
    <div className="bg-white/95 backdrop-blur-xl border-t border-black/[0.06] px-3 sm:px-4 pt-3 pb-3 sm:pb-4"
      style={{ paddingBottom: 'max(12px, calc(env(safe-area-inset-bottom, 0px) + 12px))' }}>
      {error && (
        <div className="mb-2.5 text-red-700 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 animate-fadeIn">
          {error}
        </div>
      )}

      <div className="flex items-end gap-2.5">
        {/* Textarea */}
        <div className="relative flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            maxLength={MAX_CHARS}
            placeholder="Type your message…"
            className="w-full bg-black/[0.04] border border-black/[0.08] rounded-2xl px-4 py-3 text-[15px] text-black placeholder:text-black/30 focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/[0.07] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed outline-none resize-none overflow-hidden leading-[1.5]"
            style={{ minHeight: '48px' }}
          />
          {input.length > MAX_CHARS * 0.8 && (
            <span
              className={`absolute bottom-2 right-3 text-[10px] font-medium transition-colors ${
                input.length > MAX_CHARS * 0.95 ? 'text-red-500' : 'text-black/30'
              }`}
            >
              {MAX_CHARS - input.length}
            </span>
          )}
        </div>

        {/* Send button — icon only */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{
            background: canSend ? '#000' : 'rgba(0,0,0,0.07)',
            boxShadow: canSend ? '0 2px 10px rgba(0,0,0,0.18)' : 'none',
            cursor: canSend ? 'pointer' : 'not-allowed',
          }}
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5 transition-colors"
            style={{ color: canSend ? '#fff' : 'rgba(0,0,0,0.25)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-2.5 px-1">
        <button
          onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
          className="text-black/25 text-[11px] hover:text-black/40 transition-colors text-left w-full"
        >
          {disclaimerExpanded
            ? 'Responses are AI-generated imitations of real or fictional characters, not from real individuals.'
            : 'AI-generated responses · not from real individuals'}
        </button>
      </div>
    </div>
  )
}
