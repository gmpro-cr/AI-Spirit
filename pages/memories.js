import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { withAuth } from '@/middleware/withAuth'

function MemoriesPage() {
    const router = useRouter()
    const { user, userProfile } = useAuth()
    const [memories, setMemories] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPersona, setSelectedPersona] = useState('all')
    const [personas, setPersonas] = useState([])

    useEffect(() => {
        loadMemories()
    }, [user, selectedPersona])

    const loadMemories = async () => {
        if (!user) return

        setLoading(true)
        try {
            let query = supabase
                .from('conversation_memories')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (selectedPersona !== 'all') {
                query = query.eq('persona_slug', selectedPersona)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error loading memories:', error)
            } else {
                setMemories(data || [])

                // Get unique personas
                const uniquePersonas = [...new Set(data?.map(m => m.persona_slug) || [])]
                setPersonas(uniquePersonas)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteMemory = async (memoryId) => {
        if (!confirm('Delete this memory? The persona will forget this detail.')) return

        try {
            const { error } = await supabase
                .from('conversation_memories')
                .delete()
                .eq('id', memoryId)

            if (error) {
                console.error('Error deleting memory:', error)
                alert('Failed to delete memory')
            } else {
                setMemories(memories.filter(m => m.id !== memoryId))
            }
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred')
        }
    }

    const clearAllMemories = async () => {
        if (!confirm('Delete ALL memories? This cannot be undone. All personas will forget everything about you.')) return

        try {
            const { error } = await supabase
                .from('conversation_memories')
                .delete()
                .eq('user_id', user.id)

            if (error) {
                console.error('Error clearing memories:', error)
                alert('Failed to clear memories')
            } else {
                setMemories([])
                alert('All memories cleared successfully')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred')
        }
    }

    const clearPersonaMemories = async () => {
        if (selectedPersona === 'all') return

        if (!confirm(`Delete all memories for ${selectedPersona}? This persona will forget everything about you.`)) return

        try {
            const { error } = await supabase
                .from('conversation_memories')
                .delete()
                .eq('user_id', user.id)
                .eq('persona_slug', selectedPersona)

            if (error) {
                console.error('Error clearing persona memories:', error)
                alert('Failed to clear memories')
            } else {
                setMemories(memories.filter(m => m.persona_slug !== selectedPersona))
                setSelectedPersona('all')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred')
        }
    }

    const getMemoryIcon = (type) => {
        switch (type) {
            case 'fact':
                return '📌'
            case 'preference':
                return '❤️'
            case 'goal':
                return '🎯'
            case 'event':
                return '📅'
            default:
                return '💭'
        }
    }

    const getImportanceColor = (importance) => {
        if (importance >= 9) return 'text-red-600'
        if (importance >= 7) return 'text-orange-600'
        if (importance >= 5) return 'text-yellow-600'
        return 'text-gray-600'
    }

    const filteredMemories = memories

    return (
        <>
            <Head>
                <title>My Memories - AI-Spirit</title>
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-black">My Memories</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    What AI personas know about you
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                            >
                                ← Back to Personas
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* User Profile Card */}
                    {userProfile && (
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-black mb-4">Your Profile</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-black font-medium">{userProfile.preferred_name || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Interests</p>
                                    <p className="text-black">{userProfile.interests?.join(', ') || 'None'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Goals</p>
                                    <p className="text-black">{userProfile.goals?.join(', ') || 'None'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters and Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700">Filter by Persona:</label>
                                <select
                                    value={selectedPersona}
                                    onChange={(e) => setSelectedPersona(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Personas ({memories.length})</option>
                                    {personas.map(persona => (
                                        <option key={persona} value={persona}>
                                            {persona} ({memories.filter(m => m.persona_slug === persona).length})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                {selectedPersona !== 'all' && (
                                    <button
                                        onClick={clearPersonaMemories}
                                        className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        Clear {selectedPersona} Memories
                                    </button>
                                )}
                                <button
                                    onClick={clearAllMemories}
                                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Clear All Memories
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Memories List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
                            <p className="text-gray-600">Loading memories...</p>
                        </div>
                    ) : filteredMemories.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <div className="text-6xl mb-4">🧠</div>
                            <h3 className="text-lg font-semibold text-black mb-2">No Memories Yet</h3>
                            <p className="text-gray-600 mb-6">
                                Start chatting with personas and they&apos;ll remember details about you!
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Start Chatting
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredMemories.map((memory) => (
                                <div
                                    key={memory.id}
                                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{getMemoryIcon(memory.memory_type)}</span>
                                                <span className="text-xs font-medium text-gray-500 uppercase">
                                                    {memory.memory_type}
                                                </span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{memory.persona_slug}</span>
                                                <span className={`text-xs font-semibold ${getImportanceColor(memory.importance)}`}>
                                                    {Array(memory.importance).fill('★').join('')}
                                                </span>
                                            </div>
                                            <p className="text-black font-medium mb-1">{memory.content}</p>
                                            {memory.context && (
                                                <p className="text-sm text-gray-500 italic">&quot;{memory.context}&quot;</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                Created: {new Date(memory.created_at).toLocaleDateString()}
                                                {memory.last_accessed_at && memory.last_accessed_at !== memory.created_at && (
                                                    <> • Last used: {new Date(memory.last_accessed_at).toLocaleDateString()}</>
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteMemory(memory.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete memory"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">How Memories Work</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Personas automatically remember details you share in conversations</li>
                            <li>• Memories are shared across all personas (they all know about you)</li>
                            <li>• Higher importance (★) means the detail is more significant</li>
                            <li>• You can delete individual memories or clear everything</li>
                            <li>• Memories help personas give more personalized responses</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default withAuth(MemoriesPage)
