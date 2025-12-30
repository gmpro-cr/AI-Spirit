import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import AccountSettingsModal from '@/components/profile/AccountSettingsModal'

export default function MobileBottomNav({ onCreatePersona }) {
    const router = useRouter()
    const { user } = useAuth()
    const currentPath = router.pathname
    const [isAccountOpen, setIsAccountOpen] = useState(false)
    const [isPremium, setIsPremium] = useState(false)

    // Check premium status
    useEffect(() => {
        const checkPremiumStatus = async () => {
            if (!user) {
                setIsPremium(false)
                return
            }
            try {
                const res = await fetch(`/api/user/subscription-status?userId=${user.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setIsPremium(data.isPremium || false)
                }
            } catch (error) {
                console.error('Error checking premium status:', error)
                setIsPremium(false)
            }
        }
        checkPremiumStatus()
    }, [user])

    // Handle create click with premium check
    const handleCreateClick = () => {
        if (!isPremium) {
            router.push('/premium')
            return
        }
        if (onCreatePersona) {
            onCreatePersona()
        } else {
            // If no callback provided, go to home with create param
            router.push('/?create=true')
        }
    }

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-soft-lg safe-area-bottom transition-all duration-300" style={{ touchAction: 'manipulation', zIndex: 99999 }}>
                <div className="flex justify-around items-center px-2" style={{ minHeight: '72px' }}>
                    {/* Home */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center flex-1 py-3 rounded-2xl mx-1 transition-all duration-300 ${currentPath === '/' ? 'text-black bg-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${currentPath === '/' ? 'scale-110' : ''}`} fill={currentPath === '/' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentPath === '/' ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className={`text-xs mt-1.5 ${currentPath === '/' ? 'font-semibold' : 'font-medium'}`}>Home</span>
                    </Link>

                    {/* Chats */}
                    <Link
                        href="/chats"
                        className={`flex flex-col items-center justify-center flex-1 py-3 rounded-2xl mx-1 transition-all duration-300 ${currentPath === '/chats' ? 'text-black bg-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${currentPath === '/chats' ? 'scale-110' : ''}`} fill={currentPath === '/chats' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={currentPath === '/chats' ? 0 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className={`text-xs mt-1.5 ${currentPath === '/chats' ? 'font-semibold' : 'font-medium'}`}>Chats</span>
                    </Link>

                    {/* Create */}
                    <button
                        type="button"
                        onClick={handleCreateClick}
                        className="flex flex-col items-center justify-center flex-1 py-3 min-h-[44px] rounded-2xl mx-1 transition-all duration-300 text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95 active:text-black"
                    >
                        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-soft hover:shadow-lift transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-xs mt-1.5 font-medium text-black">Create</span>
                    </button>

                    {/* Account */}
                    {user ? (
                        <button
                            type="button"
                            onClick={() => setIsAccountOpen(true)}
                            className="flex flex-col items-center justify-center flex-1 py-3 min-h-[44px] rounded-2xl mx-1 transition-all duration-300 text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95 active:text-black"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs mt-1.5 font-medium">Account</span>
                        </button>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className={`flex flex-col items-center justify-center flex-1 py-3 min-h-[44px] rounded-2xl mx-1 transition-all duration-300 ${currentPath === '/auth/signin' ? 'text-black bg-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95 active:text-black'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${currentPath === '/auth/signin' ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className={`text-xs mt-1.5 ${currentPath === '/auth/signin' ? 'font-semibold' : 'font-medium'}`}>Sign In</span>
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
