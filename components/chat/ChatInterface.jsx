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
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Persona Header */}
      <div className="glass-panel p-4 m-4 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-black-tertiary flex items-center justify-center text-xl">
          {persona.name[0]}
        </div>
        <div>
          <h2 className="font-semibold text-lg">{persona.name}</h2>
          <p className="text-text-secondary text-sm">{persona.description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center text-text-secondary mt-8">
            <p className="mb-4">Start a conversation with {persona.name}</p>
            <div className="space-y-2">
              {persona.conversation_starters?.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(starter)}
                  className="block w-full glass-panel p-3 hover:border-neon-cyan transition text-left"
                >
                  {starter}
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
            <div className="bg-black-tertiary px-4 py-3 rounded-2xl">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-200" />
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
