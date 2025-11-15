import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  environment: process.env.NODE_ENV,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  beforeSend(event) {
    // Filter out sensitive data from server-side events
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.['authorization']
    }

    // Remove API keys and secrets from context
    if (event.contexts) {
      delete event.contexts.GEMINI_API_KEY
      delete event.contexts.SUPABASE_SERVICE_ROLE_KEY
    }

    return event
  },
})
