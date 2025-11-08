import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Ensure singleton pattern for Supabase client (prevents multiple instances during hot reload)
const getSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    // Browser-side: Store in window to persist across hot reloads
    if (!window.__supabaseClient) {
      window.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    }
    return window.__supabaseClient
  } else {
    // Server-side: Create new instance (each request is isolated)
    return createClient(supabaseUrl, supabaseAnonKey)
  }
}

export const supabase = getSupabaseClient()

// Server-side client with service role (for API routes)
const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') return null // Admin client should never be used on client

  if (!global.__supabaseAdmin) {
    global.__supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return global.__supabaseAdmin
}

export const supabaseAdmin = getSupabaseAdmin()
