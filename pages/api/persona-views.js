import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Track a persona view OR increment message count
        const { personaSlug, incrementMessages } = req.body

        if (!personaSlug) {
            return res.status(400).json({ error: 'personaSlug is required' })
        }

        try {
            // Try to get existing record
            const { data: existing, error: fetchError } = await supabaseAdmin
                .from('persona_views')
                .select('view_count, message_count')
                .eq('persona_slug', personaSlug)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                // PGRST116 = no rows returned (not found)
                throw fetchError
            }

            if (existing) {
                // Update existing - increment view or message count
                const updateData = {
                    last_viewed_at: new Date().toISOString()
                }

                if (incrementMessages) {
                    // Increment message count by 2 (user + assistant)
                    updateData.message_count = (existing.message_count || 0) + 2
                } else {
                    // Increment view count
                    updateData.view_count = existing.view_count + 1
                }

                const { error: updateError } = await supabaseAdmin
                    .from('persona_views')
                    .update(updateData)
                    .eq('persona_slug', personaSlug)

                if (updateError) throw updateError
            } else {
                // Insert new record
                const insertData = {
                    persona_slug: personaSlug,
                    view_count: incrementMessages ? 0 : 1,
                    message_count: incrementMessages ? 2 : 0,
                    last_viewed_at: new Date().toISOString()
                }

                const { error: insertError } = await supabaseAdmin
                    .from('persona_views')
                    .insert(insertData)

                if (insertError) throw insertError
            }

            return res.status(200).json({ success: true })
        } catch (error) {
            console.error('Error tracking persona:', error)
            return res.status(500).json({ error: 'Failed to track' })
        }
    }

    if (req.method === 'GET') {
        // Get view counts and message counts for all personas or specific slug
        const { slug } = req.query

        try {
            let query = supabaseAdmin
                .from('persona_views')
                .select('persona_slug, view_count, message_count')

            if (slug) {
                query = query.eq('persona_slug', slug)
            }

            const { data, error } = await query.order('message_count', { ascending: false })

            if (error) throw error

            // These counts are identical for every visitor — nothing here is
            // personalized — but the route was previously uncacheable, so each
            // pageview paid a function invocation plus a Supabase round trip
            // (~530ms). That delay is exactly the window in which the personas
            // grid sits in catalogue order before re-sorting by popularity.
            // Serving it from the edge collapses that window. Counts going up to
            // 5 minutes stale is irrelevant to a popularity sort.
            res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')

            return res.status(200).json({ views: data })
        } catch (error) {
            console.error('Error fetching persona stats:', error)
            return res.status(500).json({ error: 'Failed to fetch stats' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}

