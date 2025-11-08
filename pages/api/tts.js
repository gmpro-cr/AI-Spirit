// API route for ElevenLabs Text-to-Speech
// This keeps the API key secure on the server side

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, personaName, language } = req.body

  if (!text || !personaName) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

  // If no API key, return error so client can fallback to Web Speech API
  if (!ELEVENLABS_API_KEY) {
    return res.status(503).json({
      error: 'ElevenLabs API key not configured',
      fallback: true
    })
  }

  try {
    // Map personas to ElevenLabs voice IDs
    // Optimized voices based on AI matching for persona characteristics (age, accent, tone)
    const voiceMapping = {
      // English - Male (Authoritative/Older)
      'Albert Einstein': 'pqHfZKP75CvOlQylNhV4', // Bill - old, American, wise
      'APJ Abdul Kalam': 'pqHfZKP75CvOlQylNhV4', // Bill - old, American, inspirational
      'Isaac Newton': 'JBFqnCBsd6RMkjVDRZzb', // George - British, mature, intellectual
      'Charlie Munger': 'pqHfZKP75CvOlQylNhV4', // Bill - old, American, wise
      'Mahatma Gandhi': 'pqHfZKP75CvOlQylNhV4', // Bill - old, calm, gentle
      'Socrates': 'JBFqnCBsd6RMkjVDRZzb', // George - British, mature, philosophical
      'Sardar Patel': 'onwK4e9ZLuTAKqWW03F9', // Daniel - British, formal, strong

      // English - Male (Younger/Energetic)
      'Elon Musk': 'CwhRBWXzGAHq8TQ4Fs17', // Roger - American, conversational, classy
      'Virat Kohli': 'IKne3meq5aSn9XLyUdCD', // Charlie - young, energetic, hyped
      'Shaktiman': 'N2lVS1w4EtoT3dr4eOWO', // Callum - middle-aged, characters, heroic

      // English - Male (Calm/Philosophical)
      'J. Krishnamurti': 'pqHfZKP75CvOlQylNhV4', // Bill - old, calm, contemplative
      'Osho': 'N2lVS1w4EtoT3dr4eOWO', // Callum - middle-aged, mystical, characters
      'Ratan Tata': 'pqHfZKP75CvOlQylNhV4', // Bill - old, gentle, wise

      // English - Male (Storytellers)
      'Subhas Chandra Bose': 'N2lVS1w4EtoT3dr4eOWO', // Callum - middle-aged, revolutionary
      'Jawaharlal Nehru': 'N2lVS1w4EtoT3dr4eOWO', // Callum - middle-aged, eloquent

      // Hindi - Male
      'Shah Rukh Khan': 'N2lVS1w4EtoT3dr4eOWO', // Callum - middle-aged, charismatic
      'Swami Vivekananda': 'IKne3meq5aSn9XLyUdCD', // Charlie - young, powerful, hyped
      'Rabindranath Tagore': 'pqHfZKP75CvOlQylNhV4', // Bill - old, poetic, gentle
      'Tenali Raman': 'N2lVS1w4EtoT3dr4eOWO', // Callum - middle-aged, witty, characters
      'Birbal': 'N2lVS1w4EtoT3dr4eOWO', // Callum - middle-aged, clever, characters

      // Hindi - Children
      'Shinchan': 'N2lVS1w4EtoT3dr4eOWO', // Callum - characters (child-like)
      'Chhota Bheem': 'IKne3meq5aSn9XLyUdCD', // Charlie - young, energetic

      // Female
      'PV Sindhu': 'EXAVITQu4vr4xnSDxMaL', // Sarah - young, professional, confident

      // Marathi
      'Gajanan Maharaj': 'pqHfZKP75CvOlQylNhV4', // Bill - old, spiritual, calm
      'Swami Samarth': 'pqHfZKP75CvOlQylNhV4', // Bill - old, spiritual, calm
    }

    // Get voice ID for this persona, fallback to a default voice
    const voiceId = voiceMapping[personaName] || 'pNInz6obpgDQGcFmaJgB'

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports multiple languages
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('ElevenLabs API error:', errorData)
      return res.status(response.status).json({
        error: 'Failed to generate speech',
        fallback: true
      })
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()

    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioBuffer.byteLength)

    // Send the audio data
    res.send(Buffer.from(audioBuffer))

  } catch (error) {
    console.error('TTS API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      fallback: true
    })
  }
}
