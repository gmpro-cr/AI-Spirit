import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Track a persona view
        const { personaSlug } = req.body

        if (!personaSlug) {
            return res.status(400).json({ error: 'personaSlug is required' })
        }

        try {
            // Try to increment existing count or insert new record
            const { data: existing, error: fetchError } = await supabaseAdmin
                .from('persona_views')
                .select('view_count')
                .eq('persona_slug', personaSlug)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                // PGRST116 = no rows returned (not found)
                throw fetchError
            }

            if (existing) {
                // Update existing
                const { error: updateError } = await supabaseAdmin
                    .from('persona_views')
                    .update({
                        view_count: existing.view_count + 1,
                        last_viewed_at: new Date().toISOString()
                    })
                    .eq('persona_slug', personaSlug)

                if (updateError) throw updateError
            } else {
                // Insert new
                const { error: insertError } = await supabaseAdmin
                    .from('persona_views')
                    .insert({
                        persona_slug: personaSlug,
                        view_count: 1,
                        last_viewed_at: new Date().toISOString()
                    })

                if (insertError) throw insertError
            }

            return res.status(200).json({ success: true })
        } catch (error) {
            console.error('Error tracking persona view:', error)
            return res.status(500).json({ error: 'Failed to track view' })
        }
    }

    if (req.method === 'GET') {
        // Get view counts for all personas or specific slug
        const { slug } = req.query

        try {
            let query = supabaseAdmin
                .from('persona_views')
                .select('persona_slug, view_count')

            if (slug) {
                query = query.eq('persona_slug', slug)
            }

            const { data, error } = await query.order('view_count', { ascending: false })

            if (error) throw error

            return res.status(200).json({ views: data })
        } catch (error) {
            console.error('Error fetching persona views:', error)
            return res.status(500).json({ error: 'Failed to fetch views' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
