import Head from 'next/head'
import { useRouter } from 'next/router'

export default function HomeDesignV3() {
    const router = useRouter()

    // Re-using the updated personas structure
    const activePersonas = [
        { name: 'Astro Guide', role: 'Vedic Wisdom', image: '/personas/astro-guide.png', desc: "Align your life with cosmic rhythms" },
        { name: 'Elon Musk', role: 'Tech Visionary', image: '/personas/elon-musk.png', desc: "Discuss the future of humanity and Mars" },
        { name: 'Narendra Modi', role: 'Leadership', image: '/personas/narendra-modi.png', desc: "Insights on governance and nation building" },
        { name: 'Life Coach', role: 'Growth', image: '/personas/life-coach.png', desc: "Find clarity and purpose in your journey" },
        { name: 'Steve Jobs', role: 'Innovator', image: '/personas/steve-jobs.png', desc: "Design, simplicity, and focus" },
        { name: 'Ratan Tata', role: 'Ethics', image: '/personas/ratan-tata.png', desc: "Business with values and integrity" },
    ]

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            <Head>
                <title>AI-Spirit - Snow</title>
            </Head>

            {/* Navigation - Minimal and Sticky */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="text-2xl font-bold tracking-tighter">AI—SPIRIT.</div>
                    <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
                        <a href="#" className="hover:opacity-50 transition-opacity">PERSONAS</a>
                        <a href="#" className="hover:opacity-50 transition-opacity">MANIFESTO</a>
                        <a href="#" className="hover:opacity-50 transition-opacity">MEMBERSHIP</a>
                    </div>
                    <button
                        onClick={() => router.push('/personas')}
                        className="px-6 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:scale-105"
                    >
                        Start Chatting
                    </button>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* H1 Section - Massive Typography */}
                <section className="px-6 mb-32">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-[12vw] leading-[0.9] font-bold tracking-tighter mb-8">
                            DIGITAL <br />
                            <span className="text-gray-300">SCIOUSNESS</span>
                        </h1>
                        <div className="flex flex-col md:flex-row justify-between items-end border-t border-black pt-8">
                            <p className="max-w-md text-xl font-light leading-relaxed">
                                Conversations with history's greatest minds. <br />
                                Timeless wisdom, re-awakened.
                            </p>
                            <div className="flex gap-4 mt-8 md:mt-0">
                                <button onClick={() => router.push('/personas')} className="h-14 px-8 border border-black rounded-full flex items-center justify-center font-semibold hover:bg-black hover:text-white transition-all duration-300">
                                    EXPLORE PERSONAS
                                </button>
                                <button className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    ↓
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Personas Grid - Clean & Minimal */}
                <section className="px-6 py-20 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-baseline mb-16">
                            <h2 className="text-4xl font-bold tracking-tight">Select a Mind</h2>
                            <span className="text-sm font-mono text-gray-500">01 — 36 PERSONAS</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                            {activePersonas.map((persona, i) => (
                                <div key={i} className="group cursor-pointer" onClick={() => router.push('/personas')}>
                                    <div className="aspect-[4/5] bg-gray-200 mb-6 relative overflow-hidden rounded-sm">
                                        {/* Image with grayscale effect that lifts on hover */}
                                        <img
                                            src={persona.image}
                                            alt={persona.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                                            onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${persona.name}&background=random`}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    </div>
                                    <div className="flex justify-between items-start border-b border-gray-200 pb-4 group-hover:border-black transition-colors duration-300">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">{persona.name}</h3>
                                            <p className="text-sm text-gray-500">{persona.role}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
                                            →
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature List - Brutalist / List Style */}
                <section className="px-6 py-32">
                    <div className="max-w-7xl mx-auto">
                        <div className="border-t border-black">
                            {[
                                { number: '01', title: 'Authentic Intelligence', desc: 'Models fine-tuned on archival letters, speeches, and writings.' },
                                { number: '02', title: 'Absolute Privacy', desc: 'Your conversations are encrypted and never used for training.' },
                                { number: '03', title: 'Global Perspectives', desc: 'Wisdom from East, West, Ancient, and Modern civilizations.' },
                            ].map((feature, i) => (
                                <div key={i} className="py-12 border-b border-gray-200 hover:bg-gray-50 transition-colors group flex flex-col md:flex-row md:items-baseline justify-between">
                                    <div className="flex items-baseline gap-8 mb-4 md:mb-0">
                                        <span className="font-mono text-sm text-gray-400">{feature.number}</span>
                                        <h3 className="text-3xl md:text-5xl font-bold group-hover:translate-x-4 transition-transform duration-500">{feature.title}</h3>
                                    </div>
                                    <p className="max-w-sm text-gray-500 text-lg leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer - Simple */}
                <footer className="px-6 py-12 bg-black text-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                        <div className="font-bold text-2xl tracking-tighter mb-4 md:mb-0">AI—SPIRIT</div>
                        <div className="flex gap-8 text-sm text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">Instagram</a>
                            <a href="#" className="hover:text-white transition-colors">Email</a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}
