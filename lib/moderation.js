import Filter from 'bad-words'

const filter = new Filter()

// PII Detection Patterns
const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
}

// Prompt Injection Detection
const INJECTION_PATTERNS = [
  /ignore (previous|all|prior) (instructions?|rules?|prompts?)/i,
  /you are now (DAN|jailbreak)/i,
  /pretend you (have no|don't have|do not have)/i,
  /forget (your|all|previous) (instructions?|rules?|programming)/i,
  /act as if you (are|were) (not|no longer)/i,
]

export function moderateContent(text) {
  const lowerText = text.toLowerCase()

  // 1. Check message length
  if (text.length < 1) {
    return { blocked: true, reason: 'empty_message' }
  }

  if (text.length > 2000) {
    return { blocked: true, reason: 'message_too_long' }
  }

  // 2. Check for profanity
  if (filter.isProfane(text)) {
    return { blocked: true, reason: 'inappropriate_language' }
  }

  // 3. Check for PII (Personal Identifiable Information)
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(text)) {
      return { blocked: true, reason: `pii_detected_${type}` }
    }
  }

  // 4. Check for prompt injection attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: 'prompt_injection_attempt' }
    }
  }

  // 5. Check for spam patterns (repeated characters)
  if (/(.)\1{10,}/.test(text)) {
    return { blocked: true, reason: 'spam_detected' }
  }

  // 6. Check for excessive URLs (spam)
  const urlCount = (text.match(/https?:\/\//g) || []).length
  if (urlCount > 3) {
    return { blocked: true, reason: 'excessive_urls' }
  }

  // 7. Check for ALL CAPS (shouting/spam)
  const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (text.length > 20 && uppercaseRatio > 0.7) {
    return { blocked: true, reason: 'excessive_caps' }
  }

  return { blocked: false }
}

// Additional function to sanitize messages for display (prevent XSS)
export function sanitizeForDisplay(text) {
  // Basic HTML escaping
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
