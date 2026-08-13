/**
 * Compact relative timestamps for chat lists and message action rows.
 * "just now" → "5m ago" → "3h ago" → "Yesterday" → "Jul 30" → "Jul 30, 2025".
 */
export function relativeTime(value) {
  if (!value) return ''
  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return ''

  const now = new Date()
  const seconds = Math.floor((now - then) / 1000)

  // The cutoff has to be a whole minute: anything lower and the 45-59s band
  // floors to "0m ago".
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysApart = Math.round((startOfToday - new Date(then.getFullYear(), then.getMonth(), then.getDate())) / 86400000)

  if (daysApart === 1) return 'Yesterday'
  if (daysApart < 7) return `${daysApart}d ago`

  const sameYear = then.getFullYear() === now.getFullYear()
  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

/** Bucket label used to group a conversation list by recency. */
export function dateGroup(value) {
  if (!value) return 'Earlier'
  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return 'Earlier'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysApart = Math.round((startOfToday - new Date(then.getFullYear(), then.getMonth(), then.getDate())) / 86400000)

  if (daysApart <= 0) return 'Today'
  if (daysApart === 1) return 'Yesterday'
  if (daysApart < 7) return 'Previous 7 days'
  if (daysApart < 30) return 'Previous 30 days'
  return 'Earlier'
}

/** Absolute timestamp for tooltips. */
export function absoluteTime(value) {
  if (!value) return ''
  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return ''
  return then.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
