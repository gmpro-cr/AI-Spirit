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
    <div className="fixed top-0 lg:top-[65px] left-0 right-0 bottom-0 flex flex-col lg:left-72 bg-white">
      {/* Persona Header — mobile: compact app-bar; desktop: floating card */}
      <div className="flex-shrink-0">
        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-black/[0.06] bg-white/98 backdrop-blur-xl animate-fadeIn"
          style={{ paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))' }}
        >
          <button
            onClick={onMenuToggle}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl bg-black/[0.04] active:bg-black/[0.08] active:scale-95 transition-all duration-150 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <span className="w-4 h-[1.5px] bg-black rounded-full" />
            <span className="w-4 h-[1.5px] bg-black rounded-full" />
            <span className="w-4 h-[1.5px] bg-black rounded-full" />
          </button>

          <div className="w-10 h-10 rounded-[14px] bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-base font-bold text-black">
            {persona.avatar_url ? (
              <Image src={persona.avatar_url} alt={persona.name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              persona.name[0]
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display text-[16px] font-semibold text-black truncate leading-tight">{persona.name}</h2>
            <p className="text-black/40 text-[11px] truncate leading-tight mt-px">{persona.description}</p>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full bg-black/[0.05] text-black/60 hover:bg-black hover:text-white active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              New chat
            </button>
          )}
        </div>

        {/* Desktop header — floating card */}
        <div className="hidden lg:flex relative bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-5 mx-4 mt-3 mb-3 items-center space-x-4 shadow-soft animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden text-xl text-black font-bold shadow-soft flex-shrink-0">
            {persona.avatar_url ? (
              <Image src={persona.avatar_url} alt={persona.name} width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              persona.name[0]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-semibold text-lg text-black tracking-tight truncate">{persona.name}</h2>
            <p className="text-gray-400 text-sm truncate">{persona.description}</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
            >
              New chat
            </button>
          )}
        </div>
      </div>

      {/* Messages - Scrollable middle section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 min-h-0 bg-white" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-600 px-2 py-6 animate-fadeIn">
            <p className="mb-6 text-sm sm:text-base text-gray-500">Start a conversation with {persona.name}</p>
            <div className="space-y-3">
              {persona.conversation_starters?.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(starter)}
                  className="group relative block w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:bg-white hover:border-gray-200 shadow-xs hover:shadow-soft transition-all duration-300 text-left text-black text-sm sm:text-base overflow-hidden hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] animate-fadeIn"
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <span className="relative z-10">{starter}</span>
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
            <div className="relative bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl shadow-soft">
              <div className="relative z-10 flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-wave" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-wave" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-wave" style={{ animationDelay: '300ms' }} />
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
