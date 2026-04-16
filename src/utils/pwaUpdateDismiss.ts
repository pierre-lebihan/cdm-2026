const PWA_UPDATE_TOAST_ID = 'pwa-update-available'

const DISMISS_KEY = 'pwa-update-dismissed-version'

function getCurrentSwVersion(): string | null {
  if (typeof navigator === 'undefined') return null
  // Use the SW script URL as a stable identifier for the pending SW
  return navigator.serviceWorker?.controller?.scriptURL ?? null
}

export function getPwaUpdateToastId(): string {
  return PWA_UPDATE_TOAST_ID
}

export function shouldSkipPwaUpdateToast(): boolean {
  if (typeof window === 'undefined') return false
  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (!dismissed) return false
  const current = getCurrentSwVersion()
  // If we can't identify the version, rely on the stored flag
  if (!current) return dismissed === '1'
  // Only skip if this exact SW version was already dismissed
  return dismissed === current
}

export function rememberPwaUpdateDismissed(): void {
  const current = getCurrentSwVersion()
  localStorage.setItem(DISMISS_KEY, current ?? '1')
}

export function clearPwaUpdateDismiss(): void {
  localStorage.removeItem(DISMISS_KEY)
}
