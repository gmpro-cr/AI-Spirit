// Chats Page
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

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
                <title>Conversations - AI Spirit</title>
            </Head>

            {/* Navbar */}
            <Navbar />

            <div className="min-h-screen bg-white pt-16 pb-20">
                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 py-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                            <p className="mt-4 text-gray-500">Loading conversations...</p>
                        </div>
                    ) : pastChats.length > 0 ? (
                        <div className="space-y-3">
                            {pastChats.map(chat => (
                                <div
                                    key={chat.id}
                                    className="group bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
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
                                                        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all">
                                                    <span className="text-xl font-bold text-white">
                                                        {chat.personaName?.[0] || '?'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Chat Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-black text-lg truncate group-hover:text-indigo-600 transition-colors">
                                                    {chat.personaName}
                                                </h3>
                                                <p className="text-sm text-gray-600 truncate mt-0.5">
                                                    {chat.title}
                                                </p>
                                            </div>
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deleteChat(chat.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
                        <div className="text-center py-20">
                            {/* Empty State */}
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-black mb-3">No conversations yet</h3>
                                <p className="text-gray-600 mb-8">Start chatting with an AI persona to see your conversations here</p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
                    <div className="flex justify-around items-center h-16 px-2">
                        {/* Home */}
                        <Link
                            href="/"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Home</span>
                        </Link>

                        {/* Chats - Active */}
                        <Link
                            href="/chats"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-black"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs mt-1 font-semibold">Chats</span>
                        </Link>

                        {/* Create */}
                        <Link
                            href="/personas"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Create</span>
                        </Link>

                        {/* Account */}
                        <Link
                            href="/auth/signin"
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Account</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    )
}
