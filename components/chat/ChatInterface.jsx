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
      <div className="relative bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-4 mx-3 sm:mx-4 mt-2 mb-2 flex items-center space-x-3 sm:space-x-4 shadow-sm animate-fadeIn">
        {/* Hamburger Menu Button - Mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden relative z-10 w-9 h-9 flex flex-col items-center justify-center space-y-1.5 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors active:scale-95"
          aria-label="Toggle menu"
        >
          <span className="w-5 h-0.5 bg-black rounded-full"></span>
          <span className="w-5 h-0.5 bg-black rounded-full"></span>
          <span className="w-5 h-0.5 bg-black rounded-full"></span>
        </button>

        <div className="relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden text-lg sm:text-xl text-black font-bold shadow-sm">
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
          <h2 className="font-semibold text-base sm:text-lg text-black tracking-tight truncate">{persona.name}</h2>
          <p className="text-gray-500 text-xs sm:text-sm truncate font-light">{persona.description}</p>
        </div>

        {/* New Chat Button */}
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="group relative z-10 bg-black text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full hover:bg-gray-800 transition-colors overflow-hidden hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            title="Start a new conversation"
          >
            <span className="relative z-10 tracking-wide">New Chat</span>
          </button>
        )}
      </div>

      {/* Messages - Scrollable middle section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 min-h-0" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-600 px-2 py-4 animate-fadeIn">
            <p className="mb-4 text-sm sm:text-base font-light tracking-wide">Start a conversation with {persona.name}</p>
            <div className="space-y-2.5">
              {persona.conversation_starters?.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(starter)}
                  className="group relative block w-full bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow transition-all text-left text-black text-sm sm:text-base overflow-hidden hover:scale-[1.01] active:scale-[0.99] animate-fadeIn"
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                >
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
            <div className="relative bg-gray-100 border border-gray-200 px-4 sm:px-5 py-3 sm:py-3.5 rounded-3xl shadow-sm">
              <div className="relative z-10 flex space-x-2">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-200" />
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
