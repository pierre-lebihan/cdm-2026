import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Tables } from '../lib/database.types'

export function useGoogleLogin(): () => Promise<void> {
  const { signInWithGoogle } = useAuth()
  return signInWithGoogle
}

export function useEmailExists(): (email: string) => Promise<boolean> {
  const { emailExists } = useAuth()
  return emailExists
}

export function useCreatePasswordSetupAccount(): (
  email: string,
  displayName: string,
) => Promise<void> {
  const { createPasswordSetupAccount } = useAuth()
  return createPasswordSetupAccount
}

export function usePasswordLogin(): (
  email: string,
  password: string,
) => Promise<void> {
  const { signInWithPassword } = useAuth()
  return signInWithPassword
}

export function usePasswordReset(): (email: string) => Promise<void> {
  const { sendPasswordReset } = useAuth()
  return sendPasswordReset
}

export function useLogout(): () => Promise<void> {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return async () => {
    await signOut()
    navigate('/')
  }
}

export function useUserProfile(): Tables<'profiles'> | null {
  const { profile } = useAuth()
  return profile
}

export function useIsUserConnected(): boolean {
  const { user, loading } = useAuth()
  return !loading && !!user
}

export function useIsUserAdmin(): boolean {
  const { profile } = useAuth()
  return profile?.role === 'admin'
}

export function useUpdateProfile(): (
  updates: Partial<Tables<'profiles'>>,
) => void {
  const { updateProfile } = useAuth()
  return updateProfile
}
