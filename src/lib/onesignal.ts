import OneSignal from 'react-onesignal'
import { PWA_SERVICE_WORKER_FILENAME } from '../serviceWorkerName'

let initPromise: Promise<void> | null = null

function getCurrentOrigin(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.location.origin
}

function getWebsiteOrigin(): string {
  const websiteUrl = import.meta.env.VITE_WEBSITE_URL
  if (!websiteUrl) {
    return ''
  }
  try {
    return new URL(websiteUrl).origin
  } catch {
    return ''
  }
}

export function isLocalhostOrigin(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
}

export function isOneSignalEnabled(): boolean {
  if (!import.meta.env.VITE_ONESIGNAL_APP_ID) {
    return false
  }
  return getCurrentOrigin() === getWebsiteOrigin()
}

function oneSignalServiceWorkerPath(): string {
  const base = import.meta.env.BASE_URL
  if (base === '/' || base === '') {
    return PWA_SERVICE_WORKER_FILENAME
  }
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base
  const withoutLeadingSlash = trimmed.replace(/^\//, '')
  return `${withoutLeadingSlash}/${PWA_SERVICE_WORKER_FILENAME}`
}

function oneSignalServiceWorkerScope(): string {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') {
    return '/'
  }
  return base.endsWith('/') ? base : `${base}/`
}

function hasValidPushToken(): boolean {
  const token = OneSignal.User.PushSubscription.token
  if (typeof token !== 'string') {
    return false
  }
  return token.length > 0
}

export function initOneSignal(): Promise<void> {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
  if (!appId || !isOneSignalEnabled()) {
    return Promise.resolve()
  }
  if (initPromise) {
    return initPromise
  }
  initPromise = OneSignal.init({
    appId,
    allowLocalhostAsSecureOrigin: false,
    serviceWorkerPath: oneSignalServiceWorkerPath(),
    serviceWorkerParam: { scope: oneSignalServiceWorkerScope() },
    promptOptions: {
      slidedown: {
        prompts: [
          {
            type: 'push',
            autoPrompt: false,
            delay: {},
            text: {
              actionMessage:
                'Rappels avant les matchs quand ton prono manque — rien de spam.',
              acceptButton: 'Autoriser',
              cancelButton: 'Plus tard',
            },
          },
        ],
      },
    },
  })
    .then(() => undefined)
    .catch((err: unknown) => {
      initPromise = null
      throw err
    })
  return initPromise
}

export async function ensurePushSubscriptionReady(): Promise<void> {
  if (!isOneSignalEnabled()) {
    return
  }
  await initOneSignal()
  if (!OneSignal.Notifications.isPushSupported()) {
    return
  }
  if (OneSignal.Notifications.permissionNative !== 'granted') {
    return
  }
  if (hasValidPushToken() && OneSignal.User.PushSubscription.optedIn === true) {
    return
  }
  await OneSignal.User.PushSubscription.optIn()
}

export async function bindOneSignalUser(userId: string | null): Promise<void> {
  if (!isOneSignalEnabled()) {
    return
  }
  await initOneSignal()
  if (userId) {
    await OneSignal.login(userId)
    await ensurePushSubscriptionReady()
    return
  }
  await OneSignal.logout()
}
