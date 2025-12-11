/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://ai-spirit.in',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    outDir: 'public',
    exclude: ['/api/*', '/auth/*', '/404'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/auth/'],
            },
        ],
    },
}
