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
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* Persona Header */}
      <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-2xl sm:rounded-3xl p-4 sm:p-5 mx-3 sm:mx-4 mt-6 mb-3 sm:mb-4 flex items-center space-x-3 sm:space-x-4 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-transparent via-white/3 to-white/8 pointer-events-none" />

        <div className="relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-white/20 via-white/12 to-white/8 backdrop-blur-md border border-white/30 flex items-center justify-center text-lg sm:text-xl text-white font-bold shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
          {persona.name[0]}
        </div>
        <div className="relative z-10 flex-1 min-w-0">
          <h2 className="font-semibold text-base sm:text-lg text-white tracking-tight truncate">{persona.name}</h2>
          <p className="text-white/70 text-xs sm:text-sm truncate font-light">{persona.description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-3 sm:pb-4">
        {messages.length === 0 && (
          <div className="text-center text-white/80 mt-4 sm:mt-8 px-2">
            <p className="mb-4 sm:mb-5 text-sm sm:text-base font-light tracking-wide">Start a conversation with {persona.name}</p>
            <div className="space-y-2.5">
              {persona.conversation_starters?.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(starter)}
                  className="group relative block w-full bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 hover:from-white/18 hover:via-white/12 hover:to-white/8 hover:border-white/35 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-400 ease-premium text-left text-white text-sm sm:text-base overflow-hidden hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                  <span className="relative z-10 font-light tracking-wide">{starter}</span>
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
            <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 px-5 py-3.5 rounded-3xl shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/12 via-transparent to-transparent opacity-50 pointer-events-none" />
              <div className="relative z-10 flex space-x-2">
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce delay-100 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce delay-200 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
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
