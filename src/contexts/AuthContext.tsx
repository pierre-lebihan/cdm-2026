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

interface PasswordSetupResponse {
  status?: string
  error?: string
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  emailExists: (email: string) => Promise<boolean>
  createPasswordSetupAccount: (
    email: string,
    displayName: string,
  ) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const PRODUCTION_SITE_URL = 'https://makepronogreatagain.bzh/'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizeDisplayName(displayName: string): string {
  return displayName.trim()
}

function getUserDisplayName(user: User, fallback: string): string {
  return (
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    fallback
  )
}

function getRedirectUrl(path: string): string {
  const baseUrl = import.meta.env.DEV
    ? window.location.origin
    : PRODUCTION_SITE_URL

  return new URL(path, baseUrl).toString()
}

function getFriendlyPasswordSetupError(message: string): string {
  if (message === 'Email already exists') {
    return 'Un compte existe déjà pour cet email.'
  }

  if (message === 'Invalid email') {
    return 'Entre une adresse email valide.'
  }

  if (message === 'Invalid display name') {
    return 'Le nom doit contenir entre 2 et 20 caractères.'
  }

  return message
}

function getParsedFunctionErrorMessage(text: string): string | null {
  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      const error = parsed.error
      if (typeof error === 'string') {
        return getFriendlyPasswordSetupError(error)
      }
    }
  } catch {
    return text || null
  }

  return text || null
}

async function getFunctionErrorMessage(error: unknown): Promise<string> {
  if (!error || typeof error !== 'object') {
    return 'Impossible de préparer ce compte.'
  }

  if ('context' in error) {
    const context = error.context
    if (context && typeof context === 'object' && 'response' in context) {
      const response = context.response
      if (
        response &&
        typeof response === 'object' &&
        'text' in response &&
        typeof response.text === 'function'
      ) {
        try {
          const text = await response.text()
          const parsedMessage = getParsedFunctionErrorMessage(text)
          if (parsedMessage) {
            return parsedMessage
          }
        } catch {
          return 'Impossible de préparer ce compte.'
        }
      }
    }
  }

  if (error instanceof Error) {
    return getFriendlyPasswordSetupError(error.message)
  }

  return 'Impossible de préparer ce compte.'
}

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
        display_name: getUserDisplayName(user, user.email || ''),
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
      const displayName =
        data.display_name || getUserDisplayName(user, user.email || '')
      const avatarUrl = data.avatar_url || user.user_metadata?.avatar_url || null
      await supabase
        .from('profiles')
        .update({
          last_connection: new Date().toISOString(),
          nb_connections: (data.nb_connections || 0) + 1,
          avatar_url: avatarUrl,
          display_name: displayName,
        })
        .eq('id', user.id)
      setProfile({
        ...data,
        avatar_url: avatarUrl,
        display_name: displayName,
      })
    }
  }

  function updateProfile(updates: Partial<Profile>) {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null))
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl('/'),
      },
    })
  }

  async function emailExists(email: string) {
    const { data, error } = await supabase.rpc('auth_email_exists', {
      p_email: normalizeEmail(email),
    })

    if (error) throw error

    return data === true
  }

  async function createPasswordSetupAccount(
    email: string,
    displayName: string,
  ) {
    const { data, error } =
      await supabase.functions.invoke<PasswordSetupResponse>(
        'auth-password-setup',
        {
          body: {
            email: normalizeEmail(email),
            displayName: normalizeDisplayName(displayName),
          },
        },
      )

    if (error) {
      throw new Error(await getFunctionErrorMessage(error))
    }

    if (data?.status !== 'created') {
      throw new Error(
        data?.error
          ? getFriendlyPasswordSetupError(data.error)
          : 'Impossible de préparer ce compte.',
      )
    }
  }

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    })

    if (error) {
      throw new Error('Email ou mot de passe incorrect.')
    }
  }

  async function sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizeEmail(email),
      {
        redirectTo: getRedirectUrl('/auth/reset-password'),
      },
    )

    if (error) throw error
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })

    if (error) throw error
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
      emailExists,
      createPasswordSetupAccount,
      signInWithPassword,
      sendPasswordReset,
      updatePassword,
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
