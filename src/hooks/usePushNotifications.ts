import { useCallback, useEffect, useState } from 'react'
import OneSignal from 'react-onesignal'
import {
  computePushUiState,
  type PushNotificationUiState,
} from '../lib/pushNotificationState'
import { initOneSignal } from '../lib/onesignal'

function usePushNotificationsEnabled(): boolean {
  return (
    Boolean(import.meta.env.VITE_ONESIGNAL_APP_ID) && import.meta.env.PROD
  )
}

export function usePushNotifications() {
  const enabled = usePushNotificationsEnabled()
  const [state, setState] = useState<PushNotificationUiState>(
    enabled ? 'loading' : 'no_sdk',
  )

  const refresh = useCallback(
    async (opts?: { showLoading?: boolean }) => {
      if (!enabled) {
        setState('no_sdk')
        return
      }
      if (opts?.showLoading === true) {
        setState('loading')
      }
      try {
        const next = await computePushUiState()
        setState(next)
      } catch (err: unknown) {
        console.error(err)
        setState('error')
      }
    },
    [enabled],
  )

  useEffect(() => {
    if (!enabled) {
      return
    }
    void refresh()
  }, [enabled, refresh])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cleaned = false
    let removeSub: (() => void) | undefined
    let removePerm: (() => void) | undefined

    void initOneSignal()
      .then(() => {
        if (cleaned) {
          return
        }
        const onSubChange = () => {
          void refresh()
        }
        const onPermChange = () => {
          void refresh()
        }
        OneSignal.User.PushSubscription.addEventListener('change', onSubChange)
        OneSignal.Notifications.addEventListener(
          'permissionChange',
          onPermChange,
        )
        removeSub = () => {
          OneSignal.User.PushSubscription.removeEventListener(
            'change',
            onSubChange,
          )
        }
        removePerm = () => {
          OneSignal.Notifications.removeEventListener(
            'permissionChange',
            onPermChange,
          )
        }
      })
      .catch(() => undefined)

    return () => {
      cleaned = true
      removeSub?.()
      removePerm?.()
    }
  }, [enabled, refresh])

  return { state, refresh, enabled }
}
