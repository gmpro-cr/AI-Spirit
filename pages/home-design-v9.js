import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function HomeDesignV9() {
    const router = useRouter();
    const personas = [
        { name: 'Astro Guide', slug: 'astro-guide', img: '/personas/astro-guide.png' },
        { name: 'Career Mentor', slug: 'career-mentor', img: '/personas/career-mentor.png' },
        { name: 'Fitness Coach', slug: 'fitness-coach', img: '/personas/fitness-coach.png' },
        { name: 'Life Coach', slug: 'life-coach', img: '/personas/life-coach.png' },
        { name: 'Money Manager', slug: 'money-manager', img: '/personas/money-manager.png' },
        { name: 'Travel Guide', slug: 'travel-guide', img: '/personas/travel-guide.png' },
    ];

    return (
        <>
            <Head>
                <title>AI‑Spirit – Clean B2C Landing</title>
                <meta name="description" content="A sleek, minimal black‑and‑white landing page for AI‑Spirit with a bold hero and subtle interactions." />
            </Head>

            <main className="font-sans text-black bg-white min-h-screen flex flex-col">
                {/* Hero */}
                <section className="relative flex-1 flex items-center justify-center text-center p-8 bg-gradient-to-b from-white to-gray-50">
                    <div className="z-10 max-w-2xl">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                            AI‑Spirit
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8">
                            Talk with legendary thinkers and professional mentors – powered by AI.
                        </p>
                        <button
                            onClick={() => router.push('/personas')}
                            className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
                        >
                            Start Chatting
                        </button>
                    </div>
                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </section>

                {/* Featured Personas */}
                <section className="py-12 bg-gray-50">
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
                                    <Image src={p.img} alt={p.name} layout="fill" objectFit="cover" className="grayscale group-hover:grayscale-0 transition-filter" />
                                </div>
                                <p className="font-medium text-sm md:text-base text-gray-800 group-hover:text-black transition-colors">
                                    {p.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="py-20 text-center bg-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        Ready to explore?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                        Dive into a world of knowledge and guidance. Whether you need inspiration, advice, or just a friendly chat, AI‑Spirit is here for you.
                    </p>
                    <button
                        onClick={() => router.push('/personas')}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors"
                    >
                        Explore Personas
                    </button>
                </section>
            </main>
        </>
    );
}
