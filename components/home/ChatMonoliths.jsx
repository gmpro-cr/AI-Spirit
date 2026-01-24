// The "Council" of Monoliths
// 3D Floating chat interfaces arranged in a towering perspective
import { useState, useEffect } from 'react'
import Image from 'next/image'

const monoliths = [
    {
        id: 'astro',
        name: 'Astro Guide',
        role: 'The Guide',
        avatar: '🔮',
        color: '#6B21A8',
        initialMessage: 'The cosmos whispers your name...',
        replyMessage: 'Jupiter aligns with your ambition today.',
        delay: 0,
        position: 'left'
    },
    {
        id: 'elon',
        name: 'Elon Musk',
        role: 'The Visionary',
        avatar: '🚀',
        color: '#1D4ED8',
        initialMessage: 'We need to expand consciousness.',
        replyMessage: 'Mars is not a choice, it is a necessity.',
        delay: 200,
        position: 'center'
    },
    {
        id: 'trump',
        name: 'Donald Trump',
        role: 'The Power',
        avatar: '🏛️',
        color: '#DC2626',
        initialMessage: 'We are going to win so much.',
        replyMessage: 'It’s going to be huge. Believe me.',
        delay: 400,
        position: 'right'
    }
]

function Monolith({ data, isActive }) {
    const [messages, setMessages] = useState([data.initialMessage])

    // Simulated chat loop
    useEffect(() => {
        const loop = setInterval(() => {
            setMessages([data.initialMessage])
            setTimeout(() => setMessages(prev => [...prev, data.replyMessage]), 2000)
        }, 8000 + data.delay)

        return () => clearInterval(loop)
    }, [data])

    return (
        <div
            className={`
        relative w-[280px] h-[500px] bg-white border border-gray-200 
        transition-all duration-1000 ease-out transform preserve-3d
        ${data.position === 'left' ? '-translate-x-12 translate-z-[-100px] rotate-y-[15deg]' : ''}
        ${data.position === 'center' ? 'z-10 translate-z-[50px]' : ''}
        ${data.position === 'right' ? 'translate-x-12 translate-z-[-100px] rotate-y-[-15deg]' : ''}
        hover:translate-z-[100px] hover:rotate-y-0 hover:z-20 shadow-2xl
      `}
        >
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50 pointer-events-none z-20"></div>

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center gap-2 bg-white/95 backdrop-blur">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-50 shadow-inner">
                    {data.avatar}
                </div>
                <div className="text-center">
                    <h3 className="font-display text-2xl text-black">{data.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-gray-400">{data.role}</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="p-4 space-y-4 h-[320px] overflow-hidden bg-gray-50/50 relative">
                {messages.map((msg, i) => (
                    <div key={i} className={`animate-fadeIn p-3 rounded-lg text-sm leading-relaxed ${i % 2 === 0 ? 'bg-white border border-gray-100 ml-auto max-w-[90%]' : 'bg-black text-white mr-auto max-w-[90%]'}`}>
                        {msg}
                    </div>
                ))}
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
                <div className="w-full h-10 bg-gray-50 rounded-full flex items-center px-4 text-xs text-gray-400">
                    Initiate protocol...
                </div>
            </div>
        </div>
    )
}

export default function ChatMonoliths() {
    return (
        <div className="relative h-[600px] w-full flex items-center justify-center perspective-1000 overflow-hidden py-20">
            {/* The Monoliths */}
            <div className="relative flex items-center justify-center -space-x-12 preserve-3d">
                {monoliths.map(m => <Monolith key={m.id} data={m} />)}
            </div>

            {/* The "World" Wireframe Background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[-1] opacity-[0.03]">
                <div className="w-[800px] h-[800px] border border-black rounded-full animate-spin-slow"></div>
                <div className="absolute w-[600px] h-[600px] border border-black rounded-full animate-spin-reverse"></div>
            </div>
        </div>
    )
}
