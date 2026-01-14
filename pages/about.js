import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function About() {
    return (
        <>
            <Head>
                <title>About Us | AI - Spirit</title>
                <meta
                    name="description"
                    content="Learn about AI - Spirit - your personal AI coach for parenting, wellness, relationships, and more. Discover our mission to make expert guidance accessible to everyone."
                />
                <link rel="canonical" href="https://ai-spirit.in/about" />
                <meta property="og:title" content="About AI - Spirit" />
                <meta property="og:description" content="Learn about AI - Spirit and our mission to make expert guidance accessible to everyone." />
                <meta property="og:url" content="https://ai-spirit.in/about" />
            </Head>

            <Navbar />

            <main className="min-h-screen bg-white pt-16 transition-colors">
                {/* Hero Section */}
                <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight mb-6">
                            About <span className="italic">AI</span> - Spirit
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed">
                            Making expert guidance accessible to everyone, anytime.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">
                            Our Mission
                        </h2>
                        <div className="prose prose-lg text-gray-600 space-y-6">
                            <p className="leading-relaxed">
                                AI - Spirit was created with a simple belief: everyone deserves access to
                                thoughtful guidance and support, regardless of time, location, or budget.
                            </p>
                            <p className="leading-relaxed">
                                We&apos;ve built a collection of AI personas—each designed to provide helpful,
                                empathetic conversations on topics ranging from parenting and mental wellness
                                to relationships, career guidance, and everyday life challenges.
                            </p>
                            <p className="leading-relaxed">
                                Whether you&apos;re a first-time parent looking for advice at 2 AM, someone
                                seeking wellness tips, or just want to explore new recipes, our AI personas
                                are here to help—24/7, with no judgment.
                            </p>
                        </div>
                    </div>
                </section>

                {/* What We Offer Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-black mb-10">
                            What We Offer
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: '40+ AI Personas',
                                    description: 'Expert-designed personas covering parenting, wellness, relationships, career, and more.'
                                },
                                {
                                    title: '24/7 Availability',
                                    description: 'Get guidance whenever you need it—day or night, weekday or weekend.'
                                },
                                {
                                    title: 'Create Your Own',
                                    description: 'Design custom personas tailored to your specific needs and preferences.'
                                },
                                {
                                    title: 'Private & Secure',
                                    description: 'Your conversations are private. We respect your data and privacy.'
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                                >
                                    <h3 className="text-lg font-semibold text-black mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Founder Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">
                            Meet the Founder
                        </h2>
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-soft">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                                    GM
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-bold text-black mb-2">Gaurav Mahale</h3>
                                    <p className="text-gray-500 mb-4">Founder & Creator</p>
                                    <p className="text-gray-600 leading-relaxed mb-4">
                                        Passionate about making AI accessible and helpful for everyone.
                                        Building AI - Spirit to provide thoughtful guidance and support
                                        to people across India and beyond.
                                    </p>
                                    <a
                                        href="https://x.com/mahalegauravk"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        Follow on X
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-gray-400 mb-10">
                            Start chatting with our AI personas—it&apos;s free to try.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-white text-black font-medium px-8 py-4 rounded-2xl shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
                        >
                            Browse Personas
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}
