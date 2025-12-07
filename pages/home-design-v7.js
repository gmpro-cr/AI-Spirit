import Head from 'next/head';
import { useRouter } from 'next/router';

export default function HomeDesignV7() {
    const router = useRouter();
    return (
        <>
            <Head>
                <title>AI‑Spirit – Minimalist Landing</title>
                <meta name="description" content="A clean black‑and‑white landing page with video background for AI‑Spirit." />
            </Head>
            <main className="relative min-h-screen bg-white text-black font-sans overflow-hidden">
                {/* Video background */}
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
                <div className="relative flex flex-col items-center justify-center h-full text-center p-4">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                        AI‑Spirit
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-xl mb-8">
                        Chat with legendary thinkers and professional mentors – all powered by AI.
                    </p>
                    <button
                        onClick={() => router.push('/personas')}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Start Chatting
                    </button>
                </div>
            </main>
        </>
    );
}
