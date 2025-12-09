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

            <main className="min-h-screen bg-white pt-16">
                {/* Hero Section */}
                <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-6">
                            About <span className="italic">AI</span> - Spirit
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Making expert guidance accessible to everyone, anytime.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
                            Our Mission
                        </h2>
                        <div className="prose prose-lg text-gray-600 space-y-4">
                            <p>
                                AI - Spirit was created with a simple belief: everyone deserves access to
                                thoughtful guidance and support, regardless of time, location, or budget.
                            </p>
                            <p>
                                We&apos;ve built a collection of AI personas—each designed to provide helpful,
                                empathetic conversations on topics ranging from parenting and mental wellness
                                to relationships, career guidance, and everyday life challenges.
                            </p>
                            <p>
                                Whether you&apos;re a first-time parent looking for advice at 2 AM, someone
                                seeking wellness tips, or just want to explore new recipes, our AI personas
                                are here to help—24/7, with no judgment.
                            </p>
                        </div>
                    </div>
                </section>

                {/* What We Offer Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">
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
                                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                                >
                                    <h3 className="text-lg font-semibold text-black mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-gray-300 mb-8">
                            Start chatting with our AI personas—it&apos;s free to try.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
