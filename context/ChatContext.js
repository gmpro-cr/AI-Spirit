import { createContext, useContext, useState } from 'react'

const ChatContext = createContext({})

export const ChatProvider = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = (message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const value = {
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
