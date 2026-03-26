import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { bindOneSignalUser, initOneSignal } from '../lib/onesignal'

export function OneSignalSubscriber() {
  const { user, loading } = useAuth()

  useEffect(() => {
    void initOneSignal().catch((err: unknown) => {
      console.error('OneSignal init', err)
    })
  }, [])

  useEffect(() => {
    if (loading) {
      return
    }
    void bindOneSignalUser(user?.id ?? null).catch((err: unknown) => {
      console.error('OneSignal user', err)
    })
  }, [user?.id, loading])

  return null
}
