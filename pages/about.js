import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const OFFERINGS = [
    {
        title: '350+ personas',
        description: 'Spiritual teachers, figures from Indian mythology and history, thinkers, founders and characters from film, anime and games.',
    },
    {
        title: 'Your language',
        description: 'Write in Hindi, English or Hinglish. Most personas reply in the language you use.',
    },
    {
        title: 'Memory',
        description: 'When you are signed in, a persona remembers what you shared in earlier conversations.',
    },
    {
        title: 'Your own personas',
        description: 'Premium members can create a custom persona with its own personality and voice.',
    },
]

export default function About() {
    return (
        <>
            <Head>
                <title>About Us | AI Spirit</title>
                <meta
                    name="description"
                    content="AI Spirit lets you have private conversations with 350+ AI personas, from spiritual teachers to historical figures, in Hindi, English or Hinglish."
                />
                <link rel="canonical" href="https://ai-spirit.in/about" />
                <meta property="og:title" content="About AI Spirit" />
                <meta property="og:description" content="Private conversations with 350+ AI personas, from spiritual teachers to historical figures." />
                <meta property="og:url" content="https://ai-spirit.in/about" />
            </Head>

            <Navbar />

            <main className="min-h-screen bg-white pt-16">
                <section className="pt-20 pb-16 md:pt-28 md:pb-20 px-5 sm:px-8">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="font-display text-5xl md:text-6xl text-black tracking-tight leading-[1.05] mb-6">
                            About AI Spirit
                        </h1>
                        <p className="text-xl text-black/70 leading-relaxed [text-wrap:pretty]">
                            A place to sit with a question you can&apos;t easily ask anyone else, and talk it through with a teacher, a legend or a favourite character.
                        </p>
                    </div>
                </section>

                <section className="py-16 px-5 sm:px-8 bg-[#F7F7F5]">
                    <div className="max-w-2xl mx-auto space-y-5 text-lg text-black/75 leading-relaxed [text-wrap:pretty]">
                        <h2 className="font-display text-3xl text-black mb-6">Why we built it</h2>
                        <p>
                            Guidance is easiest to find when you least need it. At 2 AM, in the middle of a hard week or before a big decision, most people have no one to ask.
                        </p>
                        <p>
                            AI Spirit gives you someone to talk to at those moments. Each persona is written to stay in character, speak in its own voice and remember you, so the conversation feels like it is going somewhere.
                        </p>
                        <p>
                            These are AI personas, not the real people they are inspired by, and they are not a replacement for a doctor, therapist or lawyer.
                        </p>
                    </div>
                </section>

                <section className="py-16 px-5 sm:px-8">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="font-display text-3xl text-black mb-8">What you get</h2>
                        <dl className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
                            {OFFERINGS.map((item) => (
                                <div key={item.title} className="py-5 sm:grid sm:grid-cols-3 sm:gap-6">
                                    <dt className="font-display text-xl text-black mb-1 sm:mb-0">{item.title}</dt>
                                    <dd className="sm:col-span-2 text-black/70 leading-relaxed">{item.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <section className="py-16 px-5 sm:px-8 bg-[#F7F7F5]">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="font-display text-3xl text-black mb-8">Who makes it</h2>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white font-display text-2xl flex-shrink-0" aria-hidden="true">
                                GM
                            </div>
                            <div>
                                <h3 className="font-display text-2xl text-black">Gaurav Mahale</h3>
                                <p className="text-black/60 mb-3">Founder</p>
                                <p className="text-black/75 leading-relaxed mb-4">
                                    Gaurav designs and builds AI Spirit independently, for people across India and beyond.
                                </p>
                                <a
                                    href="https://x.com/mahalegauravk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-black/75 hover:text-black border-b border-black/20 hover:border-black/50 pb-0.5 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    Follow on X
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-5 sm:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="font-display text-4xl text-black mb-4">Ready when you are.</h2>
                        <p className="text-black/65 mb-8">Browsing is free and doesn&apos;t need an account.</p>
                        <Link
                            href="/personas"
                            className="inline-flex items-center rounded-full bg-black px-7 py-3.5 text-[15px] font-medium text-white transition-all duration-300 hover:bg-black/90 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                        >
                            Browse personas
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}
