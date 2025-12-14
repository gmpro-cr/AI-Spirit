import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Use undefined as default to properly detect usage outside provider
const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((error) => {
        // Silently handle session errors (e.g., invalid refresh token)
        console.debug('Auth session error (can be ignored for guest users):', error.message)
        setUser(null)
        setLoading(false)

        // Clear invalid tokens from localStorage
        if (error.message?.includes('refresh_token') || error.message?.includes('Refresh Token')) {
          localStorage.removeItem('supabase.auth.token')
        }
      })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
