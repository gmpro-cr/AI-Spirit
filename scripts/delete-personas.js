import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function deletePersonas() {
  console.log('🗑️  Deleting Specific Personas\n')

  const personasToDelete = ['Pookie Baba', 'Donald Trump']

  for (const personaName of personasToDelete) {
    console.log(`\n📋 Searching for: ${personaName}`)

    // Search for the persona (using pattern matching to handle trailing spaces)
    const { data: personas, error: searchError } = await supabase
      .from('personas')
      .select('*')
      .ilike('name', `${personaName}%`)

    if (searchError) {
      console.error(`❌ Error searching for ${personaName}:`, searchError)
      continue
    }

    if (!personas || personas.length === 0) {
      console.log(`⚠️  Persona "${personaName}" not found in database`)
      continue
    }

    // Delete each matching persona
    for (const persona of personas) {
      console.log(`   Found: ${persona.name} (ID: ${persona.id}, Slug: ${persona.slug})`)

      const { error: deleteError } = await supabase
        .from('personas')
        .delete()
        .eq('id', persona.id)

      if (deleteError) {
        console.error(`   ❌ Failed to delete:`, deleteError)
      } else {
        console.log(`   ✅ Successfully deleted: ${persona.name}`)
      }
    }
  }

  console.log('\n✨ Deletion process completed!')
}

deletePersonas().catch(console.error)
