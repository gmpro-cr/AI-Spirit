'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import { useChat } from '@/context/ChatContext'

export default function ChatInterface({ persona, onSendMessage, onNewChat, onMenuToggle }) {
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

    if (onNewChat) {
      onNewChat()
    }
  }

  return (
    <div className="fixed top-0 lg:top-[65px] left-0 right-0 bottom-0 flex flex-col lg:left-72">
      {/* Persona Header */}
      <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-900/40 backdrop-blur-2xl border border-white/30 dark:border-spirit-border-dark rounded-2xl sm:rounded-3xl p-3 sm:p-4 mx-3 sm:mx-4 mt-2 mb-2 flex items-center space-x-3 sm:space-x-4 shadow-glass animate-fadeIn">
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/18 via-transparent to-transparent dark:from-gray-700/20 opacity-60 pointer-events-none" />
        <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-transparent via-white/5 to-white/10 dark:via-gray-700/10 dark:to-gray-800/20 pointer-events-none" />

        {/* Hamburger Menu Button - Mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden relative z-10 w-9 h-9 flex flex-col items-center justify-center space-y-1.5 bg-gradient-to-br from-white/18 via-white/12 to-white/8 dark:from-gray-700/60 dark:via-gray-800/40 dark:to-gray-900/20 backdrop-blur-xl border border-white/35 dark:border-spirit-border-dark rounded-xl hover:from-white/25 hover:via-white/18 hover:to-white/12 dark:hover:from-gray-600/70 dark:hover:via-gray-700/50 dark:hover:to-gray-800/30 hover:border-white/50 dark:hover:border-gray-600 transition-smooth shadow-glass hover:shadow-glass-hover active:scale-95"
          aria-label="Toggle menu"
        >
          <span className="w-5 h-0.5 bg-white dark:bg-spirit-primary-dark rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] dark:shadow-[0_0_8px_rgba(245,245,245,0.2)]"></span>
          <span className="w-5 h-0.5 bg-white dark:bg-spirit-primary-dark rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] dark:shadow-[0_0_8px_rgba(245,245,245,0.2)]"></span>
          <span className="w-5 h-0.5 bg-white dark:bg-spirit-primary-dark rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] dark:shadow-[0_0_8px_rgba(245,245,245,0.2)]"></span>
        </button>

        <div className="relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-white/22 via-white/14 to-white/10 dark:from-gray-700/50 dark:via-gray-800/30 dark:to-gray-900/20 backdrop-blur-md border border-white/35 dark:border-spirit-border-dark flex items-center justify-center overflow-hidden text-lg sm:text-xl text-white dark:text-spirit-primary-dark font-bold shadow-[0_6px_20px_-2px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.18),inset_0_-2px_1px_rgba(0,0,0,0.1)] dark:shadow-[0_6px_20px_-2px_rgba(0,0,0,0.6),inset_0_2px_1px_rgba(100,100,100,0.1),inset_0_-2px_1px_rgba(0,0,0,0.2)]">
          {persona.avatar_url ? (
            <Image
              src={persona.avatar_url}
              alt={persona.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            persona.name[0]
          )}
        </div>
        <div className="relative z-10 flex-1 min-w-0">
          <h2 className="font-semibold text-base sm:text-lg text-white dark:text-spirit-primary-dark tracking-tight truncate">{persona.name}</h2>
          <p className="text-white/70 dark:text-gray-400 text-xs sm:text-sm truncate font-light">{persona.description}</p>
        </div>

        {/* New Chat Button */}
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="group relative z-10 bg-gradient-to-br from-white/18 via-white/12 to-white/8 dark:from-gray-700/60 dark:via-gray-800/40 dark:to-gray-900/20 backdrop-blur-xl border border-white/35 dark:border-spirit-border-dark text-white dark:text-spirit-primary-dark text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full hover:from-white/28 hover:via-white/20 hover:to-white/14 dark:hover:from-gray-600/70 dark:hover:via-gray-700/50 dark:hover:to-gray-800/30 hover:border-white/50 dark:hover:border-gray-600 shadow-glass hover:shadow-glass-hover transition-smooth overflow-hidden hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            title="Start a new conversation"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/25 via-transparent to-transparent dark:from-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <span className="relative z-10 tracking-wide">New Chat</span>
          </button>
        )}
      </div>

      {/* Messages - Scrollable middle section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 min-h-0" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        {messages.length === 0 && (
          <div className="text-center text-white/80 dark:text-gray-400 px-2 py-4 animate-fadeIn">
            <p className="mb-4 text-sm sm:text-base font-light tracking-wide">Start a conversation with {persona.name}</p>
            <div className="space-y-2.5">
              {persona.conversation_starters?.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(starter)}
                  className="group relative block w-full bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-900/40 backdrop-blur-2xl border border-white/30 dark:border-spirit-border-dark rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 hover:from-white/20 hover:via-white/14 hover:to-white/10 dark:hover:from-gray-700/90 dark:hover:via-gray-800/70 dark:hover:to-gray-900/50 hover:border-white/40 dark:hover:border-gray-600 shadow-glass hover:shadow-glass-hover transition-smooth text-left text-white dark:text-spirit-primary-dark text-sm sm:text-base overflow-hidden hover:scale-[1.01] active:scale-[0.99] animate-fadeIn"
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/15 via-transparent to-transparent dark:from-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-transparent via-white/5 to-white/8 dark:via-gray-700/10 dark:to-gray-800/20 pointer-events-none" />
                  <span className="relative z-10 font-light tracking-wide">{starter}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <MessageBubble
            key={`${message.role}-${idx}-${message.content.substring(0, 30)}`}
            message={message}
            language={persona.language}
            personaName={persona.name}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4 animate-fadeIn">
            <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-900/40 backdrop-blur-2xl border border-white/30 dark:border-spirit-border-dark px-4 sm:px-5 py-3 sm:py-3.5 rounded-3xl shadow-glass">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/15 via-transparent to-transparent dark:from-gray-700/20 opacity-50 pointer-events-none" />
              <div className="relative z-10 flex space-x-2">
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 dark:from-spirit-primary-dark dark:via-gray-300 dark:to-gray-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(255,255,255,0.4)] dark:shadow-[0_0_12px_rgba(245,245,245,0.2)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 dark:from-spirit-primary-dark dark:via-gray-300 dark:to-gray-400 rounded-full animate-bounce delay-100 shadow-[0_0_12px_rgba(255,255,255,0.4)] dark:shadow-[0_0_12px_rgba(245,245,245,0.2)]" />
                <div className="w-2 h-2 bg-gradient-to-br from-white via-white/90 to-white/80 dark:from-spirit-primary-dark dark:via-gray-300 dark:to-gray-400 rounded-full animate-bounce delay-200 shadow-[0_0_12px_rgba(255,255,255,0.4)] dark:shadow-[0_0_12px_rgba(245,245,245,0.2)]" />
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
