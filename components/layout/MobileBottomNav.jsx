import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function MobileBottomNav({ onCreatePersona }) {
    const router = useRouter()
    const { user } = useAuth()
    const currentPath = router.pathname

    const navItems = [
        {
            name: 'Home',
            href: '/',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            isActive: currentPath === '/',
        },
        {
            name: 'Explore',
            href: '/blog',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            isActive: currentPath === '/blog',
        },
        {
            name: 'Create',
            onClick: onCreatePersona,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            isButton: true,
        },
        {
            name: 'Account',
            href: user ? '/premium' : '/auth/signin',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            isActive: currentPath === '/premium' || currentPath === '/auth/signin',
        },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    if (item.isButton) {
                        return (
                            <button
                                key={item.name}
                                onClick={item.onClick}
                                className="flex flex-col items-center justify-center flex-1 py-2 group"
                            >
                                <div className="p-2 rounded-full bg-black text-white group-active:scale-95 transition-transform">
                                    {item.icon}
                                </div>
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${item.isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {item.icon}
                            <span className="text-xs mt-1 font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
