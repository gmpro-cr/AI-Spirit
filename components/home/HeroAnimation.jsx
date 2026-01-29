import { useState, useEffect } from 'react'
import Image from 'next/image'

const personas = [
    {
        id: 'osho',
        name: 'Osho',
        image: '/personas/osho.png',
        fallbackColor: 'from-orange-500 to-red-600',
        initials: 'OS',
        category: 'Spiritual Guide',
        messages: [
            { type: 'user', text: 'How do I find inner peace?' },
            { type: 'ai', text: 'Peace is not something you find. It is something you are. Stop seeking, and you will discover it has always been within you.' },
        ]
    },
    {
        id: 'elon',
        name: 'Elon Musk',
        image: '/personas/elon-musk.png',
        fallbackColor: 'from-blue-500 to-cyan-600',
        initials: 'EM',
        category: 'Tech Visionary',
        messages: [
            { type: 'user', text: 'What keeps you motivated?' },
            { type: 'ai', text: 'I think about the future and I want it to be exciting. If we don\'t make it exciting, what\'s the point of living?' },
        ]
    },
    {
        id: 'sherlock',
        name: 'Sherlock Holmes',
        image: '/personas/sherlock-holmes.png',
        fallbackColor: 'from-slate-600 to-gray-800',
        initials: 'SH',
        category: 'Fictional Detective',
        messages: [
            { type: 'user', text: 'How do you solve mysteries?' },
            { type: 'ai', text: 'When you have eliminated the impossible, whatever remains, however improbable, must be the truth. Observe, deduce, never assume.' },
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

function PersonaAvatar({ persona, size = 'md', className = '' }) {
    const [imgError, setImgError] = useState(false)

    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-14 h-14'
    }

    if (imgError) {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${persona.fallbackColor} flex items-center justify-center text-white font-semibold text-sm shadow-md ${className}`}>
                {persona.initials}
            </div>
        )
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-md ${className}`}>
            <Image
                src={persona.image}
                alt={persona.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
            />
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
                        <PersonaAvatar persona={persona} size="sm" />
                        <div>
                            <div className="font-semibold text-black text-sm">{persona.name}</div>
                            <div className="text-xs text-black/40">{persona.category}</div>
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
            {/* Phone mockup */}
            <div className="relative">
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
