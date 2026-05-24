import { RefreshCw } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import {
  type RegisterSWOptions,
  useRegisterSW,
} from 'virtual:pwa-register/react'
import { getLatestAppBuildId } from 'utils/appVersion'

const UPDATE_CHECK_INTERVAL = 30 * 1000
const RELOAD_FALLBACK_DELAY = 1500
const SERVICE_WORKER_READY_TIMEOUT = 8000
const AUTO_RELOAD_SESSION_KEY = 'mpga-pwa-auto-reload'

type AvailableBuildIdSetter = Dispatch<SetStateAction<string | null>>
type ReloadingSetter = Dispatch<SetStateAction<boolean>>
type WorkerResolver = (worker: ServiceWorker | null) => void

interface MandatoryUpdateOverlayProps {
  isReloading: boolean
  onReloadClick: () => void
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

function getAutoReloadKey(buildId: string): string {
  const key = `${AUTO_RELOAD_SESSION_KEY}:${buildId}`

  return key
}

function hasAutoReloadAlreadyRun(buildId: string): boolean {
  const key = getAutoReloadKey(buildId)
  const storedValue = window.sessionStorage.getItem(key)

  return storedValue === '1'
}

function markAutoReloadRun(buildId: string): void {
  const key = getAutoReloadKey(buildId)

  window.sessionStorage.setItem(key, '1')
}

function clearAutoReloadRun(buildId: string): void {
  const key = getAutoReloadKey(buildId)

  window.sessionStorage.removeItem(key)
}

function isReloadNavigation(): boolean {
  if (typeof PerformanceNavigationTiming === 'undefined') {
    return false
  }

  const entries = window.performance.getEntriesByType('navigation')
  const navigationEntry = entries[0]
  if (!(navigationEntry instanceof PerformanceNavigationTiming)) {
    return false
  }

  return navigationEntry.type === 'reload'
}

function handleMandatoryReloadError(error: unknown): void {
  console.error("Erreur d'activation de la mise à jour", error)
  reloadWindow()
}

async function forceUpdateAndReload(
  setReloading: ReloadingSetter,
): Promise<void> {
  setReloading(true)
  const worker = await findServiceWorkerReadyForActivation()
  if (!worker) {
    reloadWindow()
    return
  }

  const activator = new ServiceWorkerActivator(worker)
  activator.activate()
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
    clearAutoReloadRun(latestBuildId)
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

    window.addEventListener('focus', this.checkVersion)
    document.addEventListener('visibilitychange', this.checkVisibleVersion)
    this.pollingId = window.setInterval(
      this.checkVersion,
      UPDATE_CHECK_INTERVAL,
    )
  }

  stop = (): void => {
    window.removeEventListener('focus', this.checkVersion)
    document.removeEventListener('visibilitychange', this.checkVisibleVersion)
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

  private checkVisibleVersion = (): void => {
    if (document.visibilityState !== 'visible') {
      return
    }

    this.checkVersion()
  }
}

class ServiceWorkerActivator {
  private reloaded = false
  private timeoutId: number | null = null
  private worker: ServiceWorker

  constructor(worker: ServiceWorker) {
    this.worker = worker
  }

  activate = (): void => {
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      this.handleControllerChange,
    )
    this.timeoutId = window.setTimeout(
      this.reloadWithoutControllerChange,
      RELOAD_FALLBACK_DELAY,
    )
    this.worker.postMessage({ type: 'SKIP_WAITING' })
  }

  private handleControllerChange = (): void => {
    this.reloadOnce()
  }

  private reloadWithoutControllerChange = (): void => {
    this.reloadOnce()
  }

  private reloadOnce(): void {
    if (this.reloaded) {
      return
    }

    this.reloaded = true
    navigator.serviceWorker.removeEventListener(
      'controllerchange',
      this.handleControllerChange,
    )
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
    }

    reloadWindow()
  }
}

class InstalledWorkerWaiter {
  private resolve: WorkerResolver | null = null
  private timeoutId: number | null = null
  private worker: ServiceWorker

  constructor(worker: ServiceWorker) {
    this.worker = worker
  }

  wait = (): Promise<ServiceWorker | null> => {
    if (this.worker.state === 'installed') {
      return Promise.resolve(this.worker)
    }

    if (this.worker.state === 'redundant') {
      return Promise.resolve(null)
    }

    return new Promise(this.start)
  }

  private start = (resolve: WorkerResolver): void => {
    this.resolve = resolve
    this.worker.addEventListener('statechange', this.handleStateChange)
    this.timeoutId = window.setTimeout(
      this.finishWithoutWorker,
      SERVICE_WORKER_READY_TIMEOUT,
    )
  }

  private handleStateChange = (): void => {
    if (this.worker.state === 'installed') {
      this.finishWithWorker()
      return
    }

    if (this.worker.state === 'redundant') {
      this.finishWithoutWorker()
    }
  }

  private finishWithWorker = (): void => {
    this.finish(this.worker)
  }

