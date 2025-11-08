// Script to find and suggest ElevenLabs voices for each persona
// This helps identify authentic voices from the ElevenLabs voice library

import 'dotenv/config'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

// Persona characteristics to match against
const personaCharacteristics = {
  // English - Male (Authoritative/Older)
  'Albert Einstein': { age: 'old', accent: 'german', tone: 'wise', gender: 'male' },
  'APJ Abdul Kalam': { age: 'old', accent: 'indian', tone: 'inspirational', gender: 'male' },
  'Isaac Newton': { age: 'middle_aged', accent: 'british', tone: 'intellectual', gender: 'male' },
  'Charlie Munger': { age: 'old', accent: 'american', tone: 'wise', gender: 'male' },
  'Mahatma Gandhi': { age: 'old', accent: 'indian', tone: 'calm', gender: 'male' },
  'Socrates': { age: 'old', accent: 'british', tone: 'philosophical', gender: 'male' },
  'Sardar Patel': { age: 'middle_aged', accent: 'indian', tone: 'strong', gender: 'male' },

  // English - Male (Younger/Energetic)
  'Elon Musk': { age: 'middle_aged', accent: 'american', tone: 'casual', gender: 'male' },
  'Virat Kohli': { age: 'young', accent: 'indian', tone: 'energetic', gender: 'male' },
  'Shaktiman': { age: 'middle_aged', accent: 'indian', tone: 'heroic', gender: 'male' },

  // English - Male (Calm/Philosophical)
  'J. Krishnamurti': { age: 'old', accent: 'indian', tone: 'calm', gender: 'male' },
  'Osho': { age: 'middle_aged', accent: 'indian', tone: 'mystical', gender: 'male' },
  'Ratan Tata': { age: 'old', accent: 'indian', tone: 'gentle', gender: 'male' },

  // English - Male (Storytellers)
  'Subhas Chandra Bose': { age: 'middle_aged', accent: 'indian', tone: 'revolutionary', gender: 'male' },
  'Jawaharlal Nehru': { age: 'middle_aged', accent: 'indian', tone: 'eloquent', gender: 'male' },

  // Hindi - Male
  'Shah Rukh Khan': { age: 'middle_aged', accent: 'indian', tone: 'charismatic', gender: 'male' },
  'Swami Vivekananda': { age: 'young', accent: 'indian', tone: 'powerful', gender: 'male' },
  'Rabindranath Tagore': { age: 'old', accent: 'indian', tone: 'poetic', gender: 'male' },
  'Tenali Raman': { age: 'middle_aged', accent: 'indian', tone: 'witty', gender: 'male' },
  'Birbal': { age: 'middle_aged', accent: 'indian', tone: 'clever', gender: 'male' },

  // Hindi - Children
  'Shinchan': { age: 'child', accent: 'japanese', tone: 'playful', gender: 'male' },
  'Chhota Bheem': { age: 'child', accent: 'indian', tone: 'energetic', gender: 'male' },

  // Female
  'PV Sindhu': { age: 'young', accent: 'indian', tone: 'confident', gender: 'female' },

  // Marathi
  'Gajanan Maharaj': { age: 'old', accent: 'indian', tone: 'spiritual', gender: 'male' },
  'Swami Samarth': { age: 'old', accent: 'indian', tone: 'spiritual', gender: 'male' },
}

async function getAllVoices() {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not found in environment variables')
    console.log('Please add it to your .env.local file')
    process.exit(1)
  }

  try {
    // Get all available voices from ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.voices
  } catch (error) {
    console.error('❌ Error fetching voices:', error.message)
    process.exit(1)
  }
}

async function searchVoiceLibrary(query, category = null) {
  if (!ELEVENLABS_API_KEY) {
    return []
  }

  try {
    let url = `https://api.elevenlabs.io/v1/shared-voices?page_size=100`
    if (category) {
      url += `&category=${category}`
    }

    const response = await fetch(url, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    // Filter by query if provided
    if (query) {
      return data.voices.filter(voice => {
        const name = voice.name?.toLowerCase() || ''
        const description = voice.description?.toLowerCase() || ''
        return name.includes(query.toLowerCase()) || description.includes(query.toLowerCase())
      })
    }

    return data.voices
  } catch (error) {
    console.error(`Error searching voice library:`, error.message)
    return []
  }
}

function scoreVoiceMatch(voice, characteristics) {
  let score = 0
  const name = voice.name?.toLowerCase() || ''
  const description = voice.description?.toLowerCase() || ''
  const labels = voice.labels || {}

  // Age matching
  if (labels.age === characteristics.age) score += 3
  else if (labels.age && characteristics.age) score -= 1

  // Accent matching
  if (labels.accent === characteristics.accent) score += 3
  else if (labels.accent && characteristics.accent) score -= 1

  // Gender matching
  if (labels.gender === characteristics.gender) score += 5
  else if (labels.gender && characteristics.gender) score -= 3

  // Tone/use case matching (check description)
  if (description.includes(characteristics.tone)) score += 2

  return score
}

async function findBestVoicesForPersonas() {
  console.log('🔍 Searching for voices in ElevenLabs library...\n')

  const myVoices = await getAllVoices()
  console.log(`📚 Found ${myVoices.length} voices in your account\n`)

  const suggestions = {}

  for (const [personaName, characteristics] of Object.entries(personaCharacteristics)) {
    console.log(`\n🎭 ${personaName}`)
    console.log(`   Characteristics: ${JSON.stringify(characteristics)}`)

    // Search voice library for potential matches
    const libraryVoices = await searchVoiceLibrary(personaName.split(' ')[0])

    // Score all voices (both library and owned)
    const allVoices = [...myVoices, ...libraryVoices]
    const scoredVoices = allVoices.map(voice => ({
      voice,
      score: scoreVoiceMatch(voice, characteristics)
    }))

    // Sort by score
    scoredVoices.sort((a, b) => b.score - a.score)

    // Get top 3
    const topMatches = scoredVoices.slice(0, 3)

    console.log('   Top matches:')
    topMatches.forEach((match, i) => {
      const { voice, score } = match
      const isOwned = myVoices.some(v => v.voice_id === voice.voice_id)
      console.log(`   ${i + 1}. ${voice.name} (${voice.voice_id})`)
      console.log(`      Score: ${score} | ${isOwned ? '✅ Owned' : '📥 Library'}`)
      if (voice.labels) {
        console.log(`      Labels: ${JSON.stringify(voice.labels)}`)
      }
    })

    if (topMatches.length > 0) {
      suggestions[personaName] = topMatches[0].voice.voice_id
    }

    // Rate limit: wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n\n📋 Suggested Voice Mappings for pages/api/tts.js:\n')
  console.log('const voiceMapping = {')
  for (const [personaName, voiceId] of Object.entries(suggestions)) {
    console.log(`  '${personaName}': '${voiceId}',`)
  }
  console.log('}\n')

  return suggestions
}

// Run the script
findBestVoicesForPersonas()
  .then(() => {
    console.log('✅ Voice search complete!')
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
