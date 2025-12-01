import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Load .env.local manually
let envVars = {}
const envPath = join(rootDir, '.env.local')

if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.+)$/)
        if (match) {
            envVars[match[1].trim()] = match[2].trim()
        }
    })
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials!')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getUsers() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    console.log('Users found:', users.length)
    users.forEach(u => {
        console.log(`- ${u.email} (${u.id})`)
    })
}

getUsers()
