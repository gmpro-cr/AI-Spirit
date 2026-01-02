/** @type {import('next-sitemap').IConfig} */

// Import personas for sitemap generation
const personas = require('./data/personas.cjs')

module.exports = {
    siteUrl: 'https://ai-spirit.in',
    generateRobotsTxt: false, // We already have robots.txt
    generateIndexSitemap: false,
    outDir: 'public',
    changefreq: 'weekly',
    priority: 0.7,
    sitemapSize: 5000,
    exclude: ['/api/*', '/auth/*'],

    // Generate additional paths for all personas
    additionalPaths: async (config) => {
        const result = []

        // Add all persona chat URLs to sitemap
        if (personas && personas.INITIAL_PERSONAS) {
            for (const persona of personas.INITIAL_PERSONAS) {
                if (!persona.hidden) {
                    result.push({
                        loc: `/chat/${persona.slug}`,
                        changefreq: 'daily',
                        priority: 0.8,
                        lastmod: new Date().toISOString(),
                    })
                }
            }
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
        } else if (path.startsWith('/chat/')) {
            priority = 0.8
            changefreq = 'daily'
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
