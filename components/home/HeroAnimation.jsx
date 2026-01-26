import { useState, useEffect } from 'react'

const personas = [
    {
        id: 'osho',
        name: 'Osho',
        avatar: '/personas/osho.jpg',
        fallbackColor: 'from-orange-500 to-red-600',
        initials: 'OS',
        messages: [
            { type: 'user', text: 'How do I find inner peace?' },
            { type: 'ai', text: 'Peace is not something you find. It is something you are. Stop seeking, and you will discover it has always been within you.' },
        ]
    },
    {
        id: 'einstein',
        name: 'Albert Einstein',
        avatar: '/personas/einstein.jpg',
        fallbackColor: 'from-blue-500 to-indigo-600',
        initials: 'AE',
        messages: [
            { type: 'user', text: 'What drives your curiosity?' },
            { type: 'ai', text: 'I have no special talents. I am only passionately curious. The important thing is not to stop questioning.' },
        ]
    },
    {
        id: 'cleopatra',
        name: 'Cleopatra',
        avatar: '/personas/cleopatra.jpg',
        fallbackColor: 'from-amber-500 to-yellow-600',
        initials: 'CL',
        messages: [
            { type: 'user', text: 'How did you lead with such power?' },
            { type: 'ai', text: 'Power is not given, it is taken. I learned every language, mastered every art, and turned my mind into my greatest weapon.' },
        ]
    },
]

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    )
}

function ChatMessage({ message, isVisible, delay = 0 }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => setShow(true), delay)
            return () => clearTimeout(timer)
        } else {
            setShow(false)
        }
    }, [isVisible, delay])

    if (!show) return null

    const isUser = message.type === 'user'

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                isUser
                    ? 'bg-black text-white rounded-br-md'
                    : 'bg-gray-100 text-black rounded-bl-md'
            }`}>
                {message.text}
            </div>
        </div>
    )
}

function PhoneMockup({ persona, isActive }) {
    const [showTyping, setShowTyping] = useState(false)
    const [visibleMessages, setVisibleMessages] = useState(0)

    useEffect(() => {
        if (!isActive) {
            setVisibleMessages(0)
            setShowTyping(false)
            return
        }

        // Animation sequence
        const sequence = async () => {
            // Show first message (user)
            setVisibleMessages(1)

            // Show typing indicator
            await new Promise(r => setTimeout(r, 800))
            setShowTyping(true)

            // Show AI response
            await new Promise(r => setTimeout(r, 1500))
            setShowTyping(false)
            setVisibleMessages(2)
        }

        sequence()
    }, [isActive, persona.id])

    return (
        <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px]">
            {/* Phone frame */}
            <div className="absolute inset-0 bg-black rounded-[3rem] shadow-2xl overflow-hidden">
                {/* Screen */}
                <div className="absolute inset-[3px] bg-white rounded-[2.8rem] overflow-hidden flex flex-col">
                    {/* Status bar */}
                    <div className="h-12 bg-white flex items-center justify-center pt-2">
                        <div className="w-20 h-6 bg-black rounded-full" />
                    </div>

                    {/* Chat header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${persona.fallbackColor} flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
                            {persona.initials}
                        </div>
                        <div>
                            <div className="font-semibold text-black text-sm">{persona.name}</div>
                            <div className="text-xs text-green-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                Online
                            </div>
                        </div>
                    </div>

                    {/* Chat messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-hidden bg-white">
                        {persona.messages.map((msg, i) => (
                            <ChatMessage
                                key={i}
                                message={msg}
                                isVisible={visibleMessages > i}
                                delay={i * 100}
                            />
                        ))}
                        {showTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-2xl rounded-bl-md">
                                    <TypingIndicator />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input area */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent text-sm outline-none text-black placeholder:text-gray-400"
                                disabled
                            />
                            <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Home indicator */}
                    <div className="h-8 flex items-center justify-center bg-white">
                        <div className="w-32 h-1 bg-black/20 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function HeroAnimation() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % personas.length)
        }, 6000)

        return () => clearInterval(interval)
    }, [])

    const currentPersona = personas[currentIndex]

    return (
        <div className="relative flex items-center justify-center">
            {/* Glow effect behind phone */}
            <div
                className={`absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-20 transition-all duration-1000 bg-gradient-to-br ${currentPersona.fallbackColor}`}
            />

            {/* Floating persona indicators */}
            <div className="absolute -left-4 sm:left-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                {personas.map((p, i) => (
                    <button
                        key={p.id}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.fallbackColor} flex items-center justify-center text-white font-semibold text-xs shadow-lg transition-all duration-300 ${
                            i === currentIndex
                                ? 'scale-110 ring-2 ring-white ring-offset-2'
                                : 'opacity-50 hover:opacity-80'
                        }`}
                    >
                        {p.initials}
                    </button>
                ))}
            </div>

            {/* Phone mockup */}
            <div className="relative z-10">
                <PhoneMockup persona={currentPersona} isActive={true} key={currentPersona.id} />
            </div>

            {/* Persona name badge */}
            <div className="absolute -right-4 sm:right-0 bottom-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100">
                <span className="text-sm font-medium text-black">Chatting with </span>
                <span className="text-sm font-bold text-black">{currentPersona.name}</span>
            </div>
        </div>
    )
}
