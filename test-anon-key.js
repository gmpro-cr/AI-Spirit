import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exdjsvknudvfkabnifrg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTI4MDYsImV4cCI6MjA3NjQ2ODgwNn0.1y7gUdkNObsMDiiFinPOEnyxJV0Ikb8oeRGD8gJgSDA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data, error } = await supabase.from('personas').select('*').limit(1)
    if (error) console.error('Error:', error)
    else console.log('Success:', data)
}

check()
