import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspect() {
    // We can't easily inspect schema via JS client without admin API or raw SQL
    // But we can try to insert a dummy record and see the error details, or try to select one.

    // Let's try to select one record
    const { data, error } = await supabase.from('conversations').select('*').limit(1)

    if (error) {
        console.log('Error selecting:', error)
    } else {
        console.log('Data:', data)
        if (data.length > 0) {
            console.log('Keys:', Object.keys(data[0]))
        }
    }
}

inspect()
