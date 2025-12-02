import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { getRelationshipInfo, getProgressToNextLevel } from '@/lib/relationshipSystem'
import Head from 'next/head'

export default function Dashboard() {
    const router = useRouter()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalConversations: 0,
        totalMessages: 0,
        personaRelationships: [],
        topPersona: null,
        streakDays: 0
    })

    useEffect(() => {
        if (!user) {
            router.push('/auth/signin?returnTo=/dashboard')
            return
        }

        loadDashboardData()
    }, [user])

    async function loadDashboardData() {
        try {
            setLoading(true)

            // Get all persona relationships
            const { data: relationships, error: relError } = await supabase
                .from('persona_relationships')
                .select('*')
                .eq('user_id', user.id)
                .order('conversation_count', { ascending: false })

            if (relError) throw relError

            // Get total conversations
            const { count: convCount, error: convError } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            if (convError) throw convError

            // Get total messages
            const { count: msgCount, error: msgError } = await supabase
                .from('messages')
                .select('conversation_id', { count: 'exact', head: true })
                .in('conversation_id',
                    await supabase
                        .from('conversations')
                        .select('id')
                        .eq('user_id', user.id)
                        .then(res => res.data?.map(c => c.id) || [])
                )

            if (msgError) throw msgError

            // Calculate streak (simplified - just check if chatted today and yesterday)
            const { data: recentConvs } = await supabase
                .from('conversations')
                .select('created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            let streak = 0
            if (recentConvs && recentConvs.length > 0) {
                const today = new Date().setHours(0, 0, 0, 0)
                const lastChat = new Date(recentConvs[0].created_at).setHours(0, 0, 0, 0)
                if (lastChat === today || lastChat === today - 86400000) {
                    streak = 1 // Simplified streak calculation
                }
            }

            setStats({
                totalConversations: convCount || 0,
                totalMessages: msgCount || 0,
                personaRelationships: relationships || [],
                topPersona: relationships?.[0] || null,
                streakDays: streak
            })
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-white text-xl">Loading your journey...</div>
                </div>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>My Journey - AI-Spirit</title>
                <meta name="description" content="Track your personal growth journey with AI personas" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Your Life Scorecard
                        </h1>
                        <p className="text-xl text-purple-200">
                            Track your journey of growth and transformation
                        </p>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Total Conversations */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="text-purple-300 text-sm font-medium mb-2">Total Conversations</div>
                            <div className="text-5xl font-bold text-white mb-2">{stats.totalConversations}</div>
                            <div className="text-purple-200 text-sm">{stats.totalMessages} messages exchanged</div>
                        </div>

                        {/* Streak */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="text-purple-300 text-sm font-medium mb-2">Current Streak</div>
                            <div className="text-5xl font-bold text-white mb-2">{stats.streakDays} 🔥</div>
                            <div className="text-purple-200 text-sm">
                                {stats.streakDays > 0 ? 'Keep it going!' : 'Start your streak today'}
                            </div>
                        </div>

                        {/* Active Personas */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="text-purple-300 text-sm font-medium mb-2">Active Personas</div>
                            <div className="text-5xl font-bold text-white mb-2">{stats.personaRelationships.length}</div>
                            <div className="text-purple-200 text-sm">Guiding your journey</div>
                        </div>
                    </div>

                    {/* Persona Relationships */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Your Persona Relationships</h2>

                        {stats.personaRelationships.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-purple-200 text-lg mb-4">You haven't started any conversations yet</p>
                                <button
                                    onClick={() => router.push('/personas')}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Start Your Journey
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.personaRelationships.map((rel) => {
                                    const info = getRelationshipInfo(rel.relationship_level)
                                    const progress = getProgressToNextLevel(rel.conversation_count)

                                    return (
                                        <div key={rel.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-4xl">{info.icon}</div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white capitalize">{rel.persona_slug.replace(/-/g, ' ')}</h3>
                                                        <p className="text-purple-300 text-sm">{rel.conversation_count} conversations</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold text-white">{info.name}</div>
                                                    <div className="text-sm text-purple-300">Level {rel.relationship_level}</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            {rel.relationship_level < 5 && (
                                                <div>
                                                    <div className="flex justify-between text-sm text-purple-300 mb-2">
                                                        <span>{info.description}</span>
                                                        <span>{progress.remaining} more to Level {rel.relationship_level + 1}</span>
                                                    </div>
                                                    <div className="w-full bg-white/10 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${progress.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {rel.relationship_level === 5 && (
                                                <div className="text-center py-2">
                                                    <span className="text-yellow-400 font-semibold">✨ Maximum Level Achieved! ✨</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Call to Action */}
                    <div className="text-center">
                        <button
                            onClick={() => router.push('/personas')}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Continue Your Journey
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
