// Guest message tracking utilities
// Tracks message counts for guest users to enforce limits:
// - Every 30 seconds: Prompt to sign in (can be dismissed)
// - 100 messages: Compulsory sign-in (hard block)
// - 150 messages: Prompt for premium subscription (hard block)

const GUEST_MESSAGE_COUNT_KEY = 'esperit_guest_message_count'
const GUEST_LAST_PROMPT_TIME_KEY = 'esperit_last_prompt_time'
const GUEST_PREMIUM_DISMISSED_KEY = 'esperit_premium_prompt_dismissed'

const SIGNIN_LIMIT = 100
const PREMIUM_LIMIT = 150
const TIME_BASED_PROMPT_INTERVAL = 30000 // 30 seconds in milliseconds

/**
 * Get current guest message count
 * @returns {number} Current message count
 */
export function getGuestMessageCount() {
  if (typeof window === 'undefined') return 0

  const count = localStorage.getItem(GUEST_MESSAGE_COUNT_KEY)
  return count ? parseInt(count, 10) : 0
}

/**
 * Increment guest message count by 1
 * @returns {number} New message count
 */
export function incrementGuestMessageCount() {
  if (typeof window === 'undefined') return 0

  const currentCount = getGuestMessageCount()
  const newCount = currentCount + 1
  localStorage.setItem(GUEST_MESSAGE_COUNT_KEY, newCount.toString())

  return newCount
}

/**
 * Reset guest message count to 0
 */
export function resetGuestMessageCount() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(GUEST_MESSAGE_COUNT_KEY)
  localStorage.removeItem(GUEST_LAST_PROMPT_TIME_KEY)
  localStorage.removeItem(GUEST_PREMIUM_DISMISSED_KEY)
}

/**
 * Check if it's time to show the recurring sign-in prompt (every 30 seconds)
 * @returns {boolean} True if 30 seconds have passed since last prompt
 */
export function shouldShowTimeBasedPrompt() {
  if (typeof window === 'undefined') return false

  const count = getGuestMessageCount()

  // Don't show time-based prompts if user hit 100 or 150 message limits
  if (count >= SIGNIN_LIMIT) return false

  const lastPromptTime = localStorage.getItem(GUEST_LAST_PROMPT_TIME_KEY)

  if (!lastPromptTime) {
    // First time - show prompt after 30 seconds
    return true
  }

  const timeSinceLastPrompt = Date.now() - parseInt(lastPromptTime, 10)
  return timeSinceLastPrompt >= TIME_BASED_PROMPT_INTERVAL
}

/**
 * Update the last prompt time to now
 */
export function updateLastPromptTime() {
  if (typeof window === 'undefined') return

  localStorage.setItem(GUEST_LAST_PROMPT_TIME_KEY, Date.now().toString())
}

/**
 * Check if sign-in is compulsory (100 messages reached)
 * @returns {boolean} True if 100 messages reached
 */
export function isSignInRequired() {
  const count = getGuestMessageCount()
  return count >= SIGNIN_LIMIT && count < PREMIUM_LIMIT
}

/**
 * Check if premium limit (150 messages) has been reached
 * @returns {boolean} True if limit reached
 */
export function shouldShowPremiumPrompt() {
  const count = getGuestMessageCount()
  const dismissed = localStorage.getItem(GUEST_PREMIUM_DISMISSED_KEY)

  return count >= PREMIUM_LIMIT && !dismissed
}

/**
 * Mark premium prompt as dismissed (no longer used, kept for backwards compatibility)
 */
export function dismissPremiumPrompt() {
  if (typeof window === 'undefined') return

  localStorage.setItem(GUEST_PREMIUM_DISMISSED_KEY, 'true')
}

/**
 * Check if message can be sent (enforces 100 and 150 message limits)
 * @returns {Object} { canSend: boolean, reason: string|null, message: string|null }
 */
export function canSendMessage() {
  const count = getGuestMessageCount()

  // Premium limit (150 messages) - hard stop
  if (count >= PREMIUM_LIMIT) {
    return {
      canSend: false,
      reason: 'premium_required',
      message: 'You\'ve reached your 150 message limit! Upgrade to Premium for unlimited access.'
    }
  }

  // Sign-in limit (100 messages) - hard stop
  if (count >= SIGNIN_LIMIT) {
    return {
      canSend: false,
      reason: 'signin_required',
      message: 'You\'ve reached your 100 message limit! Sign in to continue chatting.'
    }
  }

  // Under limits - can send
  return {
    canSend: true,
    reason: null,
    message: null
  }
}

/**
 * Get stats about guest usage
 * @returns {Object} Usage statistics
 */
export function getGuestUsageStats() {
  const count = getGuestMessageCount()
  const premiumDismissed = !!localStorage.getItem(GUEST_PREMIUM_DISMISSED_KEY)

  return {
    messageCount: count,
    signinLimitReached: count >= SIGNIN_LIMIT,
    premiumLimitReached: count >= PREMIUM_LIMIT,
    premiumPromptDismissed: premiumDismissed,
    remainingMessages: Math.max(0, PREMIUM_LIMIT - count)
  }
}
