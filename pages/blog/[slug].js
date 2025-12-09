import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Sample blog content - in production, this would come from a CMS or database
const BLOG_CONTENT = {
    'introduction-to-ai-spirit': {
        title: 'Welcome to AI - Spirit: Your Personal AI Coach',
        date: '2024-12-01',
        category: 'Announcements',
        readTime: '3 min read',
        content: `
      <p>We're excited to introduce AI - Spirit, a platform designed to bring expert guidance to your fingertips through conversational AI personas.</p>
      
      <h2>What is AI - Spirit?</h2>
      <p>AI - Spirit is a collection of AI-powered personas, each designed to help you with different aspects of life. Whether you need parenting advice at 2 AM, wellness tips during a stressful day, or relationship guidance, our personas are available 24/7.</p>
      
      <h2>Why We Built This</h2>
      <p>We believe everyone deserves access to thoughtful guidance and support. Traditional coaching and counseling can be expensive and not always available when you need it most. AI - Spirit bridges that gap.</p>
      
      <h2>Getting Started</h2>
      <p>Simply browse our personas, pick one that matches your needs, and start chatting. It's free to try, and you can create your own custom personas too!</p>
    `,
    },
    'how-ai-personas-work': {
        title: 'How AI Personas Work: The Technology Behind AI - Spirit',
        date: '2024-11-15',
        category: 'Technology',
        readTime: '5 min read',
        content: `
      <p>Ever wondered how our AI personas provide such contextual and helpful responses? Let's dive into the technology.</p>
      
      <h2>The Foundation</h2>
      <p>Our personas are built on advanced large language models that have been carefully prompted and tuned to embody specific expertise areas and communication styles.</p>
      
      <h2>Context Awareness</h2>
      <p>Each persona maintains conversation context, remembering what you've discussed and building on previous exchanges to provide more relevant advice.</p>
      
      <h2>Safety First</h2>
      <p>We've implemented multiple safety layers to ensure conversations remain helpful and appropriate. Our personas are designed to provide supportive guidance while encouraging professional help when needed.</p>
    `,
    },
    'parenting-tips-from-ai': {
        title: '5 Ways AI Can Support Your Parenting Journey',
        date: '2024-11-01',
        category: 'Parenting',
        readTime: '4 min read',
        content: `
      <p>Parenting is one of the most rewarding yet challenging journeys. Here's how AI-powered coaches can support you along the way.</p>
      
      <h2>1. 24/7 Availability</h2>
      <p>Parenting questions don't follow a 9-to-5 schedule. Our Parenting Coach is available whenever you need guidance, whether it's midnight feeding challenges or early morning tantrums.</p>
      
      <h2>2. Judgment-Free Zone</h2>
      <p>AI coaches provide a safe space to ask any question without fear of judgment. Every parent has questions they might feel embarrassed to ask others.</p>
      
      <h2>3. Consistent Guidance</h2>
      <p>Get consistent, evidence-based advice that aligns with modern parenting research and practices.</p>
      
      <h2>4. Personalized Support</h2>
      <p>Our AI learns your communication style and preferences, providing increasingly tailored advice over time.</p>
      
      <h2>5. Quick Answers</h2>
      <p>Sometimes you need a quick answer, not a long article to read. Chat-based guidance gets you answers in seconds.</p>
    `,
    },
}

export default function BlogPost() {
    const router = useRouter()
    const { slug } = router.query

    // Handle loading state
    if (!slug || !BLOG_CONTENT[slug]) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-white pt-16 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-black mb-4">Post not found</h1>
                        <Link href="/blog" className="text-gray-600 hover:underline">
                            ← Back to Blog
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const post = BLOG_CONTENT[slug]

    return (
        <>
            <Head>
                <title>{post.title} | AI - Spirit Blog</title>
                <meta name="description" content={post.title} />
                <link rel="canonical" href={`https://ai-spirit.in/blog/${slug}`} />
                <meta property="og:title" content={post.title} />
                <meta property="og:url" content={`https://ai-spirit.in/blog/${slug}`} />
                <meta property="og:type" content="article" />
            </Head>

            <Navbar />

            <main className="min-h-screen bg-white pt-16">
                <article className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Back link */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors"
                        >
                            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Blog
                        </Link>

                        {/* Post header */}
                        <header className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {post.category}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{post.readTime}</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
                                {post.title}
                            </h1>
                        </header>

                        {/* Post content */}
                        <div
                            className="prose prose-lg max-w-none prose-headings:text-black prose-headings:font-bold prose-p:text-gray-600 prose-a:text-black prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* CTA */}
                        <div className="mt-12 p-6 bg-black text-white rounded-2xl text-center">
                            <h3 className="text-xl font-bold mb-2">Ready to try <span className="italic">AI</span> - Spirit?</h3>
                            <p className="text-gray-300 mb-4">Start chatting with our AI personas today.</p>
                            <Link
                                href="/"
                                className="inline-block bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                Browse Personas
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </>
    )
}
