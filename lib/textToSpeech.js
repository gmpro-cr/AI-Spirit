// Text-to-Speech utility
// Uses ElevenLabs API for realistic AI voices, falls back to Web Speech API

// Current audio element for ElevenLabs playback
let currentAudio = null
let currentUtterance = null

// Main speak function - tries ElevenLabs first, falls back to Web Speech API
export const speak = async (text, personaName, language = 'en', onEnd = null) => {
  // Try ElevenLabs first
  try {
    const audio = await speakWithElevenLabs(text, personaName, language, onEnd)
    if (audio) {
      return audio
    }
  } catch (error) {
    console.log('ElevenLabs failed, using Web Speech API fallback:', error.message)
  }

  // Fallback to Web Speech API
  return speakWithWebSpeech(text, personaName, language, onEnd)
}

// Speak using ElevenLabs API (realistic AI voices)
const speakWithElevenLabs = async (text, personaName, language = 'en', onEnd = null) => {
  try {
    // Stop any currently playing audio
    stopSpeaking()

    // Call our API route which handles ElevenLabs
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        personaName,
        language
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (errorData.fallback) {
        // Signal to use fallback
        throw new Error('ElevenLabs not available')
      }
      throw new Error('Failed to generate speech')
    }

    // Get the audio blob
    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    // Create and play audio element
    currentAudio = new Audio(audioUrl)

    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      currentAudio = null
      if (onEnd) onEnd()
    }

    currentAudio.onerror = (error) => {
      console.error('Audio playback error:', error)
      URL.revokeObjectURL(audioUrl)
      currentAudio = null
      throw error
    }

    await currentAudio.play()
    return currentAudio

  } catch (error) {
    if (currentAudio) {
      currentAudio = null
    }
    throw error
  }
}

// Web Speech API fallback
const speakWithWebSpeech = (text, personaName, language = 'en', onEnd = null) => {
  // Check if speech synthesis is supported
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported')
    return null
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text)

  // Get voice configuration for this persona
  const { voice, pitch, rate } = getVoiceForPersona(personaName, language)

  if (voice) {
    utterance.voice = voice
  }
  utterance.pitch = pitch
  utterance.rate = rate
  utterance.volume = 1.0

  // Add event listeners
  if (onEnd) {
    utterance.onend = onEnd
  }

  utterance.onerror = (error) => {
    console.error('Speech synthesis error:', error)
  }

  // Speak
  window.speechSynthesis.speak(utterance)
  currentUtterance = utterance

  return utterance
}

