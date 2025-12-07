import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function HomeDesignV4() {
    const router = useRouter()
    const [activePersona, setActivePersona] = useState(0)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    // Enhanced Persona Data
    const personas = [
        {
            id: 0,
            name: 'Albert Einstein',
            role: 'The Physicist',
            tag: 'Science',
            image: '/personas/albert-einstein.png',
            color: 'bg-indigo-100',
            text: 'text-indigo-600',
            quote: "Imagination is everything. It is the preview of life's coming attractions."
        },
        {
            id: 1,
            name: 'Mahatma Gandhi',
            role: 'The Leader',
            tag: 'Peace',
            image: '/personas/mahatma-gandhi.png',
            color: 'bg-orange-100',
            text: 'text-orange-600',
            quote: "Strength does not come from physical capacity. It comes from an indomitable will."
        },
        {
            id: 2,
            name: 'Elon Musk',
            role: 'The Visionary',
            tag: 'Innovation',
            image: '/personas/elon-musk.png',
            color: 'bg-blue-100',
            text: 'text-blue-600',
            quote: "I could either watch it happen or be a part of it."
        },
        {
            id: 3,
            name: 'Astro Guide',
            role: 'The Oracle',
            tag: 'Spirituality',
            image: '/personas/astro-guide.png',
            color: 'bg-purple-100',
            text: 'text-purple-600',
            quote: "The universe is not outside of you. Look inside yourself; everything that you want, you already are."
        },
        {
            id: 4,
            name: 'Steve Jobs',
            role: 'The Creator',
            tag: 'Design',
            image: '/personas/steve-jobs.png',
            color: 'bg-gray-200',
            text: 'text-gray-800',
            quote: "Design is not just what it looks like and feels like. Design is how it works."
        },
    ]

    // Mouse move effect for subtle parallax
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-black font-sans overflow-x-hidden selection:bg-black selection:text-white">
            <Head>
                <title>AI-Spirit | Interactive</title>
            </Head>

            {/* Nav */}
            <nav className="fixed w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-black pointer-events-none">
                <div className="pointer-events-auto cursor-pointer font-bold text-xl tracking-tighter">AI-S.</div>
                <button
                    onClick={() => router.push('/personas')}
                    className="pointer-events-auto px-6 py-2 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform text-sm"
                >
                    Launch App
                </button>
            </nav>

            {/* Hero Section: Split Layout with Interactive List */}
            <section className="min-h-screen flex flex-col lg:flex-row relative">

                {/* Left: The List (Navigation) */}
                <div className="w-full lg:w-1/2 pt-32 pb-12 px-6 lg:pl-20 lg:pr-12 flex flex-col justify-center relative z-10">
                    <h1 className="text-sm font-bold tracking-widest uppercase mb-12 text-gray-400">Select your guide</h1>

                    <div className="space-y-2">
                        {personas.map((p, index) => (
                            <div
                                key={p.id}
                                onMouseEnter={() => setActivePersona(index)}
                                className="group cursor-pointer py-4 border-b border-gray-100 hover:border-gray-300 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-baseline gap-4">
                                    <span className={`text-xs font-mono transition-colors ${activePersona === index ? 'text-black' : 'text-gray-300'}`}>
                                        0{index + 1}
                                    </span>
                                    {/* Name - Scales up on active */}
                                    <span className={`text-4xl md:text-5xl lg:text-6xl font-bold transition-all duration-300 ${activePersona === index ? 'translate-x-4 opacity-100' : 'opacity-40 hover:opacity-70'}`}>
                                        {p.name}
                                    </span>
                                </div>
                                {/* Arrow reveals on hover */}
                                <span className={`opacity-0 -translate-x-4 transition-all duration-300 ${activePersona === index ? 'opacity-100 translate-x-0' : ''}`}>
                                    →
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: The Visual (Sticky) */}
                <div className="hidden lg:flex w-1/2 h-screen px-12 items-center justify-center fixed right-0 top-0 bg-[#F5F5F0]">
                    {/* Background decorative blob */}
                    <div
                        className={`absolute w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-700 opacity-60 ${personas[activePersona].color}`}
                        style={{ transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px)` }}
                    ></div>

                    {/* The Image Card */}
                    <div className="relative z-10 w-[400px] h-[500px] transition-all duration-500 ease-out" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
                        {/* Image Container with Reveal Effect */}
                        <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl relative bg-white">
                            <img
                                key={activePersona} // Triggers animation on change
                                src={personas[activePersona].image}
                                alt={personas[activePersona].name}
                                className="w-full h-full object-cover animate-scaleIn"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/400x500'}
                            />

                            {/* Overlay Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white pt-24">
                                <div className="uppercase tracking-widest text-xs font-bold mb-2 opacity-70">{personas[activePersona].tag}</div>
                                <div className="text-2xl font-serif italic leading-relaxed">"{personas[activePersona].quote}"</div>
                            </div>
                        </div>

                        {/* Decorative Circle Ring */}
                        <div className="absolute -z-10 -top-12 -right-12 w-32 h-32 rounded-full border-2 border-gray-900/10 animate-spin-slow"></div>
                    </div>
                </div>
            </section>

            {/* Marquee Section */}
            <div className="bg-black py-6 overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-moveAround text-white/90 text-sm font-bold tracking-[0.2em] uppercase">
                    Start your journey • Wisdom Reimagined • Talk to Legends • Ask Anything • Privacy First •
                    Start your journey • Wisdom Reimagined • Talk to Legends • Ask Anything • Privacy First •
                </div>
            </div>

            {/* Bento Grid Features - "Out of the box" layout */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-8xl font-black mb-16 text-gray-100 uppercase leading-[0.8]">
                        Beyond <br /><span className="text-black">Chat.</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                        {/* Large Block */}
                        <div className="md:col-span-2 md:row-span-2 bg-[#F3F4F6] rounded-[2rem] p-10 flex flex-col justify-between group hover:bg-black hover:text-white transition-colors duration-500 overflow-hidden relative cursor-pointer" onClick={() => router.push('/personas')}>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-4">The new way to search.</h3>
                                <p className="text-lg opacity-70 max-w-sm">Why google when you can ask Einstein directly? Experience search through the lens of genius.</p>
                            </div>
                            <div className="border border-current rounded-full px-6 py-3 w-fit mt-8 relative z-10 font-medium">Try Einstein →</div>

                            {/* Hover Image */}
                            <img src="/personas/albert-einstein.png" className="absolute -bottom-20 -right-20 w-80 h-80 object-cover rounded-full opacity-10 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                        </div>

                        {/* Tall Block */}
                        <div className="bg-[#FFF8F0] rounded-[2rem] p-8 flex flex-col justify-center items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-6xl mb-4">🔮</div>
                            <h3 className="text-xl font-bold mb-2">Vedic Insights</h3>
                            <p className="text-sm text-gray-500">Ancient wisdom for modern problems.</p>
                        </div>

                        {/* Wide Block */}
                        <div className="bg-[#F0F7FF] rounded-[2rem] p-8 flex flex-col justify-center hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-[50px] mix-blend-multiply"></div>
                            <h3 className="text-xl font-bold mb-2 relative z-10">24/7 Availability</h3>
                            <p className="text-sm text-gray-500 relative z-10">Your mentors never sleep.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-32 px-6 flex flex-col items-center text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to awaken?</h2>
                <button
                    onClick={() => router.push('/personas')}
                    className="px-12 py-5 bg-black text-white text-xl rounded-full font-bold hover:scale-105 transition-transform shadow-2xl shadow-black/20"
                >
                    Get Started Now
                </button>
            </section>

        </div>
    )
}
