/** @type {import('next-sitemap').IConfig} */

const fs = require('fs')
const path = require('path')

// Import personas for sitemap generation
const personas = require('./data/personas.cjs')

// Read blog post slugs from /content/blog at build time
function getBlogSlugs() {
    const dir = path.join(__dirname, 'content', 'blog')
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
}

module.exports = {
    siteUrl: 'https://ai-spirit.in',
    generateRobotsTxt: false, // We already have robots.txt
    generateIndexSitemap: false,
    outDir: 'public',
    changefreq: 'weekly',
    priority: 0.7,
    sitemapSize: 5000,
    exclude: ['/api/*', '/auth/*', '/admin/*', '/chat/*'],

    // Generate additional paths for all personas
    additionalPaths: async (config) => {
        const result = []

        // Public, SEO-optimized landing page per persona (chat pages are auth-gated)
        if (personas && personas.INITIAL_PERSONAS) {
            for (const persona of personas.INITIAL_PERSONAS) {
                if (!persona.hidden) {
                    result.push({
                        loc: `/talk-to/${persona.slug}`,
                        changefreq: 'weekly',
                        priority: 0.8,
                        lastmod: new Date().toISOString(),
                    })
                }
            }
        }

        // Blog posts from /content/blog
        for (const slug of getBlogSlugs()) {
            result.push({
                loc: `/blog/${slug}`,
                changefreq: 'monthly',
                priority: 0.7,
                lastmod: new Date().toISOString(),
            })
        }

        return result
    },

    transform: async (config, path) => {
        // Custom priority for different pages
        let priority = 0.7
        let changefreq = 'weekly'

        if (path === '/') {
            priority = 1.0
            changefreq = 'daily'
        } else if (path === '/premium') {
            priority = 0.9
            changefreq = 'monthly'
        } else if (path.startsWith('/talk-to/')) {
            priority = 0.8
            changefreq = 'weekly'
        } else if (path === '/contact' || path === '/about') {
            priority = 0.6
            changefreq = 'monthly'
        } else if (path === '/privacy' || path === '/terms') {
            priority = 0.3
            changefreq = 'yearly'
        }

        return {
            loc: path,
            changefreq,
            priority,
            lastmod: new Date().toISOString(),
        }
    },
}
