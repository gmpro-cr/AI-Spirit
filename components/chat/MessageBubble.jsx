export default function MessageBubble({ message, language }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div
        className={`relative max-w-[75%] px-5 py-4 rounded-3xl transition-all duration-400 ease-premium hover:scale-[1.01] ${
          isUser
            ? 'bg-gradient-to-br from-white via-white/98 to-white/95 text-black font-medium shadow-[0_4px_24px_-2px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.25)]'
            : 'bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 text-white shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_4px_12px_rgba(255,255,255,0.08)] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/12 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/3 after:to-white/8 after:pointer-events-none'
        } ${language === 'hi' ? 'font-hindi' : ''}`}
      >
        <p className="relative z-10 whitespace-pre-wrap leading-relaxed tracking-wide font-light">{message.content}</p>
      </div>
    </div>
  )
}
