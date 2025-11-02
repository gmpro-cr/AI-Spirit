import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import { useChat } from '@/context/ChatContext'

export default function ChatInterface({ persona, onSendMessage }) {
  const { messages, isLoading } = useChat()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)]">
      {/* Persona Header */}
      <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 rounded-2xl sm:rounded-3xl p-3 sm:p-4 m-3 sm:m-4 flex items-center space-x-3 sm:space-x-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-3xl before:bg-gradient-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-2xl sm:after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none">
        <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-lg sm:text-xl text-white font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          {persona.name[0]}
        </div>
        <div className="relative z-10 flex-1 min-w-0">
          <h2 className="font-semibold text-base sm:text-lg text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] truncate">{persona.name}</h2>
          <p className="text-white/90 text-xs sm:text-sm truncate">{persona.description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-3 sm:pb-4">
        {messages.length === 0 && (
          <div className="text-center text-white/80 mt-4 sm:mt-8 px-2">
            <p className="mb-3 sm:mb-4 drop-shadow-sm text-sm sm:text-base">Start a conversation with {persona.name}</p>
            <div className="space-y-2">
              {persona.conversation_starters?.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(starter)}
                  className="relative block w-full bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 hover:from-white/25 hover:via-white/20 hover:to-white/10 hover:border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.2)] transition-all duration-300 text-left text-white text-sm sm:text-base before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-3xl before:bg-gradient-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-2xl sm:after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none"
                >
                  <span className="relative z-10 drop-shadow-sm">{starter}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <MessageBubble key={idx} message={message} language={persona.language} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 px-4 py-3 rounded-3xl shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/20 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none">
              <div className="relative z-10 flex space-x-2">
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce delay-100 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce delay-200 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <InputBox onSend={onSendMessage} disabled={isLoading} />
    </div>
  )
}
