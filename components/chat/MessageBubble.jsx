import { useState, useEffect } from 'react'
import { speak, stopSpeaking, isSpeaking, loadVoices } from '@/lib/textToSpeech'

export default function MessageBubble({ message, language, personaName }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  useEffect(() => {
    // Load voices on component mount
    loadVoices().then(() => {
      setVoicesLoaded(true)
    })

    // Cleanup: stop speaking when component unmounts
    return () => {
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    // Check speaking status periodically
    if (!speaking) return

    const interval = setInterval(() => {
      if (!isSpeaking()) {
        setSpeaking(false)
      }
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [speaking])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSpeak = async () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
    } else {
      setSpeaking(true)
      try {
        await speak(message.content, personaName || 'Default', language, () => {
          setSpeaking(false)
        })
      } catch (error) {
        console.error('Speech error:', error)
        setSpeaking(false)
      }
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className="relative max-w-[90%] sm:max-w-[75%] group">
        <div
          className={`relative px-4 sm:px-5 py-3 sm:py-4 rounded-3xl transition-all duration-500 ease-out ${
            isUser
              ? 'bg-gradient-to-br from-white via-white/98 to-white/95 text-black font-medium shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.25),inset_0_2px_1px_rgba(255,255,255,0.6),inset_0_-2px_1px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_48px_-4px_rgba(0,0,0,0.5),0_6px_24px_rgba(0,0,0,0.3),inset_0_2px_1px_rgba(255,255,255,0.7)] hover:scale-[1.01]'
              : 'bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 text-white shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3),inset_0_2px_1px_rgba(255,255,255,0.12),inset_0_-2px_1px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_-4px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.15)] hover:from-white/18 hover:via-white/12 hover:to-white/8 hover:border-white/35 hover:scale-[1.01] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/15 before:via-transparent before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none'
          } ${language === 'hi' ? 'font-hindi' : ''}`}
        >
          <p className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-wide font-light break-words">{message.content}</p>
        </div>

        {/* Action Buttons - Only show for AI messages */}
        {!isUser && (
          <div className="absolute -top-2 -right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
            {/* Speaker Button */}
            <button
              onClick={handleSpeak}
              className={`bg-gradient-to-br from-white/22 via-white/16 to-white/12 backdrop-blur-xl border border-white/35 rounded-full p-2 hover:from-white/32 hover:via-white/24 hover:to-white/18 hover:border-white/50 shadow-[0_6px_20px_-2px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_28px_-2px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.2)] active:scale-90 transition-all duration-300 hover:scale-110 ${
                speaking ? 'bg-blue-500/20 border-blue-400/50' : ''
              }`}
              title={speaking ? "Stop speaking" : "Listen to message"}
              disabled={!voicesLoaded}
            >
              {speaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="bg-gradient-to-br from-white/22 via-white/16 to-white/12 backdrop-blur-xl border border-white/35 rounded-full p-2 hover:from-white/32 hover:via-white/24 hover:to-white/18 hover:border-white/50 shadow-[0_6px_20px_-2px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_28px_-2px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.2)] active:scale-90 transition-all duration-300 hover:scale-110"
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
