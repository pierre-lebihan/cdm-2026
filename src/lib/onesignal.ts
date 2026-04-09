import OneSignal from 'react-onesignal'

let initPromise: Promise<void> | null = null

function shouldInitOneSignal(): boolean {
  return Boolean(import.meta.env.VITE_ONESIGNAL_APP_ID) && import.meta.env.PROD
}

function serviceWorkerUrl(): string {
  const base = import.meta.env.BASE_URL
  if (base.endsWith('/')) {
    return `${base}sw.js`
  }
  return `${base}/sw.js`
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
  if (!appId || !shouldInitOneSignal()) {
    return Promise.resolve()
  }
  if (initPromise) {
    return initPromise
  }
  initPromise = OneSignal.init({
    appId,
    allowLocalhostAsSecureOrigin: false,
    serviceWorkerPath: serviceWorkerUrl(),
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
  if (!shouldInitOneSignal()) {
    return
  }
  await initOneSignal()
  if (!OneSignal.Notifications.isPushSupported()) {
    return
  }
  if (OneSignal.Notifications.permissionNative !== 'granted') {
    return
  }
  if (
    hasValidPushToken() &&
    OneSignal.User.PushSubscription.optedIn === true
  ) {
    return
  }
  await OneSignal.User.PushSubscription.optIn()
}

export async function bindOneSignalUser(userId: string | null): Promise<void> {
  if (!shouldInitOneSignal()) {
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
