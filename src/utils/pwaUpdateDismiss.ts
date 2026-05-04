const DISMISS_KEY = 'pwa-update-dismissed'

export function isDismissed(buildId: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(DISMISS_KEY) === buildId
}

export function setDismissed(buildId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(DISMISS_KEY, buildId)
}
