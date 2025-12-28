import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import AccountSettingsModal from '@/components/profile/AccountSettingsModal'

export default function MobileBottomNav({ onCreatePersona }) {
    const router = useRouter()
    const { user } = useAuth()
    const currentPath = router.pathname
    const [isAccountOpen, setIsAccountOpen] = useState(false)

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom transition-colors" style={{ touchAction: 'manipulation', zIndex: 99999 }}>
                <div className="flex justify-around items-center h-18 px-2" style={{ minHeight: '72px' }}>
                    {/* Home */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${currentPath === '/' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs mt-1 font-medium">Home</span>
                    </Link>

                    {/* Chats */}
                    <Link
                        href="/chats"
                        className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${currentPath === '/chats' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-xs mt-1 font-medium">Chats</span>
                    </Link>

                    {/* Create */}
                    <button
                        type="button"
                        onClick={() => onCreatePersona?.()}
                        className="flex flex-col items-center justify-center flex-1 py-2 min-h-[44px] transition-colors text-gray-400 hover:text-gray-600 active:text-black"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs mt-1 font-medium">Create</span>
                    </button>

                    {/* Account */}
                    {user ? (
                        <button
                            type="button"
                            onClick={() => setIsAccountOpen(true)}
                            className={`flex flex-col items-center justify-center flex-1 py-2 min-h-[44px] transition-colors text-gray-400 hover:text-gray-600 active:text-black`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Account</span>
                        </button>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className={`flex flex-col items-center justify-center flex-1 py-2 min-h-[44px] transition-colors ${currentPath === '/auth/signin' ? 'text-black' : 'text-gray-400 hover:text-gray-600 active:text-black'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Sign In</span>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Account Settings Modal */}
            <AccountSettingsModal
                isOpen={isAccountOpen}
                onClose={() => setIsAccountOpen(false)}
            />
        </>
    )
}
