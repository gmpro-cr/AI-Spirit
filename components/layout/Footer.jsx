import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        product: [
            { name: 'Browse Personas', href: '/' },
            { name: 'Premium', href: '/premium' },
            { name: 'Create Persona', href: '/?create=true' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Contact', href: '/contact' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
        ],
    }

    return (
        <footer className="bg-black text-white border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold tracking-tight">
                                <span className="italic">AI</span> - Spirit
                            </span>
                        </Link>
                        <p className="mt-3 text-sm text-gray-400 max-w-xs">
                            Chat with AI personas for guidance on parenting, wellness, relationships, and more.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                            Product
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <p className="text-sm text-gray-500 text-center">
                        © {currentYear} AI - Spirit. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
