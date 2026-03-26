import OneSignal from 'react-onesignal'
import { initOneSignal } from './onesignal'

export type PushNotificationUiState =
  | 'loading'
  | 'no_sdk'
  | 'unsupported'
  | 'denied'
  | 'subscribed'
  | 'can_enable'
  | 'can_reenable'

export async function computePushUiState(): Promise<PushNotificationUiState> {
  if (!import.meta.env.VITE_ONESIGNAL_APP_ID) {
    return 'no_sdk'
  }
  await initOneSignal()
  if (!OneSignal.Notifications.isPushSupported()) {
    return 'unsupported'
  }
  const native = OneSignal.Notifications.permissionNative
  if (native === 'denied') {
    return 'denied'
  }
  const optedIn = OneSignal.User.PushSubscription.optedIn === true
  if (optedIn && native === 'granted') {
    return 'subscribed'
  }
  if (native === 'granted' && !optedIn) {
    return 'can_reenable'
  }
  return 'can_enable'
}

export async function promptPushNotifications(): Promise<void> {
  await initOneSignal()
  await OneSignal.Slidedown.promptPush()
}

export async function optInPushSubscription(): Promise<void> {
  await initOneSignal()
  await OneSignal.User.PushSubscription.optIn()
}

export async function optOutPushSubscription(): Promise<void> {
  await initOneSignal()
  await OneSignal.User.PushSubscription.optOut()
}
