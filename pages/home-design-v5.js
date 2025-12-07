import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function HomeDesignV5() {
    const router = useRouter();

    const featured = [
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
                <title>AI‑Spirit – Discover Your AI Companion</title>
                <meta name="description" content="Minimalistic B2C landing page for AI‑Spirit – chat with legendary minds and professional guides." />
            </Head>

            <main className="min-h-screen bg-white text-black font-sans">
                {/* Hero */}
                <section className="py-20 px-4 md:px-8 lg:px-16 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                        Meet Your AI Companion
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Chat with legendary thinkers, professional mentors, and more – all powered by AI.
                    </p>
                    <button
                        onClick={() => router.push('/personas')}
                        className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Start Chatting
                    </button>
                </section>

                {/* Featured Personas */}
                <section className="py-12 bg-gray-50">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
                        Featured Personas
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto px-4">
                        {featured.map((p) => (
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

                {/* Call to Action */}
                <section className="py-20 text-center">
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
