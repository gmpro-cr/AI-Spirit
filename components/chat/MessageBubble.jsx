import { useState } from 'react'

export default function MessageBubble({ message, language, personaName }) {
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
          className={`relative px-4 sm:px-5 py-3 sm:py-4 rounded-3xl transition-smooth ${
            isUser
              ? 'bg-gradient-to-br from-white via-white/98 to-white/95 text-black font-medium shadow-glass hover:shadow-glass-hover hover:scale-[1.01]'
              : 'bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 text-white shadow-glass hover:shadow-glass-hover hover:from-white/18 hover:via-white/12 hover:to-white/8 hover:border-white/35 hover:scale-[1.01] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/15 before:via-transparent before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none'
          } ${language === 'hi' ? 'font-hindi' : ''}`}
        >
          <p className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-wide font-light break-words">{message.content}</p>
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
      </div>
    </div>
  )
}
