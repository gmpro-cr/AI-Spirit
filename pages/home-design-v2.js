import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function HomeDesignV2() {
    const router = useRouter()
    // Featured personas for the showcase
    const featuredPersonas = [
        { name: 'Albert Einstein', role: 'Physicist', image: '/personas/albert-einstein.png', quote: "Imagination is more important than knowledge." },
        { name: 'Mahatma Gandhi', role: 'Leader', image: '/personas/mahatma-gandhi.png', quote: "Be the change you wish to see." },
        { name: 'Steve Jobs', role: 'Visionary', image: '/personas/steve-jobs.png', quote: "Stay hungry, stay foolish." }, // Fallback if image missing, will use placeholder style
        { name: 'Elon Musk', role: 'Innovator', image: '/personas/elon-musk.png', quote: "When something is important enough, you do it." },
        { name: 'Astro Guide', role: 'Vedic Astrologer', image: '/personas/astro-guide.png', quote: "The stars align for those who seek." },
        { name: 'Fitness Coach', role: 'Trainer', image: '/personas/fitness-coach.png', quote: "Sweat is just fat crying." },
    ]

    // Filter out Steve Jobs if image likely doesn't exist (using logic or just safe list)
    // Re-using known updated personas for best look
    const activePersonas = [
        { name: 'Astro Guide', role: 'Vedic Wisdom', image: '/personas/astro-guide.png', desc: "Align your life with cosmic rhythms" },
        { name: 'Elon Musk', role: 'Tech Visionary', image: '/personas/elon-musk.png', desc: "Discuss the future of humanity and Mars" },
        { name: 'Narendra Modi', role: 'Leadership', image: '/personas/narendra-modi.png', desc: "Insights on governance and nation building" },
        { name: 'Life Coach', role: 'Growth', image: '/personas/life-coach.png', desc: "Find clarity and purpose in your journey" },
    ]

    return (
        <div className="min-h-screen bg-black-primary text-white overflow-x-hidden selection:bg-purple-500 selection:text-white">
            <Head>
                <title>AI-Spirit | Design V2</title>
            </Head>

            {/* Background Elements - Rich aesthetic mesh gradients */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[100px] animate-moveAround mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[100px] animate-moveAroundAlt mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[20%] w-[20vw] h-[20vw] bg-pink-600/10 rounded-full blur-[80px] animate-float opacity-50"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black-primary/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                            <span className="font-bold text-white text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            AI-Spirit
                        </span>
                    </div>
                    <nav className="hidden md:flex gap-8">
                        <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Personas</a>
                        <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
                        <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</a>
                    </nav>
                    <button className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform">
                        Get Started
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-fadeIn">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-gray-300">Online & Ready to Chat</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                            Chat with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-xy">
                                Legends
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                            Experience timeless wisdom through AI. Converse with history's greatest minds,
                            spiritual guides, and modern visionaries in a deeply immersive interface.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => router.push('/personas')}
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-1"
                            >
                                Start Chatting
                            </button>
                            <button className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-medium text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                                View Demo
                            </button>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs overflow-hidden">
                                        {/* Placeholder avatars */}
                                        <div className={`w-full h-full bg-gradient-to-br from-purple-${i * 100} to-blue-${i * 100}`}></div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400">Joined by <span className="text-white font-semibold">10,000+</span> seekers</p>
                        </div>
                    </div>

                    {/* Hero Visual - Floating Cards */}
                    <div className="relative h-[600px] hidden lg:block perspective-1000">
                        {/* Card 1 */}
                        <div className="absolute top-[10%] right-[10%] w-64 p-4 glass-premium rounded-2xl animate-float" style={{ animationDelay: '0s' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <img src="/personas/albert-einstein.png" className="w-10 h-10 rounded-full object-cover border border-white/20" alt="Einstein" />
                                <div>
                                    <div className="font-bold text-sm">Albert Einstein</div>
                                    <div className="text-xs text-purple-300">Physicist</div>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-300 leading-relaxed">"Look deep into nature, and then you will understand everything better."</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="absolute top-[40%] left-[5%] w-72 p-4 glass-premium rounded-2xl animate-float" style={{ animationDelay: '2s' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <img src="/personas/chanakya.jpg" className="w-10 h-10 rounded-full object-cover border border-white/20 bg-gray-700" alt="Chanakya" onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                                <div>
                                    <div className="font-bold text-sm">Chanakya</div>
                                    <div className="text-xs text-yellow-300">Strategist</div>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-300 leading-relaxed">"A man is great by his deeds, not by his birth."</p>
                            </div>
                        </div>

                        {/* Card 3 - Main Center */}
                        <div className="absolute top-[30%] left-[30%] w-80 p-5 glass-ultra border border-white/20 rounded-3xl shadow-2xl animate-moveAround" style={{ animationDuration: '15s' }}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <img src="/personas/astro-guide.png" className="w-12 h-12 rounded-full object-cover border-2 border-purple-500" alt="Astro Guide" />
                                    <div>
                                        <div className="font-bold text-base">Astro Guide</div>
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                        </div>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="w-full p-3 rounded-2xl rounded-tl-none bg-white/10 text-sm border border-white/5">
                                    What does my career path look like this year?
                                </div>
                                <div className="w-full p-3 rounded-2xl rounded-tr-none bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-sm border border-white/10 shadow-lg">
                                    Based on your chart, Jupiter is entering your house of career. This marks a period of significant growth and new opportunities.
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                                <input type="text" placeholder="Type a message..." className="w-full bg-black/30 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
                                <button className="p-2 rounded-full bg-white text-black hover:bg-gray-200">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Personas */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex md:flex-row flex-col justify-between items-end mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Guide</span></h2>
                            <p className="text-gray-400 max-w-2xl text-lg">Whether you need spiritual clarity, business strategy, or historical perspective, our diverse range of personas are here to help.</p>
                        </div>
                        <button className="text-white border-b border-white pb-1 hover:text-gray-300 transition-colors">View All Personas</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {activePersonas.map((persona, index) => (
                            <div
                                key={index}
                                className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-purple-500/50 hover:to-blue-500/50 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative h-full bg-black-secondary border border-white/10 rounded-xl p-6 overflow-hidden flex flex-col items-center text-center group-hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-24 h-24 mb-6 rounded-full p-1 bg-gradient-to-br from-white/20 to-transparent">
                                        <img src={persona.image} alt={persona.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{persona.name}</h3>
                                    <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase mb-3">{persona.role}</span>
                                    <p className="text-sm text-gray-400 leading-relaxed mb-6">{persona.desc}</p>
                                    <button
                                        onClick={() => router.push('/personas')}
                                        className="mt-auto w-full py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all font-medium text-sm"
                                    >
                                        Chat Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-black-secondary/50 border-y border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16">Why AI-Spirit?</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="space-y-4 group">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-premium">
                                <span className="text-2xl">⚡️</span>
                            </div>
                            <h3 className="text-xl font-bold">Instant Wisdom</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">No waiting list. Connect with the world's greatest minds instantly, 24/7/365.</p>
                        </div>
                        <div className="space-y-4 group">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-premium">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <h3 className="text-xl font-bold">Private & Secure</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Your conversations are private. We use enterprise-grade encryption to protect your data.</p>
                        </div>
                        <div className="space-y-4 group">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-premium">
                                <span className="text-2xl">🧠</span>
                            </div>
                            <h3 className="text-xl font-bold">Deep Context</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Our AI models are trained on extensive historical data to provide authentic, deep responses.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-500 text-sm">© 2025 AI-Spirit. Crafted with ❤️ for seekers.</div>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
