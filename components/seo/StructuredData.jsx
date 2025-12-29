import Head from 'next/head'

/**
 * JSON-LD Structured Data component for SEO
 * Provides rich snippets for search engines
 */
export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AI - Spirit',
        url: 'https://ai-spirit.in',
        logo: 'https://ai-spirit.in/logo.png',
        description: 'AI-powered personas for parenting, wellness, relationships, and more.',
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: 'https://ai-spirit.in/contact',
        },
    }

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    )
}

export function WebsiteSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'AI - Spirit',
        url: 'https://ai-spirit.in',
        description: 'Chat with AI personas for guidance on parenting, mental wellness, relationships, and cooking.',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://ai-spirit.in/?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    }

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    )
}

export function SoftwareApplicationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI - Spirit',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
            description: 'Free tier available with premium options',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            ratingCount: '100',
        },
    }

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    )
}

export function PersonaSchema({ persona }) {
    if (!persona) return null

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: persona.name,
        description: persona.description || persona.bio,
        image: persona.image,
        url: `https://ai-spirit.in/chat/${persona.slug}`,
        category: persona.category,
    }

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    )
}

export function FAQSchema({ faqs }) {
    if (!faqs || faqs.length === 0) return null

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    )
}

export function BreadcrumbSchema({ items }) {
    if (!items || items.length === 0) return null

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    )
}

export function ServiceSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'AI - Spirit',
        description: 'AI-powered persona chat service for parenting advice, mental wellness coaching, relationship counseling, and career guidance available 24/7.',
        provider: {
            '@type': 'Organization',
            name: 'AI - Spirit',
            url: 'https://ai-spirit.in',
        },
        serviceType: 'AI Coaching Service',
        areaServed: {
            '@type': 'Country',
            name: 'India',
        },
        availableChannel: {
            '@type': 'ServiceChannel',
            serviceUrl: 'https://ai-spirit.in',
            serviceType: 'Web Application',
            availableLanguage: ['English', 'Hindi'],
        },
        offers: [
            {
                '@type': 'Offer',
                name: 'Free Plan',
                price: '0',
                priceCurrency: 'INR',
                description: '20 messages per day, 2 custom personas, 7-day chat history',
            },
            {
                '@type': 'Offer',
                name: 'Premium Plan',
                price: '249',
                priceCurrency: 'INR',
                description: 'Unlimited messages, voice AI, unlimited custom personas, forever chat history',
                priceValidUntil: '2025-12-31',
            },
        ],
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'AI Personas',
            itemListElement: [
                {
                    '@type': 'OfferCatalog',
                    name: 'Parenting Coaches',
                    description: 'Expert AI personas for parenting guidance and advice',
                },
                {
                    '@type': 'OfferCatalog',
                    name: 'Wellness Coaches',
                    description: 'Mental health and wellness support personas',
                },
                {
                    '@type': 'OfferCatalog',
                    name: 'Career Mentors',
                    description: 'Professional guidance and career coaching',
                },
                {
                    '@type': 'OfferCatalog',
                    name: 'Relationship Advisors',
                    description: 'Relationship and dating advice personas',
                },
            ],
        },
    }

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    )
}
