import Link from 'next/link'
import { NextSeo, ArticleJsonLd } from 'next-seo'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { getAllPostSlugs, getPostBySlug, getAllPostMeta } from '@/lib/blog'

const SITE_URL = 'https://ai-spirit.in'

// MDX components — these are what render when the post uses Markdown / JSX
// Internal links automatically use next/link for client-side routing + prefetching.
const mdxComponents = {
    a: ({ href = '', children, ...props }) => {
        const isInternal = href.startsWith('/') || href.startsWith('#')
        if (isInternal) {
            return (
                <Link href={href} className="text-black underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors">
                    {children}
                </Link>
            )
        }
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors"
                {...props}
            >
                {children}
            </a>
        )
    },
    h2: (props) => <h2 className="font-display text-3xl md:text-4xl tracking-tight text-black mt-16 mb-4 leading-tight" {...props} />,
    h3: (props) => <h3 className="font-display text-2xl text-black mt-12 mb-3 leading-tight" {...props} />,
    h4: (props) => <h4 className="text-lg font-semibold text-black mt-8 mb-2" {...props} />,
    p: (props) => <p className="text-black/75 leading-[1.75] text-[17px] my-5" {...props} />,
    ul: (props) => <ul className="my-5 space-y-2 list-disc list-outside pl-5 text-black/75 text-[17px] leading-[1.75]" {...props} />,
    ol: (props) => <ol className="my-5 space-y-2 list-decimal list-outside pl-5 text-black/75 text-[17px] leading-[1.75]" {...props} />,
    li: (props) => <li className="pl-1" {...props} />,
    blockquote: (props) => (
        <blockquote className="my-8 pl-6 border-l-2 border-black/20 text-black/60 italic text-[17px] leading-[1.75]" {...props} />
    ),
    code: (props) => (
        <code className="bg-black/[0.04] text-black px-1.5 py-0.5 rounded text-[0.9em] font-mono" {...props} />
    ),
    pre: (props) => (
        <pre className="my-6 p-5 rounded-2xl bg-black text-white overflow-x-auto text-sm leading-relaxed" {...props} />
    ),
    hr: () => <hr className="my-12 border-0 border-t border-black/10" />,
    table: (props) => (
        <div className="my-8 overflow-x-auto p-1.5 rounded-2xl ring-1 ring-black/[0.06] bg-black/[0.02]">
            <table className="w-full bg-white rounded-[calc(1rem-0.375rem)] border border-black/[0.05]" {...props} />
        </div>
    ),
    thead: (props) => <thead className="border-b border-black/[0.06]" {...props} />,
    th: (props) => (
        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-black/40" {...props} />
    ),
    td: (props) => <td className="px-5 py-3 text-black/70 text-sm border-b border-black/[0.04]" {...props} />,
    strong: (props) => <strong className="font-semibold text-black" {...props} />,
    em: (props) => <em className="italic" {...props} />,
}

export default function BlogPost({ post, mdxSource, related }) {
    if (!post) return null

    const canonical = `${SITE_URL}/blog/${post.slug}`
    const formattedDate = post.date
        ? new Date(post.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    return (
        <>
            <NextSeo
                title={`${post.title} | AI Spirit`}
                description={post.excerpt}
                canonical={canonical}
                openGraph={{
                    type: 'article',
                    url: canonical,
                    title: post.title,
                    description: post.excerpt,
                    article: {
                        publishedTime: post.date || undefined,
                        section: post.category,
                    },
                }}
            />

            {post.date && (
                <ArticleJsonLd
                    url={canonical}
                    title={post.title}
                    images={[`${SITE_URL}/og-image-v7.png`]}
                    datePublished={post.date}
                    dateModified={post.date}
                    authorName="AI Spirit"
                    publisherName="AI Spirit"
                    publisherLogo={`${SITE_URL}/logo.png`}
                    description={post.excerpt}
                />
            )}

            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: `${SITE_URL}/` },
                    { name: 'Blog', url: `${SITE_URL}/blog` },
                    { name: post.title, url: canonical },
                ]}
            />

            <Navbar />

            <main className="bg-white pt-24 pb-16">
                <article className="max-w-3xl mx-auto px-6">
                    {/* Breadcrumb */}
                    <nav className="text-xs text-black/40 mb-6 flex items-center gap-2">
                        <Link href="/" className="hover:text-black transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>

                    {/* Header */}
                    <header className="mb-12 pb-8 border-b border-black/[0.06]">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 text-[10px] uppercase tracking-widest text-black/40">
                            <span>{post.category}</span>
                            {formattedDate && (
                                <>
                                    <span className="text-black/20">·</span>
                                    <span>{formattedDate}</span>
                                </>
                            )}
                            {post.readTime && (
                                <>
                                    <span className="text-black/20">·</span>
                                    <span>{post.readTime}</span>
                                </>
                            )}
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-black leading-[1.1] tracking-tight mb-4">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="text-lg text-black/55 leading-relaxed">{post.excerpt}</p>
                        )}
                    </header>

                    {/* Body */}
                    <div className="blog-body">
                        <MDXRemote {...mdxSource} components={mdxComponents} />
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-16 pt-10 border-t border-black/[0.06]">
                        <div className="p-1.5 rounded-3xl ring-1 ring-black/[0.06] bg-black/[0.02]">
                            <div className="bg-black text-white rounded-[calc(1.5rem-0.375rem)] px-8 py-10 text-center">
                                <h3 className="font-display text-2xl md:text-3xl mb-3">Try AI Spirit yourself.</h3>
                                <p className="text-white/60 mb-6 max-w-md mx-auto">
                                    Browse the persona library and start a conversation — no signup needed to look around.
                                </p>
                                <Link
                                    href="/personas"
                                    className="group inline-flex items-center gap-3 bg-white text-black pl-6 pr-2 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    <span>Browse personas</span>
                                    <span className="w-9 h-9 rounded-full bg-black/[0.08] flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-transform">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Related posts */}
                    {related.length > 0 && (
                        <section className="mt-16">
                            <h3 className="font-display text-xl text-black mb-6">More reading</h3>
                            <div className="space-y-3">
                                {related.map((r) => (
                                    <Link
                                        key={r.slug}
                                        href={`/blog/${r.slug}`}
                                        className="group block p-1.5 rounded-2xl ring-1 ring-black/[0.06] bg-black/[0.02] hover:-translate-y-0.5 transition-transform"
                                    >
                                        <div className="bg-white rounded-[calc(1rem-0.375rem)] border border-black/[0.05] px-5 py-4">
                                            <div className="text-[10px] uppercase tracking-widest text-black/40 mb-1">{r.category}</div>
                                            <div className="font-display text-base text-black group-hover:opacity-70 transition-opacity">
                                                {r.title}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </article>
            </main>

            <Footer />
        </>
    )
}

export async function getStaticPaths() {
    const slugs = getAllPostSlugs()
    return {
        paths: slugs.map((slug) => ({ params: { slug } })),
        fallback: false,
    }
}

export async function getStaticProps({ params }) {
    const post = getPostBySlug(params.slug)
    if (!post) return { notFound: true }

    const mdxSource = await serialize(post.content)
    const related = getAllPostMeta()
        .filter((p) => p.slug !== post.slug)
        .slice(0, 3)
        .map((p) => ({ slug: p.slug, title: p.title, category: p.category }))

    return {
        props: {
            post: { ...post, content: '' }, // strip raw content from props — only mdxSource needs to ship
            mdxSource,
            related,
        },
    }
}
