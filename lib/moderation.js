const BANNED_WORDS = [
  // Add profanity, slurs, explicit content
  // Load from configuration or external file for easy updates
]

export function moderateContent(text) {
  const lowerText = text.toLowerCase()

  // Check banned words
  for (const word of BANNED_WORDS) {
    if (lowerText.includes(word)) {
      return { blocked: true, reason: 'inappropriate_language' }
    }
  }

  // Check message length
  if (text.length > 1000) {
    return { blocked: true, reason: 'message_too_long' }
  }

  if (text.length < 1) {
    return { blocked: true, reason: 'empty_message' }
  }

  // Check for spam patterns
  if (/(.)\1{10,}/.test(text)) {
    return { blocked: true, reason: 'spam_detected' }
  }

  return { blocked: false }
}
