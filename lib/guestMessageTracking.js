// Guest message tracking utilities
// Tracks message counts for guest users to enforce limits:
// - 10 messages: Prompt to sign in
// - 50 messages: Prompt for premium subscription

const GUEST_MESSAGE_COUNT_KEY = 'esperit_guest_message_count'
const GUEST_SIGNIN_DISMISSED_KEY = 'esperit_signin_prompt_dismissed'
const GUEST_PREMIUM_DISMISSED_KEY = 'esperit_premium_prompt_dismissed'

const SIGNIN_LIMIT = 10
const PREMIUM_LIMIT = 50

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
  localStorage.removeItem(GUEST_SIGNIN_DISMISSED_KEY)
  localStorage.removeItem(GUEST_PREMIUM_DISMISSED_KEY)
}

/**
 * Check if sign-in limit (10 messages) has been reached
 * @returns {boolean} True if limit reached
 */
export function shouldShowSignInPrompt() {
  const count = getGuestMessageCount()
  const dismissed = localStorage.getItem(GUEST_SIGNIN_DISMISSED_KEY)

  return count >= SIGNIN_LIMIT && !dismissed
}

/**
 * Check if premium limit (50 messages) has been reached
 * @returns {boolean} True if limit reached
 */
export function shouldShowPremiumPrompt() {
  const count = getGuestMessageCount()
  const dismissed = localStorage.getItem(GUEST_PREMIUM_DISMISSED_KEY)

  return count >= PREMIUM_LIMIT && !dismissed
}

/**
 * Mark sign-in prompt as dismissed
 */
export function dismissSignInPrompt() {
  if (typeof window === 'undefined') return

  localStorage.setItem(GUEST_SIGNIN_DISMISSED_KEY, 'true')
}

/**
 * Mark premium prompt as dismissed
 */
export function dismissPremiumPrompt() {
  if (typeof window === 'undefined') return

  localStorage.setItem(GUEST_PREMIUM_DISMISSED_KEY, 'true')
}

/**
 * Check if message can be sent (under limit or dismissed)
 * @returns {Object} { canSend: boolean, reason: string|null }
 */
export function canSendMessage() {
  const count = getGuestMessageCount()

  // Premium limit is hard stop (cannot be dismissed)
  if (count >= PREMIUM_LIMIT) {
    return {
      canSend: false,
      reason: 'premium_required',
      message: 'You\'ve reached your 50 message limit! Sign in or upgrade to Premium for unlimited access.'
    }
  }

  // Sign-in prompt is soft (can be dismissed)
  return {
    canSend: true,
    reason: null
  }
}

/**
 * Get stats about guest usage
 * @returns {Object} Usage statistics
 */
export function getGuestUsageStats() {
  const count = getGuestMessageCount()
  const signinDismissed = !!localStorage.getItem(GUEST_SIGNIN_DISMISSED_KEY)
  const premiumDismissed = !!localStorage.getItem(GUEST_PREMIUM_DISMISSED_KEY)

  return {
    messageCount: count,
    signinLimitReached: count >= SIGNIN_LIMIT,
    premiumLimitReached: count >= PREMIUM_LIMIT,
    signinPromptDismissed: signinDismissed,
    premiumPromptDismissed: premiumDismissed,
    remainingMessages: Math.max(0, PREMIUM_LIMIT - count)
  }
}
