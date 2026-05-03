const DISMISS_KEY = 'pwa-update-dismissed'

/**
 * Retourne true si l'utilisateur a déjà cliqué "Plus tard" pour cette mise à jour.
 * Le flag est effacé dès qu'un nouveau SW commence à s'installer (updatefound),
 * ce qui garantit que le popup réapparaîtra pour une vraie nouvelle version.
 */
export function isDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DISMISS_KEY) === '1'
}

/** Mémorise que l'utilisateur a cliqué "Plus tard". */
export function setDismissed(): void {
  localStorage.setItem(DISMISS_KEY, '1')
}

/** Efface le flag de dismiss (appelé quand un nouveau SW commence à s'installer). */
export function clearDismissed(): void {
  localStorage.removeItem(DISMISS_KEY)
}
