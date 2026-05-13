import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

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
        if (error.code === 'PGRST116') {
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

  const loadSubscriptionStatus = async (userId) => {
    if (!userId) {
      setIsPremium(false)
      return
    }
    try {
      const res = await fetch(`/api/user/subscription-status?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setIsPremium(data.isPremium || false)
      }
    } catch {
      setIsPremium(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserProfile(session.user.id, session.user.user_metadata)
          loadSubscriptionStatus(session.user.id)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.debug('Auth session error (can be ignored for guest users):', error.message)
        setUser(null)
        setUserProfile(null)
        setIsPremium(false)
        setLoading(false)

        if (error.message?.includes('refresh_token') || error.message?.includes('Refresh Token')) {
          localStorage.removeItem('supabase.auth.token')
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.user_metadata)
        loadSubscriptionStatus(session.user.id)
      } else {
        setUserProfile(null)
        setIsPremium(false)
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
    isPremium,
    signOut: () => supabase.auth.signOut(),
    refreshProfile: () => user && loadUserProfile(user.id),
    refreshPremium: () => user && loadSubscriptionStatus(user.id),
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
