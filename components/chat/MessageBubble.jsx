import { useState } from 'react'

export default function MessageBubble({ message, language }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className="relative max-w-[90%] sm:max-w-[75%] group">
        <div
          className={`relative px-4 sm:px-5 py-3 sm:py-4 rounded-3xl transition-all duration-400 ease-premium hover:scale-[1.01] ${
            isUser
              ? 'bg-gradient-to-br from-white via-white/98 to-white/95 text-black font-medium shadow-[0_4px_24px_-2px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.25)]'
              : 'bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 text-white shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_4px_12px_rgba(255,255,255,0.08)] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/12 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/3 after:to-white/8 after:pointer-events-none'
          } ${language === 'hi' ? 'font-hindi' : ''}`}
        >
          <p className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-wide font-light break-words">{message.content}</p>
        </div>

        {/* Copy Button - Only show for AI messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border border-white/30 rounded-full p-2 hover:from-white/30 hover:via-white/25 hover:to-white/20 hover:border-white/45 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_-2px_rgba(0,0,0,0.4)] active:scale-95 transition-all"
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
        )}
      </div>
    </div>
  )
}
