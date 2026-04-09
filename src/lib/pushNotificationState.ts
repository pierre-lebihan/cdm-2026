import OneSignal from 'react-onesignal'
import { initOneSignal, isOneSignalEnabled } from './onesignal'

export type PushNotificationUiState =
  | 'loading'
  | 'no_sdk'
  | 'unsupported'
  | 'denied'
  | 'subscribed'
  | 'can_enable'
  | 'can_reenable'
  | 'error'

const PUSH_STATE_INIT_TIMEOUT_MS = 15000

function hasValidPushToken(): boolean {
  const token = OneSignal.User.PushSubscription.token
  if (typeof token !== 'string') {
    return false
  }
  return token.length > 0
}

function promiseWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('push_state_timeout'))
    }, ms)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
  })
}

export async function computePushUiState(): Promise<PushNotificationUiState> {
  if (!isOneSignalEnabled()) {
    return 'no_sdk'
  }
  try {
    await promiseWithTimeout(
      initOneSignal(),
      PUSH_STATE_INIT_TIMEOUT_MS,
    )
  } catch {
    return 'error'
  }
  try {
    if (!OneSignal.Notifications.isPushSupported()) {
      return 'unsupported'
    }
    const native = OneSignal.Notifications.permissionNative
    if (native === 'denied') {
      return 'denied'
    }
    const optedIn = OneSignal.User.PushSubscription.optedIn === true
    if (optedIn && native === 'granted' && hasValidPushToken()) {
      return 'subscribed'
    }
    if (native === 'granted') {
      return 'can_reenable'
    }
    return 'can_enable'
  } catch {
    return 'error'
  }
}

export async function optInPushSubscription(): Promise<void> {
  if (!isOneSignalEnabled()) {
    return
  }
  await initOneSignal()
  await OneSignal.User.PushSubscription.optIn()
}

export async function optOutPushSubscription(): Promise<void> {
  if (!isOneSignalEnabled()) {
    return
  }
  await initOneSignal()
  await OneSignal.User.PushSubscription.optOut()
}
