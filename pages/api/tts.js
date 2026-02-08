// API route for Sarvam AI Text-to-Speech (Bulbul v3)
// This keeps the API key secure on the server side

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, personaName, language } = req.body

  if (!text || !personaName) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const SARVAM_API_KEY = process.env.SARVAM_API_KEY || process.env.sarvamapi

  if (!SARVAM_API_KEY) {
    return res.status(503).json({
      error: 'Sarvam API key not configured',
      fallback: true
    })
  }

  try {
    // Map personas to Sarvam Bulbul v3 speaker voices
    // Voices: male - Aditya, Rahul, Dev, Kabir, Manan, Sumit, Varun, Shubh, Ashutosh, Advait, Ratan, Aayan, Rohan
    //         female - Ritu, Priya, Neha, Pooja, Simran, Kavya, Ishita, Shreya, Roopa, Amelia, Sophia
    const voiceMapping = {
      // Wise / Older Male
      'Albert Einstein': { speaker: 'ratan', pace: 0.9 },
      'Mahatma Gandhi': { speaker: 'ratan', pace: 0.85 },
      'Charlie Munger': { speaker: 'ratan', pace: 0.9 },
      'Isaac Newton': { speaker: 'advait', pace: 0.85 },
      'Socrates': { speaker: 'advait', pace: 0.85 },
      'Ratan Tata': { speaker: 'ratan', pace: 0.9 },
      'J. Krishnamurti': { speaker: 'ratan', pace: 0.85 },
      'Rabindranath Tagore': { speaker: 'ratan', pace: 0.8 },
      'Gajanan Maharaj': { speaker: 'ratan', pace: 0.8 },
      'Swami Samarth': { speaker: 'ratan', pace: 0.8 },

      // Spiritual / Philosophical Male
      'Osho': { speaker: 'kabir', pace: 0.8 },
      'Swami Vivekananda': { speaker: 'aditya', pace: 0.95 },
      'Sardar Patel': { speaker: 'ashutosh', pace: 0.9 },
      'Subhas Chandra Bose': { speaker: 'aditya', pace: 1.0 },
      'Jawaharlal Nehru': { speaker: 'manan', pace: 0.9 },

      // Energetic / Younger Male
      'Elon Musk': { speaker: 'dev', pace: 1.1 },
      'Virat Kohli': { speaker: 'rahul', pace: 1.1 },
      'Shah Rukh Khan': { speaker: 'aditya', pace: 1.0 },
      'Shaktiman': { speaker: 'varun', pace: 1.0 },

      // Children / Fun
      'Shinchan': { speaker: 'aayan', pace: 1.3 },
      'Chhota Bheem': { speaker: 'aayan', pace: 1.2 },

      // Fictional / Witty Male
      'Tenali Raman': { speaker: 'rohan', pace: 1.0 },
      'Birbal': { speaker: 'manan', pace: 0.95 },

      // Female
      'PV Sindhu': { speaker: 'priya', pace: 1.0 },

      // Romance personas
      'Childhood Friend': { speaker: 'rahul', pace: 1.0 },
      'Cold CEO Boyfriend': { speaker: 'dev', pace: 0.95 },
      'Soft Boyfriend': { speaker: 'aayan', pace: 0.95 },
      'Mysterious Artist': { speaker: 'kabir', pace: 0.9 },
      'Overworked Doctor': { speaker: 'sumit', pace: 0.9 },
      'Campus Crush': { speaker: 'rohan', pace: 1.05 },
      'Grumpy Neighbor Boyfriend': { speaker: 'varun', pace: 0.95 },

      // Professional
      'Career Mentor': { speaker: 'ashutosh', pace: 1.0 },
      'Fitness Coach': { speaker: 'rahul', pace: 1.1 },
      'Life Coach': { speaker: 'manan', pace: 1.0 },
      'Astro Guide': { speaker: 'kabir', pace: 0.9 },
    }

    // Map language codes to Sarvam format
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
    }
    const targetLang = langMap[language] || 'en-IN'

    // Get voice config for this persona
    const voiceConfig = voiceMapping[personaName] || { speaker: 'shubh', pace: 1.0 }

    // Truncate text to Sarvam's 2500 char limit for bulbul:v3
    const truncatedText = text.length > 2500 ? text.substring(0, 2497) + '...' : text

    // Call Sarvam TTS API
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        text: truncatedText,
        target_language_code: targetLang,
        model: 'bulbul:v3',
        speaker: voiceConfig.speaker,
        pace: voiceConfig.pace,
        output_audio_codec: 'mp3',
        speech_sample_rate: 24000,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Sarvam API error:', response.status, errorData)
      return res.status(response.status).json({
        error: 'Failed to generate speech',
        fallback: true
      })
    }

    const data = await response.json()

    if (!data.audios || !data.audios[0]) {
      return res.status(500).json({
        error: 'No audio returned from Sarvam',
        fallback: true
      })
    }

    // Sarvam returns base64-encoded audio - decode and send as binary
    const audioBuffer = Buffer.from(data.audios[0], 'base64')

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioBuffer.byteLength)
    res.send(audioBuffer)

  } catch (error) {
    console.error('TTS API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      fallback: true
    })
  }
}
