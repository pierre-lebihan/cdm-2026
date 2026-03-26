import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { syncCrispUser } from '../lib/crisp'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { Tables } from '../lib/database.types'

type Profile = Tables<'profiles'>

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        fetchOrCreateProfile(s.user)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        fetchOrCreateProfile(s.user)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      syncCrispUser({ email: null, nickname: null })
      return
    }
    const email = session.user.email ?? profile?.email ?? null
    const nickname = profile?.display_name ?? null
    syncCrispUser({ email, nickname })
  }, [session, profile])

  async function fetchOrCreateProfile(user: User) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      const newProfile = {
        id: user.id,
        display_name: user.user_metadata?.full_name || user.email || '',
        avatar_url: user.user_metadata?.avatar_url || null,
        email: user.email || null,
        nb_connections: 1,
        last_connection: new Date().toISOString(),
      }
      const { data: created } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()
      setProfile(created)
      return
    }

    if (data) {
      await supabase
        .from('profiles')
        .update({
          last_connection: new Date().toISOString(),
          nb_connections: (data.nb_connections || 0) + 1,
          avatar_url: user.user_metadata?.avatar_url || data.avatar_url,
          display_name: user.user_metadata?.full_name || data.display_name,
        })
        .eq('id', user.id)
      setProfile({
        ...data,
        avatar_url: user.user_metadata?.avatar_url || data.avatar_url,
        display_name: user.user_metadata?.full_name || data.display_name,
      })
    }
  }

  function updateProfile(updates: Partial<Profile>) {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null))
  }

  async function signInWithGoogle() {
    const redirectUrl = import.meta.env.DEV
      ? window.location.origin
      : 'https://makepronogreatagain.bzh/'

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signInWithGoogle,
      signOut,
      updateProfile,
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
