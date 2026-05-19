import { RefreshCw } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { getLatestAppBuildId } from 'utils/appVersion'

const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000
const RELOAD_FALLBACK_DELAY = 1500

type AvailableBuildIdSetter = Dispatch<SetStateAction<string | null>>
type ReloadingSetter = Dispatch<SetStateAction<boolean>>
type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>

interface MandatoryUpdateOverlayProps {
  isReloading: boolean
  setReloading: ReloadingSetter
  updateServiceWorker: UpdateServiceWorker
}

let registeredServiceWorker: ServiceWorkerRegistration | null = null
let updatePollingId: number | null = null

function logRegisterError(error: unknown): void {
  console.error("Erreur d'enregistrement du Service Worker", error)
}

function logUpdateError(error: unknown): void {
  console.error('Erreur de vérification du Service Worker', error)
}

function reloadWindow(): void {
  window.location.reload()
}

function scheduleReloadFallback(): void {
  window.setTimeout(reloadWindow, RELOAD_FALLBACK_DELAY)
}

function handleMandatoryReloadError(error: unknown): void {
  console.error("Erreur d'activation de la mise à jour", error)
  reloadWindow()
}

function forceUpdateAndReload(
  updateServiceWorker: UpdateServiceWorker,
  setReloading: ReloadingSetter,
): void {
  setReloading(true)
  pollServiceWorkerUpdate()
  updateServiceWorker(true).catch(handleMandatoryReloadError)
  scheduleReloadFallback()
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
    return
  }
  if (latestBuildId === __APP_BUILD_ID__) {
    setAvailableBuildId(null)
    return
  }

  pollServiceWorkerUpdate()
  setAvailableBuildId(latestBuildId)
}

function lockPageScroll(): () => void {
  const initialOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  return () => {
    document.body.style.overflow = initialOverflow
  }
}

class AppVersionPoller {
  private pollingId: number | null = null
  private setAvailableBuildId: AvailableBuildIdSetter

  constructor(setAvailableBuildId: AvailableBuildIdSetter) {
    this.setAvailableBuildId = setAvailableBuildId
  }

  start = (): void => {
    this.checkVersion()
    if (this.pollingId !== null) {
      return
    }

    this.pollingId = window.setInterval(
      this.checkVersion,
      UPDATE_CHECK_INTERVAL,
    )
  }

  stop = (): void => {
    if (this.pollingId === null) {
      return
    }

    window.clearInterval(this.pollingId)
    this.pollingId = null
  }

  private checkVersion = (): void => {
    showUpdateIfAppVersionChanged(this.setAvailableBuildId).catch(
      logUpdateError,
    )
  }
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

function MandatoryUpdateOverlay({
  isReloading,
  setReloading,
  updateServiceWorker,
}: MandatoryUpdateOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-navy/75 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-update-title"
    >
      <div className="w-full max-w-sm rounded-lg border border-white/40 bg-cream p-6 text-center text-navy shadow-card">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-navy text-cream">
          <RefreshCw
            size={24}
            className={isReloading ? 'animate-spin' : undefined}
          />
        </div>
        <h2 id="pwa-update-title" className="text-xl font-extrabold">
          Mise à jour obligatoire
        </h2>
        <p className="mt-3 text-sm leading-6 text-navy-light">
          Une nouvelle version est disponible. Recharge l&apos;application pour
          continuer à pronostiquer.
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-lg bg-navy px-4 py-3 font-semibold text-cream shadow-card transition-colors hover:bg-navy/90 disabled:cursor-wait disabled:opacity-80"
          onClick={() => {
            forceUpdateAndReload(updateServiceWorker, setReloading)
          }}
          disabled={isReloading}
        >
          {isReloading ? 'Rechargement...' : 'Recharger maintenant'}
        </button>
      </div>
    </div>
  )
}

export const PwaUpdatePrompt = () => {
  const [availableBuildId, setAvailableBuildId] = useState<string | null>(null)
  const [isReloading, setReloading] = useState(false)

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
      return
    }

    return lockPageScroll()
  }, [availableBuildId])

  useEffect(() => {
    const poller = new AppVersionPoller(setAvailableBuildId)
    poller.start()

    return poller.stop
  }, [])

  if (!availableBuildId) {
    return null
  }

  return (
    <MandatoryUpdateOverlay
      isReloading={isReloading}
      setReloading={setReloading}
      updateServiceWorker={updateServiceWorker}
    />
  )
}

export default PwaUpdatePrompt
