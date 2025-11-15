/**
 * Supabase Client with Connection Pooling
 * 
 * Optimized for serverless environments (Vercel, AWS Lambda)
 * Uses Supabase's connection pooler for better performance
 */

import { createClient } from '@supabase/supabase-js'

// Server-side client with connection pooling optimizations
export const supabasePooled = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      // Disable session persistence for server-side
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-connection-pool': 'supabase-pooler',
      },
    },
  }
)

// Admin client for privileged operations
export const supabaseAdmin = supabasePooled

// Helper function to execute queries with automatic retries
export async function executeWithRetry(queryFn, maxRetries = 3) {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error) {
      lastError = error
      
      // Retry on connection errors
      const isConnectionError = 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('Connection') ||
        error.message?.includes('timeout')
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      console.log(`[DB] Retrying query (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export default supabasePooled
