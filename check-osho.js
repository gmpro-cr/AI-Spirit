import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exdjsvknudvfkabnifrg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg5MjgwNiwiZXhwIjoyMDc2NDY4ODA2fQ.1y7gUdkNObsMDiiFinPOEnyxJV0Ikb8oeRGD8gJgSDA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOshoPersonas() {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .ilike('name', '%osho%')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Found Osho personas:')
  console.log(JSON.stringify(data, null, 2))
}

checkOshoPersonas()
