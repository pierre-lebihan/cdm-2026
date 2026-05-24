import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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

export function useSaveProfile() {
  const { user, updateProfile } = useAuth()

  return useCallback(
    async (updates: Partial<Tables<'profiles'>>) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      updateProfile(data)
      return data
    },
    [user?.id, updateProfile],
  )
}

export function useUploadAvatar() {
  const { user } = useAuth()

  return useCallback(
    async (file: File) => {
      if (!user) throw new Error('Not authenticated')

      const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const path = `${user.id}/avatar-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      return data.publicUrl
    },
    [user?.id],
  )
}
