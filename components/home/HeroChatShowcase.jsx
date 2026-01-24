// Simulated mobile chat interfaces for hero section
// Shows 3 different personas with pre-defined conversations

const chatData = [
    {
        persona: {
            name: 'Astro Guide',
            avatar: '🔮',
            color: '#6B21A8'
        },
        messages: [
            { role: 'user', text: 'What do the stars say about my career?' },
            { role: 'assistant', text: 'The alignment of Jupiter suggests new opportunities are coming your way. Trust your instincts this month.' }
        ]
    },
    {
        persona: {
            name: 'Elon Musk',
            avatar: '🚀',
            color: '#1D4ED8'
        },
        messages: [
            { role: 'user', text: 'How do you stay motivated?' },
            { role: 'assistant', text: 'Think about the future you want to create. If something is important enough, you do it even if the odds are against you.' }
        ]
    },
    {
        persona: {
            name: 'Donald Trump',
            avatar: '🏛️',
            color: '#DC2626'
        },
        messages: [
            { role: 'user', text: 'Tips for negotiating deals?' },
            { role: 'assistant', text: 'Always be willing to walk away. That\'s the biggest leverage you have. And believe me, I know deals!' }
        ]
    }
]

function ChatMessage({ role, text }) {
    return (
        <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${role === 'user'
                        ? 'bg-black text-white rounded-br-md'
                        : 'bg-gray-100 text-black rounded-bl-md'
                    }`}
            >
                {text}
            </div>
        </div>
    )
}

function MobileChatInterface({ persona, messages, delay = 0 }) {
    return (
        <div
            className="w-[240px] md:w-[280px] flex-shrink-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200 animate-fadeIn"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Phone notch */}
            <div className="bg-black h-6 flex items-center justify-center">
                <div className="w-20 h-4 bg-black rounded-b-xl"></div>
            </div>

            {/* Chat header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${persona.color}20` }}
                >
                    {persona.avatar}
                </div>
                <div>
                    <div className="font-semibold text-sm text-black">{persona.name}</div>
                    <div className="text-[10px] text-green-500">● Online</div>
                </div>
            </div>

            {/* Chat messages */}
            <div className="bg-gray-50 px-3 py-4 h-[180px] md:h-[200px] flex flex-col gap-3 overflow-hidden">
                {messages.map((msg, idx) => (
                    <ChatMessage key={idx} role={msg.role} text={msg.text} />
                ))}
            </div>

            {/* Input bar */}
            <div className="bg-white px-3 py-2 border-t border-gray-100 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-400">
                    Type a message...
                </div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
            </div>

            {/* Home indicator */}
            <div className="bg-white h-5 flex items-center justify-center">
                <div className="w-24 h-1 bg-black rounded-full"></div>
            </div>
        </div>
    )
}

export default function HeroChatShowcase() {
    return (
        <div className="flex items-center justify-center gap-4 md:gap-6 overflow-x-auto py-4 px-2">
            {chatData.map((chat, idx) => (
                <MobileChatInterface
                    key={chat.persona.name}
                    persona={chat.persona}
                    messages={chat.messages}
                    delay={idx * 150}
                />
            ))}
        </div>
    )
}
