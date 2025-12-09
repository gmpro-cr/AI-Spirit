import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Sample blog posts - in production, these would come from a CMS or database
const BLOG_POSTS = [
    {
        slug: 'introduction-to-ai-spirit',
        title: 'Welcome to AI - Spirit: Your Personal AI Coach',
        excerpt: 'Discover how AI - Spirit can help you with parenting, wellness, relationships, and more through conversational AI personas.',
        date: '2024-12-01',
        category: 'Announcements',
        readTime: '3 min read',
    },
    {
        slug: 'how-ai-personas-work',
        title: 'How AI Personas Work: The Technology Behind AI - Spirit',
        excerpt: 'Learn about the technology that powers our AI personas and how they provide helpful, contextual conversations.',
        date: '2024-11-15',
        category: 'Technology',
        readTime: '5 min read',
    },
    {
        slug: 'parenting-tips-from-ai',
        title: '5 Ways AI Can Support Your Parenting Journey',
        excerpt: 'Explore how AI-powered parenting coaches can provide 24/7 guidance for modern parents.',
        date: '2024-11-01',
        category: 'Parenting',
        readTime: '4 min read',
    },
]

export default function Blog() {
    return (
        <>
            <Head>
                <title>Blog | AI - Spirit</title>
                <meta
                    name="description"
                    content="Read articles about AI, parenting, wellness, relationships, and how AI - Spirit can help you in daily life."
                />
                <link rel="canonical" href="https://ai-spirit.in/blog" />
                <meta property="og:title" content="AI - Spirit Blog" />
                <meta property="og:description" content="Articles about AI, parenting, wellness, and relationships." />
                <meta property="og:url" content="https://ai-spirit.in/blog" />
            </Head>

            <Navbar />

            <main className="min-h-screen bg-white pt-16">
                {/* Header */}
                <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-4">
                            Blog
                        </h1>
                        <p className="text-lg text-gray-600">
                            Insights, tips, and updates from the <span className="italic">AI</span> - Spirit team
                        </p>
                    </div>
                </section>

                {/* Blog Posts Grid */}
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                            {BLOG_POSTS.map((post) => (
                                <article
                                    key={post.slug}
                                    className="group border border-gray-200 rounded-2xl p-6 hover:border-gray-400 transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-3">
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

                                    <h2 className="text-xl md:text-2xl font-bold text-black mb-2 group-hover:underline">
                                        <Link href={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>

                                    <p className="text-gray-600 mb-4">
                                        {post.excerpt}
                                    </p>

                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center text-sm font-medium text-black hover:underline"
                                    >
                                        Read more
                                        <svg
                                            className="ml-1 w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Link>
                                </article>
                            ))}
                        </div>

                        {/* Coming Soon Notice */}
                        <div className="mt-12 text-center py-8 bg-gray-50 rounded-2xl">
                            <p className="text-gray-600">
                                More articles coming soon! Check back regularly for updates.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}
