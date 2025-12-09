/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://ai-spirit.in',
    generateRobotsTxt: false, // We already have robots.txt
    generateIndexSitemap: false,
    outDir: 'public',
    changefreq: 'weekly',
    priority: 0.7,
    sitemapSize: 5000,
    exclude: ['/api/*', '/auth/*'],
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
