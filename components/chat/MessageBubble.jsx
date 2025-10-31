export default function MessageBubble({ message, language }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-black-tertiary text-text-primary'
            : 'bg-white/10 border border-white/30 text-text-primary'
        } ${language === 'hi' ? 'font-hindi' : ''}`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
