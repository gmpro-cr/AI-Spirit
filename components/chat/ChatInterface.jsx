import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import { useChat } from '@/context/ChatContext'

export default function ChatInterface({ persona, onSendMessage, onNewChat }) {
  const { messages, isLoading } = useChat()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewChat = () => {
    if (messages.length === 0) return

    if (confirm('Are you sure you want to start a new chat? Current conversation will be cleared.')) {
      if (onNewChat) {
        onNewChat()
      }
    }
  }

  return (
    <div className="fixed top-[65px] left-0 right-0 bottom-0 flex flex-col lg:left-72">
      {/* Persona Header */}
      <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-2xl sm:rounded-3xl p-3 sm:p-4 mx-3 sm:mx-4 mt-2 mb-2 flex items-center space-x-3 sm:space-x-4 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-transparent via-white/3 to-white/8 pointer-events-none" />

        <div className="relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-white/20 via-white/12 to-white/8 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden text-lg sm:text-xl text-white font-bold shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
          {persona.avatar_url ? (
            <img
              src={persona.avatar_url}
              alt={persona.name}
              className="w-full h-full object-cover"
            />
          ) : (
            persona.name[0]
          )}
        </div>
        <div className="relative z-10 flex-1 min-w-0">
          <h2 className="font-semibold text-base sm:text-lg text-white tracking-tight truncate">{persona.name}</h2>
          <p className="text-white/70 text-xs sm:text-sm truncate font-light">{persona.description}</p>
        </div>

        {/* New Chat Button */}
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="group relative z-10 bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/45 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.12)] transition-all duration-400 ease-premium overflow-hidden hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            title="Start a new conversation"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
            <span className="relative z-10 tracking-wide">New Chat</span>
          </button>
        )}
      </div>

      {/* Messages - Scrollable middle section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 min-h-0" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        {messages.length === 0 && (
          <div className="text-center text-white/80 px-2 py-4">
            <p className="mb-4 text-sm sm:text-base font-light tracking-wide">Start a conversation with {persona.name}</p>
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
            <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 px-4 sm:px-5 py-3 sm:py-3.5 rounded-3xl shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/12 via-transparent to-transparent opacity-50 pointer-events-none" />
              <div className="relative z-10 flex space-x-2">
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce delay-100 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 rounded-full animate-bounce delay-200 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              </div>
            </div>
          </div>
        )}

        {messages.length > 0 && <div ref={messagesEndRef} />}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0">
        <InputBox onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
