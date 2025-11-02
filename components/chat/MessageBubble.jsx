export default function MessageBubble({ message, language }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div
        className={`relative max-w-[75%] px-5 py-4 rounded-3xl shadow-lg transition-all duration-200 hover:scale-[1.01] ${
          isUser
            ? 'bg-white text-black font-semibold'
            : 'bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 text-white shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/20 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none'
        } ${language === 'hi' ? 'font-hindi' : ''}`}
      >
        <p className="relative z-10 whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}
