// Chats Page
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { withAuth } from '@/middleware/withAuth'

function ChatsPage() {
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
                <title>Conversations - AI Spirit</title>
            </Head>

            {/* Navbar */}
            <Navbar />

            <div className="min-h-screen bg-white pt-16 pb-20 transition-colors">
                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 py-8">
                    {loading ? (
                        <div className="text-center py-24">
                            <div className="w-12 h-12 mx-auto border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                            <p className="mt-6 text-gray-500">Loading conversations...</p>
                        </div>
                    ) : pastChats.length > 0 ? (
                        <div className="space-y-4">
                            {pastChats.map(chat => (
                                <div
                                    key={chat.id}
                                    className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
                                            className="flex items-center gap-4 flex-1 text-left"
                                        >
                                            {/* Avatar */}
                                            {chat.personaImage ? (
                                                <div className="relative">
                                                    <img
                                                        src={chat.personaImage}
                                                        alt={chat.personaName}
                                                        className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-xs group-hover:shadow-soft transition-all duration-300"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-100 shadow-xs group-hover:shadow-soft transition-all duration-300">
                                                    <span className="text-xl font-bold text-black">
                                                        {chat.personaName?.[0] || '?'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Chat Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-black text-lg truncate group-hover:text-gray-700 transition-colors duration-300">
                                                    {chat.personaName}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate mt-1">
                                                    {chat.title}
                                                </p>
                                            </div>
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deleteChat(chat.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                                            aria-label="Delete conversation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            {/* Empty State */}
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-black mb-3">No conversations yet</h3>
                                <p className="text-gray-500 mb-10">Start chatting with an AI persona to see your conversations here</p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-2xl shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                    Browse Personas
                                </button>
                            </div>
                        </div>
                    )}
                </main>

            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </>
    )
}

export default withAuth(ChatsPage)
