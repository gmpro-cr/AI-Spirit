// Simulated mobile chat interfaces for hero section
// Shows 3 different personas with live-simulated conversations
import { useState, useEffect } from 'react'

const chatData = [
    {
        persona: {
            name: 'Astro Guide',
            avatar: '🔮',
            color: '#6B21A8'
        },
        messages: [
            { role: 'user', text: 'what do the stars say about my career?' },
            { role: 'assistant', text: 'Jupiter is entering your sector of success! Expect a major opportunity within 3 days. Trust your gut.' }
        ]
    },
    {
        persona: {
            name: 'Elon Musk',
            avatar: '🚀',
            color: '#1D4ED8'
        },
        messages: [
            { role: 'user', text: 'how do i stay motivated?' },
            { role: 'assistant', text: 'Motivation is for people who don\'t want it bad enough. If the future doesn\'t excite you, you\'re in the wrong reality.' }
        ]
    },
    {
        persona: {
            name: 'Donald Trump',
            avatar: '🏛️',
            color: '#DC2626'
        },
        messages: [
            { role: 'user', text: 'tips for negotiating?' },
            { role: 'assistant', text: 'Be willing to walk away. It\'s the only leverage that matters. And believe me, nobody makes better deals than me. Nobody.' }
        ]
    }
]

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-2xl rounded-bl-md w-fit">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    )
}

function ChatMessage({ role, text }) {
    return (
        <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-scaleIn origin-bottom`}>
            <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed ${role === 'user'
                        ? 'bg-black text-white rounded-br-md shadow-sm'
                        : 'bg-gray-100 text-black rounded-bl-md shadow-sm'
                    }`}
            >
                {text}
            </div>
        </div>
    )
}

function MobileChatInterface({ persona, messages, startDelay = 0 }) {
    const [visibleMessages, setVisibleMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)

    // Animation sequence states
    // 0: Initial blank
    // 1: User typing (optional, skipped for speed)
    // 2: User message sent
    // 3: Assistant typing
    // 4: Assistant message received

    useEffect(() => {
        let timeouts = []

        // Reset initially
        setVisibleMessages([])
        setIsTyping(false)

        // Step 1: User message appears after startDelay
        timeouts.push(setTimeout(() => {
            setVisibleMessages([messages[0]])
        }, startDelay))

        // Step 2: Assistant starts typing shortly after user text
        timeouts.push(setTimeout(() => {
            setIsTyping(true)
        }, startDelay + 800))

        // Step 3: Assistant finishes typing and message appears
        timeouts.push(setTimeout(() => {
            setIsTyping(false)
            setVisibleMessages([messages[0], messages[1]])
        }, startDelay + 2500)) // 1.7s typing duration

        // Cleanup
        return () => timeouts.forEach(clearTimeout)
    }, [messages, startDelay])

    return (
        <div
            className="w-[260px] md:w-[300px] flex-shrink-0 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-black relative transition-all duration-500 hover:scale-[1.02]"
        >
            {/* Phone Gloss/Reflection */}
            <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10"></div>

            {/* Phone notch area */}
            <div className="bg-white h-7 flex items-center justify-center border-b border-gray-50 relative z-20">
                <div className="w-20 h-4 bg-black rounded-b-xl absolute top-0"></div>
                <div className="w-full flex justify-between px-5 text-[9px] font-bold text-gray-400 mt-1">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <span>5G</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>

            {/* Chat header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm"
                    style={{ backgroundColor: `${persona.color}15` }}
                >
                    {persona.avatar}
                </div>
                <div>
                    <div className="font-bold text-xs text-black">{persona.name}</div>
                    <div className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                    </div>
                </div>
            </div>

            {/* Chat messages area */}
            <div className="bg-white px-4 py-4 h-[220px] flex flex-col gap-3 overflow-y-auto scrollbar-hide">
                {visibleMessages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-300 text-xs italic">
                        Start a conversation...
                    </div>
                )}

                {visibleMessages.map((msg, idx) => (
                    <ChatMessage key={idx} role={msg.role} text={msg.text} />
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-scaleIn origin-bottom">
                        <TypingIndicator />
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div className="bg-gray-50 px-3 py-3 border-t border-gray-100 flex items-center gap-2">
                <div className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-400 shadow-sm">
                    Message...
                </div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-md transform active:scale-90 transition-transform">
                    <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
            </div>

            {/* Home indicator */}
            <div className="bg-white h-5 flex items-center justify-center">
                <div className="w-24 h-1 bg-gray-300 rounded-full mb-1"></div>
            </div>
        </div>
    )
}

export default function HeroChatShowcase() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 py-6 perspective-1000">
            {chatData.map((chat, idx) => (
                <MobileChatInterface
                    key={chat.persona.name}
                    persona={chat.persona}
                    messages={chat.messages}
                    startDelay={idx * 1200 + 500} // Staggered start times
                />
            ))}
        </div>
    )
}
