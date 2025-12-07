import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Get user's liked personas
        const { userId } = req.query

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }

        try {
            const { data, error } = await supabaseAdmin
                .from('user_liked_personas')
                .select('persona_slug')
                .eq('user_id', userId)

            if (error) throw error

            const likedSlugs = data.map(row => row.persona_slug)
            return res.status(200).json({ likedPersonas: likedSlugs })
        } catch (error) {
            console.error('Error fetching liked personas:', error)
            return res.status(500).json({ error: 'Failed to fetch liked personas' })
        }
    }

    if (req.method === 'POST') {
        // Sync liked personas from client
        const { userId, likedPersonas } = req.body

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }

        if (!Array.isArray(likedPersonas)) {
            return res.status(400).json({ error: 'likedPersonas must be an array' })
        }

        try {
            // Delete existing likes
            await supabaseAdmin
                .from('user_liked_personas')
                .delete()
                .eq('user_id', userId)

            // Insert new likes
            if (likedPersonas.length > 0) {
                const rows = likedPersonas.map(slug => ({
                    user_id: userId,
                    persona_slug: slug,
                    liked_at: new Date().toISOString()
                }))

                const { error } = await supabaseAdmin
                    .from('user_liked_personas')
                    .insert(rows)

                if (error) throw error
            }

            return res.status(200).json({ success: true })
        } catch (error) {
            console.error('Error syncing liked personas:', error)
            return res.status(500).json({ error: 'Failed to sync liked personas' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
