import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function HomeDesignV6() {
    const router = useRouter();
    const personas = [
        { name: 'Astro Guide', slug: 'astro-guide', img: '/personas/astro-guide.png' },
        { name: 'Career Mentor', slug: 'career-mentor', img: '/personas/career-mentor.png' },
        { name: 'Fitness Coach', slug: 'fitness-coach', img: '/personas/fitness-coach.png' },
        { name: 'Life Coach', slug: 'life-coach', img: '/personas/life-coach.png' },
        { name: 'Money Manager', slug: 'money-manager', img: '/personas/money-manager.png' },
        { name: 'Travel Guide', slug: 'travel-guide', img: '/personas/travel-guide.png' },
    ];
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((c) => (c + 1) % personas.length);
    const prev = () => setCurrent((c) => (c - 1 + personas.length) % personas.length);

    return (
        <>
            <Head>
                <title>AI‑Spirit – Minimalist B2C Landing</title>
                <meta name="description" content="A sleek black‑and‑white split‑screen landing page for AI‑Spirit." />
            </Head>
            <main className="min-h-screen bg-white text-black font-sans flex flex-col md:flex-row">
                {/* Left side – Hero */}
                <section className="md:w-1/2 flex flex-col justify-center items-start p-8 md:p-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">AI‑Spirit</h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-md">
                        Converse with legendary minds and professional mentors – all powered by AI.
                    </p>
                    <button
                        onClick={() => router.push('/personas')}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Start Chatting
                    </button>
                </section>
                {/* Right side – Persona carousel */}
                <section className="md:w-1/2 flex items-center justify-center bg-gray-50 p-4">
                    <div className="relative w-48 h-48">
                        <Image
                            src={personas[current].img}
                            alt={personas[current].name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full border border-gray-200"
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                        <button onClick={prev} className="text-2xl text-gray-600 hover:text-black">←</button>
                        <button onClick={next} className="text-2xl text-gray-600 hover:text-black">→</button>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="font-medium text-sm text-gray-800">{personas[current].name}</p>
                    </div>
                </section>
            </main>
        </>
    );
}
