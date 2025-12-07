import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { userId } = req.query

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' })
        }

        // Get user's subscription
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .gte('current_period_end', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Database error:', error)
            return res.status(500).json({ error: 'Failed to fetch subscription' })
        }

        const isPremium = !!data

        // Count messages sent today (using IST timezone UTC+5:30)
        let messagesUsedToday = 0
        if (!isPremium && userId) {
            const now = new Date()

            // Get IST midnight (subtract 5:30 from UTC to get IST midnight in UTC)
            const istOffset = 5.5 * 60 * 60 * 1000 // 5 hours 30 minutes in milliseconds
            const nowIST = new Date(now.getTime() + istOffset)
            const istMidnight = new Date(Date.UTC(
                nowIST.getUTCFullYear(),
                nowIST.getUTCMonth(),
                nowIST.getUTCDate(),
                0, 0, 0, 0
            ))
            // Convert IST midnight back to UTC
            const todayISTinUTC = new Date(istMidnight.getTime() - istOffset)

            // Get all conversation IDs for this user
            const { data: conversations } = await supabaseAdmin
                .from('conversations')
                .select('id')
                .eq('user_id', userId)

            if (conversations && conversations.length > 0) {
                const conversationIds = conversations.map(c => c.id)

                const { count } = await supabaseAdmin
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .in('conversation_id', conversationIds)
                    .eq('role', 'user')
                    .gte('created_at', todayISTinUTC.toISOString())

                messagesUsedToday = count || 0
            }
        }

        return res.status(200).json({
            isPremium,
            status: isPremium ? 'premium' : 'free',
            subscription: data || null,
            messagesUsedToday
        })
    } catch (error) {
        console.error('Subscription status error:', error)
        return res.status(500).json({ error: 'Failed to check subscription status' })
    }
}
