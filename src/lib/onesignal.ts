import OneSignal from 'react-onesignal'

let initPromise: Promise<void> | null = null

function serviceWorkerUrl(): string {
  const base = import.meta.env.BASE_URL
  if (base.endsWith('/')) {
    return `${base}sw.js`
  }
  return `${base}/sw.js`
}

export function initOneSignal(): Promise<void> {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
  if (!appId) {
    return Promise.resolve()
  }
  if (initPromise) {
    return initPromise
  }
  initPromise = OneSignal.init({
    appId,
    allowLocalhostAsSecureOrigin: import.meta.env.DEV,
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

export async function bindOneSignalUser(userId: string | null): Promise<void> {
  if (!import.meta.env.VITE_ONESIGNAL_APP_ID) {
    return
  }
  await initOneSignal()
  if (userId) {
    await OneSignal.login(userId)
    return
  }
  await OneSignal.logout()
}
