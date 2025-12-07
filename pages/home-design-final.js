import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function HomeDesignFinal() {
    const router = useRouter();
    const personas = [
        { name: 'Astro Guide', slug: 'astro-guide', img: '/personas/astro-guide.png' },
        { name: 'Career Mentor', slug: 'career-mentor', img: '/personas/career-mentor.png' },
        { name: 'Fitness Coach', slug: 'fitness-coach', img: '/personas/fitness-coach.png' },
        { name: 'Life Coach', slug: 'life-coach', img: '/personas/life-coach.png' },
        { name: 'Money Manager', slug: 'money-manager', img: '/personas/money-manager.png' },
        { name: 'Travel Guide', slug: 'travel-guide', img: '/personas/travel-guide.png' },
    ];

    const features = [
        { title: 'Authentic Conversations', description: 'Chat with legendary thinkers and professional mentors.', icon: '💬' },
        { title: 'Instant Access', description: 'No appointments, no waiting – start anytime.', icon: '⚡' },
        { title: 'Privacy First', description: 'Your conversations are private and secure.', icon: '🔒' },
    ];

    return (
        <>
            <Head>
                <title>AI‑Spirit – Ultra Clean Landing</title>
                <meta name="description" content="A minimalist single‑screen landing page with video background, hero CTA, featured personas, and highlights." />
            </Head>

            {/* Full‑screen video background */}
            <section className="relative min-h-screen bg-white text-black font-sans overflow-hidden">
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/videos/hero-placeholder.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-white bg-opacity-70" />

                {/* Content */}
                <div className="relative flex flex-col items-center justify-center h-full text-center px-4">
                    {/* Hero */}
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        AI‑Spirit
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
                        Talk with legendary thinkers and professional mentors – powered by AI.
                    </p>
                    <button
                        onClick={() => router.push('/personas')}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Start Chatting
                    </button>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center px-4">
                    {features.map((f, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="text-4xl mb-3">{f.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                            <p className="text-gray-600 text-sm">{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Personas Grid */}
            <section className="py-12 bg-white">
                <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
                    Featured Personas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto px-4">
                    {personas.map((p) => (
                        <div
                            key={p.slug}
                            className="group cursor-pointer text-center"
                            onClick={() => router.push(`/personas/${p.slug}`)}
                        >
                            <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border border-gray-200 transition-transform transform group-hover:scale-105">
                                <img src={p.img} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-filter" />
                            </div>
                            <p className="font-medium text-sm md:text-base text-gray-800 group-hover:text-black transition-colors">
                                {p.name}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-gray-100 text-center">
                <p className="text-sm text-gray-600">© 2025 AI‑Spirit. All rights reserved.</p>
            </footer>
        </>
    );
}
