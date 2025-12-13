import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Image from 'next/image'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

export default function ChatsPage() {
    const router = useRouter()
    const [pastChats, setPastChats] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return

        try {
            const conversationsList = JSON.parse(localStorage.getItem('esperit_conversations') || '[]')
            setPastChats(conversationsList)
        } catch (error) {
            console.error('Error loading past chats:', error)
            setPastChats([])
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteChat = (chatId) => {
        if (!confirm('Delete this conversation?')) return

        // Remove from conversations list
        const updated = pastChats.filter(c => c.id !== chatId)
        setPastChats(updated)
        localStorage.setItem('esperit_conversations', JSON.stringify(updated))

        // Remove chat messages
        localStorage.removeItem(`esperit_conversation_${chatId}`)
    }

    return (
        <>
            <Head>
                <title>Past Chats - AI Spirit</title>
            </Head>

            <div className="min-h-screen bg-white pb-20">
                {/* Header */}
                <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
                    <div className="px-4 py-4">
                        <h1 className="text-xl font-bold text-black">Past Chats</h1>
                    </div>
                </header>

                {/* Chats List */}
                <main className="p-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                        </div>
                    ) : pastChats.length > 0 ? (
                        <div className="space-y-3">
                            {pastChats.map(chat => (
                                <div
                                    key={chat.id}
                                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <button
                                        onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        {chat.personaImage ? (
                                            <Image
                                                src={chat.personaImage}
                                                alt={chat.personaName}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-lg font-bold text-gray-600">
                                                    {chat.personaName?.[0] || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-black truncate">{chat.personaName}</p>
                                            <p className="text-sm text-gray-500 truncate">{chat.title}</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => deleteChat(chat.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-lg font-semibold text-black mb-2">No Chats Yet</h3>
                            <p className="text-gray-500 mb-6">Start chatting with a persona!</p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                            >
                                Browse Personas
                            </button>
                        </div>
                    )}
                </main>

                {/* Mobile Bottom Nav */}
                <MobileBottomNav />
            </div>
        </>
    )
}
