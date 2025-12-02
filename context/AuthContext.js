import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Load user profile from database (or create if doesn't exist)
  const loadUserProfile = async (userId, userMetadata) => {
    if (!userId) {
      setUserProfile(null)
      return
    }

    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Profile doesn't exist yet (first-time user)
        if (error.code === 'PGRST116') {
          // Auto-create profile from Google sign-in data
          const fullName = userMetadata?.full_name || userMetadata?.name || ''
          const preferredName = fullName.split(' ')[0] || userMetadata?.email?.split('@')[0] || 'User'

          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              full_name: fullName,
              preferred_name: preferredName,
              interests: [],
              goals: []
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            setUserProfile(null)
          } else {
            console.log('✅ Auto-created profile for:', preferredName)
            setUserProfile(newProfile)
          }
        } else {
          console.error('Error loading user profile:', error)
        }
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // Check active sessions and sets the user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserProfile(session.user.id, session.user.user_metadata)
        }
        setLoading(false)
      })
      .catch((error) => {
        // Silently handle session errors (e.g., invalid refresh token)
        console.debug('Auth session error (can be ignored for guest users):', error.message)
        setUser(null)
        setUserProfile(null)
        setLoading(false)

        // Clear invalid tokens from localStorage
        if (error.message?.includes('refresh_token') || error.message?.includes('Refresh Token')) {
          localStorage.removeItem('supabase.auth.token')
        }
      })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.user_metadata)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signOut: () => supabase.auth.signOut(),
    refreshProfile: () => user && loadUserProfile(user.id),
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