  private finishWithoutWorker = (): void => {
    this.finish(null)
  }

  private finish(worker: ServiceWorker | null): void {
    if (!this.resolve) {
      return
    }

    const resolve = this.resolve
    this.resolve = null
    this.worker.removeEventListener('statechange', this.handleStateChange)
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
    }

    resolve(worker)
  }
}

class WaitingServiceWorkerFinder {
  private registration: ServiceWorkerRegistration
  private resolve: WorkerResolver | null = null
  private timeoutId: number | null = null

  constructor(registration: ServiceWorkerRegistration) {
    this.registration = registration
  }

  wait = (): Promise<ServiceWorker | null> => {
    const worker = findCurrentWorkerCandidate(this.registration)
    if (worker) {
      return waitForInstalledWorker(worker)
    }

    return new Promise(this.start)
  }

  private start = (resolve: WorkerResolver): void => {
    this.resolve = resolve
    this.registration.addEventListener('updatefound', this.handleUpdateFound)
    this.timeoutId = window.setTimeout(
      this.finishWithoutWorker,
      SERVICE_WORKER_READY_TIMEOUT,
    )
  }

  private handleUpdateFound = (): void => {
    const worker = this.registration.installing
    if (!worker) {
      return
    }

    waitForInstalledWorker(worker).then(this.finish)
  }

  private finishWithoutWorker = (): void => {
    this.finish(null)
  }

  private finish = (worker: ServiceWorker | null): void => {
    if (!this.resolve) {
      return
    }

    const resolve = this.resolve
    this.resolve = null
    this.registration.removeEventListener('updatefound', this.handleUpdateFound)
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
    }

    resolve(worker)
  }
}

class PwaRegisterCallbacks implements RegisterSWOptions {
  private setAvailableBuildId: AvailableBuildIdSetter

  constructor(setAvailableBuildId: AvailableBuildIdSetter) {
    this.setAvailableBuildId = setAvailableBuildId
  }

  onNeedRefresh = (): void => {
    showUpdateIfAppVersionChanged(this.setAvailableBuildId).catch(
      logUpdateError,
    )
  }

  onRegistered = (registration?: ServiceWorkerRegistration): void => {
    startUpdatePolling(registration)
  }

  onRegisterError = (error: unknown): void => {
    logRegisterError(error)
  }
}

class ReloadClickHandler {
  private setReloading: ReloadingSetter

  constructor(setReloading: ReloadingSetter) {
    this.setReloading = setReloading
  }

  handleClick = (): void => {
    forceUpdateAndReload(this.setReloading).catch(handleMandatoryReloadError)
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

function findCurrentWorkerCandidate(
  registration: ServiceWorkerRegistration,
): ServiceWorker | null {
  if (registration.waiting) {
    return registration.waiting
  }

  if (registration.installing) {
    return registration.installing
  }

  return null
}

function waitForInstalledWorker(
  worker: ServiceWorker,
): Promise<ServiceWorker | null> {
  const waiter = new InstalledWorkerWaiter(worker)

  return waiter.wait()
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (registeredServiceWorker) {
    return registeredServiceWorker
  }

  if (!('serviceWorker' in navigator)) {
    return null
  }

  const registration = await navigator.serviceWorker.ready
  registeredServiceWorker = registration

  return registration
}

async function updateRegistration(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  try {
    await registration.update()
  } catch (error) {
    logUpdateError(error)
  }
}

async function findServiceWorkerReadyForActivation(): Promise<ServiceWorker | null> {
  const registration = await getServiceWorkerRegistration()
  if (!registration) {
    return null
  }

  await updateRegistration(registration)

  const worker = findCurrentWorkerCandidate(registration)
  if (worker) {
    return waitForInstalledWorker(worker)
  }

  const finder = new WaitingServiceWorkerFinder(registration)

  return finder.wait()
}

function MandatoryUpdateOverlay({
  isReloading,
  onReloadClick,
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
          onClick={onReloadClick}
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
  const [autoReloadBuildId, setAutoReloadBuildId] = useState<string | null>(
    null,
  )
  const reloadClickHandler = new ReloadClickHandler(setReloading)

  useRegisterSW(new PwaRegisterCallbacks(setAvailableBuildId))

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

  useEffect(() => {
    if (!availableBuildId) {
      return
    }

    if (!isReloadNavigation()) {
      return
    }

    if (hasAutoReloadAlreadyRun(availableBuildId)) {
      return
    }

    markAutoReloadRun(availableBuildId)
    setAutoReloadBuildId(availableBuildId)
    forceUpdateAndReload(setReloading).catch(handleMandatoryReloadError)
  }, [availableBuildId])

  if (!availableBuildId) {
    return null
  }

  if (autoReloadBuildId === availableBuildId) {
    return null
  }

  return (
    <MandatoryUpdateOverlay
      isReloading={isReloading}
      onReloadClick={reloadClickHandler.handleClick}
    />
  )
}

export default PwaUpdatePrompt
