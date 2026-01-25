// The "Council" of Monoliths
// Chat interfaces arranged in a clean, modern layout
import { useState, useEffect } from 'react'

const monoliths = [
    {
        id: 'astro',
        name: 'Astro Guide',
        role: 'The Guide',
        initials: 'AG',
        color: 'from-purple-600 to-indigo-700',
        initialMessage: 'The cosmos whispers your name...',
        replyMessage: 'Jupiter aligns with your ambition today.',
        delay: 0,
    },
    {
        id: 'elon',
        name: 'Elon Musk',
        role: 'The Visionary',
        initials: 'EM',
        color: 'from-blue-600 to-cyan-600',
        initialMessage: 'We need to expand consciousness.',
        replyMessage: 'Mars is not a choice, it is a necessity.',
        delay: 200,
    },
    {
        id: 'trump',
        name: 'Donald Trump',
        role: 'The Power',
        initials: 'DT',
        color: 'from-red-600 to-orange-500',
        initialMessage: 'We are going to win so much.',
        replyMessage: "It's going to be huge. Believe me.",
        delay: 400,
    }
]

function Monolith({ data, index }) {
    const [messages, setMessages] = useState([data.initialMessage])

    // Simulated chat loop
    useEffect(() => {
        const loop = setInterval(() => {
            setMessages([data.initialMessage])
            setTimeout(() => setMessages(prev => [...prev, data.replyMessage]), 2000)
        }, 8000 + data.delay)

        return () => clearInterval(loop)
    }, [data])

    // Calculate position for 3D-like arrangement
    const getPositionStyles = () => {
        if (index === 0) {
            return {
                transform: 'translateX(-20px) scale(0.95)',
                zIndex: 10,
            }
        }
        if (index === 1) {
            return {
                transform: 'translateY(-10px) scale(1)',
                zIndex: 20,
            }
        }
        if (index === 2) {
            return {
                transform: 'translateX(20px) scale(0.95)',
                zIndex: 10,
            }
        }
        return {}
    }

    return (
        <div
            className="relative w-[260px] sm:w-[280px] bg-white border border-gray-200 rounded-2xl overflow-hidden
                       shadow-soft-lg hover:shadow-soft-xl transition-all duration-500 hover:scale-[1.02]"
            style={getPositionStyles()}
        >
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-60 pointer-events-none z-10 rounded-2xl"></div>

            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex flex-col items-center gap-3 bg-white">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${data.color} shadow-soft`}>
                    {data.initials}
                </div>
                <div className="text-center">
                    <h3 className="font-display text-xl text-black">{data.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-black/40 mt-1">{data.role}</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="p-4 space-y-3 h-[280px] overflow-hidden bg-gray-50/50 relative">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`animate-fadeIn p-3 rounded-xl text-sm leading-relaxed ${
                            i % 2 === 0
                                ? 'bg-white border border-gray-100 ml-auto max-w-[90%] text-black/80'
                                : 'bg-black text-white mr-auto max-w-[90%]'
                        }`}
                    >
                        {msg}
                    </div>
                ))}
                {/* Subtle noise texture - self-hosted */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="w-full h-10 bg-gray-50 rounded-full flex items-center px-4 text-xs text-black/30">
                    Type a message...
                </div>
            </div>
        </div>
    )
}

export default function ChatMonoliths() {
    return (
        <div className="relative w-full flex items-center justify-center py-8 md:py-16">
            {/* The Monoliths - responsive grid */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 md:-space-x-8">
                {monoliths.map((m, index) => (
                    <Monolith key={m.id} data={m} index={index} />
                ))}
            </div>

            {/* Subtle background elements */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[-1]">
                <div className="w-[500px] h-[500px] border border-black/[0.03] rounded-full"></div>
                <div className="absolute w-[400px] h-[400px] border border-black/[0.02] rounded-full"></div>
            </div>
        </div>
    )
}
