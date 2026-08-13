// Chats Page
import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { withAuth } from '@/middleware/withAuth'
import {
    listConversations,
    subscribeToConversations,
    deleteConversation,
} from '@/lib/conversationStore'
import { relativeTime, absoluteTime, dateGroup } from '@/lib/relativeTime'

// Fixed order so the buckets never reshuffle between renders.
const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 days', 'Previous 30 days', 'Earlier']

function ChatsPage() {
    const router = useRouter()
    const [pastChats, setPastChats] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')

    useEffect(() => {
        setPastChats(listConversations())
        setLoading(false)
        return subscribeToConversations(setPastChats)
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return pastChats
        return pastChats.filter(
            (c) =>
                c.title?.toLowerCase().includes(q) ||
                c.personaName?.toLowerCase().includes(q)
        )
    }, [pastChats, query])

    // Bucket by recency the way every mature chat product does, so a long list
    // stays scannable instead of being one undifferentiated column.
    const groups = useMemo(() => {
        const buckets = new Map()
        filtered.forEach((chat) => {
            const label = dateGroup(chat.updatedAt)
            if (!buckets.has(label)) buckets.set(label, [])
            buckets.get(label).push(chat)
        })
        return GROUP_ORDER.filter((label) => buckets.has(label)).map((label) => ({
            label,
            chats: buckets.get(label),
        }))
    }, [filtered])

    const handleDelete = (chatId, title) => {
        if (!confirm(`Delete “${title || 'this conversation'}”? This cannot be undone.`)) return
        deleteConversation(chatId)
    }

    return (
        <>
            <Head>
                <title>Conversations - AI Spirit</title>
            </Head>

            {/* Navbar */}
            <Navbar />

            <div className="min-h-screen bg-white dark:bg-[#0B0B0C] pt-16 pb-20 transition-colors">
                {/* Main Content */}
                <main className="max-w-3xl mx-auto px-4 py-8">
                    {(pastChats.length > 0 || query) && (
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="font-display text-3xl text-black dark:text-white leading-tight">Conversations</h1>
                                <p className="mt-1 text-sm text-black/50 dark:text-white/50">
                                    {pastChats.length} saved {pastChats.length === 1 ? 'chat' : 'chats'}
                                </p>
                            </div>

                            <div className="relative sm:w-64">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30 dark:text-white/30"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                                </svg>
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search conversations"
                                    aria-label="Search conversations"
                                    className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] py-2.5 pl-9 pr-3 text-sm text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 focus:border-black/20 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-black/[0.06] dark:focus:ring-white/[0.06] transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-2" aria-busy="true" aria-label="Loading conversations">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] animate-pulse" />
                            ))}
                        </div>
                    ) : groups.length > 0 ? (
                        <div className="space-y-8">
                            {groups.map(({ label, chats }) => (
                                <section key={label}>
                                    <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
                                        {label}
                                    </h2>
                                    <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
                                        {chats.map((chat) => (
                                            <li
                                                key={chat.id}
                                                className="group flex items-center gap-3 bg-white dark:bg-[#0B0B0C] px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                                            >
                                                <button
                                                    onClick={() => router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)}
                                                    className="flex flex-1 items-center gap-3 min-w-0 text-left"
                                                >
                                                    {chat.personaImage ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={chat.personaImage}
                                                            alt=""
                                                            className="h-10 w-10 flex-shrink-0 rounded-full border border-black/[0.06] dark:border-white/[0.06] object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06]">
                                                            <span className="font-display text-sm text-black/60 dark:text-white/60">
                                                                {chat.personaName?.[0] || '?'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        {/* Title first: it is what distinguishes two
                                                            conversations with the same persona. */}
                                                        <p className="truncate text-sm font-medium text-black dark:text-white">
                                                            {chat.title || 'Untitled conversation'}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-xs text-black/45 dark:text-white/45">
                                                            {chat.personaName}
                                                            {chat.messageCount ? ` · ${chat.messageCount} messages` : ''}
                                                        </p>
                                                    </div>

                                                    {chat.updatedAt && (
                                                        <span
                                                            className="hidden flex-shrink-0 text-xs text-black/40 dark:text-white/40 sm:block"
                                                            title={absoluteTime(chat.updatedAt)}
                                                        >
                                                            {relativeTime(chat.updatedAt)}
                                                        </span>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(chat.id, chat.title)}
                                                    className="flex-shrink-0 rounded-lg p-2 text-black/25 dark:text-white/25 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 focus:opacity-100 group-hover:opacity-100"
                                                    aria-label={`Delete conversation: ${chat.title || 'untitled'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="py-20 text-center">
                            <p className="text-black/60 dark:text-white/60">No conversations match “{query}”</p>
                            <button
                                onClick={() => setQuery('')}
                                className="mt-4 text-sm font-medium text-black dark:text-white underline underline-offset-4 hover:opacity-70"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            {/* Empty State */}
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-white/[0.08] rounded-2xl flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-black dark:text-white mb-3">No conversations yet</h3>
                                <p className="text-gray-500 dark:text-white/50 mb-10">Start chatting with an AI persona to see your conversations here</p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white dark:bg-white dark:text-black font-medium rounded-2xl shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
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
