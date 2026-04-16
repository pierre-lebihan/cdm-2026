const PWA_UPDATE_TOAST_ID = 'pwa-update-available'

const SESSION_DISMISS_KEY = 'pwa-update-dismissed-session'

export function getPwaUpdateToastId(): string {
  return PWA_UPDATE_TOAST_ID
}

export function shouldSkipPwaUpdateToast(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1'
}

export function rememberPwaUpdateDismissed(): void {
  sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
}

export function clearPwaUpdateDismiss(): void {
  sessionStorage.removeItem(SESSION_DISMISS_KEY)
}
