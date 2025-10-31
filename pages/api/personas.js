import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data: personas, error } = await supabaseAdmin
      .from('personas')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return res.status(200).json({ personas })
  } catch (error) {
    console.error('Personas API Error:', error)
    return res.status(500).json({ error: 'Failed to fetch personas' })
  }
}
