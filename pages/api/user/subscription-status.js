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

        return res.status(200).json({
            isPremium,
            subscription: data || null,
        })
    } catch (error) {
        console.error('Subscription status error:', error)
        return res.status(500).json({ error: 'Failed to check subscription status' })
    }
}
