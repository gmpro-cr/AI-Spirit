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

async function checkMessages() {
    console.log('🔍 Checking Messages in Database...\n')

    // Get recent conversations
    const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    if (convError) {
        console.error('❌ Error fetching conversations:', convError.message)
        return
    }

    console.log(`Found ${conversations.length} recent conversations:`)

    for (const conv of conversations) {
        console.log(`\n📄 Conversation: ${conv.title || 'Untitled'} (${conv.id})`)
        console.log(`   Persona: ${conv.persona_slug}`)
        console.log(`   User ID: ${conv.user_id}`)
        console.log(`   Created: ${new Date(conv.created_at).toLocaleString()}`)

        // Get messages for this conversation
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true })

        if (msgError) {
            console.error('   ❌ Error fetching messages:', msgError.message)
        } else {
            console.log(`   Messages (${messages.length}):`)
            messages.forEach(msg => {
                const content = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content
                console.log(`     [${msg.role}] ${content}`)
            })
        }
    }

    if (conversations.length === 0) {
        console.log('⚠️  No conversations found in the database.')
        console.log('   This means either:')
        console.log('   1. The frontend is not sending the request to create a conversation.')
        console.log('   2. The API is failing to create the conversation.')
        console.log('   3. RLS policies might be preventing insertion (though we are using service role here).')
    }
}

checkMessages()
