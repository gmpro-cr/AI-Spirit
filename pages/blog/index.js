import Link from 'next/link'
import { NextSeo } from 'next-seo'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getAllPostMeta } from '@/lib/blog'

const SITE_URL = 'https://ai-spirit.in'

export default function Blog({ posts }) {
    return (
        <>
            <NextSeo
                title="Blog | AI Spirit"
                description="Honest writing on AI personas, conversation design, and what we're learning shipping AI Spirit."
                canonical={`${SITE_URL}/blog`}
                openGraph={{
                    type: 'website',
                    url: `${SITE_URL}/blog`,
                    title: 'Blog | AI Spirit',
                    description: 'Honest writing on AI personas, conversation design, and what we are learning shipping AI Spirit.',
                }}
            />

            <Navbar />

            <main className="min-h-screen bg-white pt-24 pb-16">
                {/* Header */}
                <section className="px-6 max-w-5xl mx-auto pb-12 border-b border-black/[0.06]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-black/60 mb-3">Writing</p>
                    <h1 className="font-display text-5xl md:text-6xl tracking-tight text-black leading-[1.05] mb-4">
                        Blog
                    </h1>
                    <p className="text-lg text-black/60 max-w-2xl">
                        Notes on AI personas, conversation design, and what we&apos;re learning while shipping AI Spirit.
                    </p>
                </section>

                {/* Posts */}
                <section className="px-6 max-w-5xl mx-auto py-12">
                    {posts.length === 0 ? (
                        <p className="text-black/60">No posts yet — first one drops soon.</p>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="group block p-1.5 rounded-2xl ring-1 ring-black/[0.06] bg-black/[0.02] hover:-translate-y-0.5 transition-transform"
                                >
                                    <article className="bg-white rounded-[calc(1rem-0.375rem)] border border-black/[0.05] px-6 py-5">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[10px] uppercase tracking-widest text-black/60">
                                            <span>{post.category}</span>
                                            {post.date && (
                                                <>
                                                    <span className="text-black/45">·</span>
                                                    <span>
                                                        {new Date(post.date).toLocaleDateString('en-GB', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </>
                                            )}
                                            {post.readTime && (
                                                <>
                                                    <span className="text-black/45">·</span>
                                                    <span>{post.readTime}</span>
                                                </>
                                            )}
                                        </div>
                                        <h2 className="font-display text-xl md:text-2xl text-black mb-2 group-hover:opacity-70 transition-opacity">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="text-black/65 leading-relaxed text-base">{post.excerpt}</p>
                                        )}
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    )
}

export async function getStaticProps() {
    const posts = getAllPostMeta()
    return { props: { posts } }
}
