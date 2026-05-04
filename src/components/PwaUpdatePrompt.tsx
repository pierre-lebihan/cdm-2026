import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'react-hot-toast'
import { getLatestAppBuildId } from 'utils/appVersion'
import { isDismissed, setDismissed } from 'utils/pwaUpdateDismiss'

const TOAST_ID = 'pwa-update-available'
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

type AvailableBuildIdSetter = Dispatch<SetStateAction<string | null>>

let registeredServiceWorker: ServiceWorkerRegistration | null = null
let updatePollingId: number | null = null

function logRegisterError(error: unknown): void {
  console.error("Erreur d'enregistrement du Service Worker", error)
}

function logUpdateError(error: unknown): void {
  console.error('Erreur de vérification du Service Worker', error)
}

function pollServiceWorkerUpdate(): void {
  if (!registeredServiceWorker) {
    return
  }

  registeredServiceWorker.update().catch(logUpdateError)
}

function startUpdatePolling(registration?: ServiceWorkerRegistration): void {
  if (!registration) {
    return
  }

  registeredServiceWorker = registration
  if (updatePollingId !== null) {
    return
  }

  updatePollingId = window.setInterval(
    pollServiceWorkerUpdate,
    UPDATE_CHECK_INTERVAL,
  )
}

function getServiceWorkerFromEvent(event: Event): ServiceWorker | null {
  if (!(event.target instanceof ServiceWorker)) {
    return null
  }

  return event.target
}

async function showUpdateIfAppVersionChanged(
  setAvailableBuildId: AvailableBuildIdSetter,
): Promise<void> {
  const latestBuildId = await getLatestAppBuildId()
  if (!latestBuildId) {
    setAvailableBuildId(null)
    return
  }
  if (latestBuildId === __APP_BUILD_ID__) {
    setAvailableBuildId(null)
    return
  }
  if (isDismissed(latestBuildId)) {
    setAvailableBuildId(null)
    return
  }

  setAvailableBuildId(latestBuildId)
}

class NativeUpdateListener {
  private registration: ServiceWorkerRegistration | null = null
  private running = true
  private setAvailableBuildId: AvailableBuildIdSetter

  constructor(setAvailableBuildId: AvailableBuildIdSetter) {
    this.setAvailableBuildId = setAvailableBuildId
  }

  start = (): void => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    navigator.serviceWorker.ready.then(this.attach).catch(logRegisterError)
  }

  stop = (): void => {
    this.running = false
    if (!this.registration) {
      return
    }

    this.registration.removeEventListener('updatefound', this.handleUpdateFound)
  }

  private attach = (registration: ServiceWorkerRegistration): void => {
    if (!this.running) {
      return
    }

    this.registration = registration
    registration.addEventListener('updatefound', this.handleUpdateFound)
  }

  private handleUpdateFound = (): void => {
    const worker = this.registration?.installing
    if (!worker) {
      return
    }

    worker.addEventListener('statechange', this.handleStateChange)
  }

  private handleStateChange = (event: Event): void => {
    if (!this.running) {
      return
    }

    const worker = getServiceWorkerFromEvent(event)
    if (!worker) {
      return
    }
    if (worker.state !== 'installed') {
      return
    }
    if (navigator.serviceWorker.controller === null) {
      return
    }

    showUpdateIfAppVersionChanged(this.setAvailableBuildId).catch(
      logUpdateError,
    )
  }
}

export const PwaUpdatePrompt = () => {
  const [availableBuildId, setAvailableBuildId] = useState<string | null>(null)

  const { updateServiceWorker } = useRegisterSW({
    onRegistered: startUpdatePolling,
    onRegisterError: logRegisterError,
  })

  useEffect(() => {
    const listener = new NativeUpdateListener(setAvailableBuildId)
    listener.start()

    return listener.stop
  }, [])

  useEffect(() => {
    if (!availableBuildId) {
      toast.dismiss(TOAST_ID)
      return
    }

    if (isDismissed(availableBuildId)) {
      toast.dismiss(TOAST_ID)
      return
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-navy">
            Une nouvelle version de l'application est disponible !
          </span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-white bg-navy rounded-md hover:bg-navy/90 transition-colors"
              onClick={() => {
                toast.dismiss(t.id)
                updateServiceWorker(true)
              }}
            >
              Mettre à jour
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-navy bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => {
                setDismissed(availableBuildId)
                setAvailableBuildId(null)
                toast.dismiss(t.id)
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      ),
      {
        id: TOAST_ID,
        duration: Infinity,
        position: 'bottom-center',
      },
    )

    return () => {
      toast.dismiss(TOAST_ID)
    }
  }, [availableBuildId, updateServiceWorker])

  return null
}

export default PwaUpdatePrompt