// Voice configuration for Web Speech API fallback
export const getVoiceForPersona = (personaName, language = 'en') => {
  const voices = window.speechSynthesis.getVoices()

  // Voice preferences based on persona characteristics
  const voicePreferences = {
    // Male voices - English
    'Elon Musk': { lang: 'en-US', gender: 'male', pitch: 1.0, rate: 1.1 },
    'Ratan Tata': { lang: 'en-IN', gender: 'male', pitch: 0.9, rate: 0.9 },
    'Virat Kohli': { lang: 'en-IN', gender: 'male', pitch: 1.1, rate: 1.0 },
    'APJ Abdul Kalam': { lang: 'en-IN', gender: 'male', pitch: 0.85, rate: 0.85 },
    'Albert Einstein': { lang: 'en-US', gender: 'male', pitch: 0.9, rate: 0.9 },
    'Charlie Munger': { lang: 'en-US', gender: 'male', pitch: 0.85, rate: 0.9 },
    'Isaac Newton': { lang: 'en-GB', gender: 'male', pitch: 0.9, rate: 0.85 },
    'Osho': { lang: 'en-IN', gender: 'male', pitch: 0.9, rate: 0.8 },
    'Socrates': { lang: 'en-GB', gender: 'male', pitch: 0.95, rate: 0.85 },
    'J. Krishnamurti': { lang: 'en-IN', gender: 'male', pitch: 0.9, rate: 0.85 },
    'Subhas Chandra Bose': { lang: 'hi-IN', gender: 'male', pitch: 1.0, rate: 0.9 },
    'Jawaharlal Nehru': { lang: 'hi-IN', gender: 'male', pitch: 0.9, rate: 0.85 },
    'Sardar Patel': { lang: 'hi-IN', gender: 'male', pitch: 0.95, rate: 0.9 },

    // Female voices
    'PV Sindhu': { lang: 'en-IN', gender: 'female', pitch: 1.1, rate: 1.0 },

    // Hindi/Indian voices
    'Shah Rukh Khan': { lang: 'hi-IN', gender: 'male', pitch: 1.0, rate: 1.0 },
    'Swami Vivekananda': { lang: 'hi-IN', gender: 'male', pitch: 0.95, rate: 0.85 },
    'Mahatma Gandhi': { lang: 'hi-IN', gender: 'male', pitch: 0.9, rate: 0.8 },
    'Rabindranath Tagore': { lang: 'hi-IN', gender: 'male', pitch: 0.85, rate: 0.8 },

    // Marathi voices
    'Gajanan Maharaj': { lang: 'mr-IN', gender: 'male', pitch: 0.9, rate: 0.85 },
    'Swami Samarth': { lang: 'mr-IN', gender: 'male', pitch: 0.85, rate: 0.85 },

    // Fictional characters - Hindi
    'Tenali Raman': { lang: 'hi-IN', gender: 'male', pitch: 1.05, rate: 1.0 },
    'Birbal': { lang: 'hi-IN', gender: 'male', pitch: 1.0, rate: 0.95 },
    'Shaktiman': { lang: 'hi-IN', gender: 'male', pitch: 1.1, rate: 1.0 },
    'Shinchan': { lang: 'hi-IN', gender: 'male', pitch: 1.4, rate: 1.1 }, // High pitch for child
    'Chhota Bheem': { lang: 'hi-IN', gender: 'male', pitch: 1.3, rate: 1.05 }, // High pitch for child
  }

  const preference = voicePreferences[personaName] || { lang: language === 'hi' ? 'hi-IN' : 'en-US', gender: 'male', pitch: 1.0, rate: 1.0 }

  // Try to find a voice that matches the language and gender
  let selectedVoice = null

  // Helper to check if voice is a quality voice (not novelty/effects)
  const isQualityVoice = (voice) => {
    const noveltyNames = ['bad news', 'good news', 'bells', 'boing', 'bubbles', 'cellos', 
                          'jester', 'organ', 'superstar', 'trinoids', 'whisper', 'wobble', 
                          'zarvox', 'bahh', 'junior', 'ralph', 'fred', 'kathy', 'albert']
    return !noveltyNames.some(n => voice.name.toLowerCase().includes(n))
  }

  // Preferred voices for better quality
  const preferredVoices = {
    'en-US': preference.gender === 'female' ? 'Samantha' : 'Eddy',
    'en-GB': preference.gender === 'female' ? 'Serena' : 'Daniel',
    'en-IN': 'Rishi',
    'hi-IN': 'Lekha',
    'mr-IN': null  // No preferred, will use first available
  }

  // First priority: preferred voice for this locale
  const preferredName = preferredVoices[preference.lang]
  if (preferredName) {
    selectedVoice = voices.find(v => v.name === preferredName || v.name.includes(preferredName))
  }

  // Second priority: exact locale match with gender preference
  if (!selectedVoice) {
    selectedVoice = voices.find(v =>
      v.lang === preference.lang &&
      isQualityVoice(v) &&
      (preference.gender === 'female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') : true)
    )
  }

  // Third priority: exact locale match (any gender)
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang === preference.lang && isQualityVoice(v))
  }

  // Fourth priority: language-only match (e.g., en-* for en-US) with gender preference
  if (!selectedVoice) {
    selectedVoice = voices.find(v =>
      v.lang.startsWith(preference.lang.split('-')[0] + '-') &&
      isQualityVoice(v) &&
      (preference.gender === 'female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') : true)
    )
  }

  // Fifth priority: language-only match (any gender)
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith(preference.lang.split('-')[0] + '-') && isQualityVoice(v))
  }

  // Sixth priority: English fallback (quality voices only)
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith('en-') && isQualityVoice(v))
  }

  // Seventh priority: any English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith('en-'))
  }

  // Eighth priority: any available voice
  if (!selectedVoice && voices.length > 0) {
    selectedVoice = voices[0]
  }

  return {
    voice: selectedVoice,
    pitch: preference.pitch,
    rate: preference.rate
  }
}

export const stopSpeaking = () => {
  // Stop ElevenLabs audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }

  // Stop Web Speech API
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }

  currentUtterance = null
}

export const isSpeaking = () => {
  // Check if ElevenLabs audio is playing
  if (currentAudio && !currentAudio.paused) {
    return true
  }

  // Check if Web Speech API is speaking
  return window.speechSynthesis && window.speechSynthesis.speaking
}

// Load voices (some browsers need this for Web Speech API)
export const loadVoices = () => {
  if (!window.speechSynthesis) {
    return Promise.resolve([])
  }

  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices()
    if (voices.length) {
      resolve(voices)
      return
    }

    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices()
      resolve(voices)
    }
  })
}
