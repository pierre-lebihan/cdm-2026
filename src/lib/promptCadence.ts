const AUTH_VISIT_COUNT_KEY_PREFIX = 'mpgaPromptAuthenticatedVisits'
const AUTH_VISIT_SESSION_KEY_PREFIX = 'mpgaPromptVisitRecorded'
const NOTIFICATION_HANDLED_SESSION_KEY_PREFIX =
  'mpgaNotificationPromptHandledSession'
const NOTIFICATION_DISMISS_KEY_PREFIX = 'mpgaNotificationPromptDismissed'
const LEGACY_NOTIFICATION_DISMISS_KEY = 'mpgaNotificationPromptDismissed'

const NOTIFICATION_DISMISS_MS = 7 * 24 * 60 * 60 * 1000

function getUserStorageKey(prefix: string, userId: string): string {
  return `${prefix}:${userId}`
}

function getStorageItem(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function setStorageItem(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    return
  }
}

function getStoredNumber(key: string): number {
  const raw = getStorageItem(localStorage, key)
  if (!raw) {
    return 0
  }

  const value = parseInt(raw, 10)
  if (Number.isNaN(value)) {
    return 0
  }

  return value
}

function isRecentTimestamp(raw: string | null, durationMs: number): boolean {
  if (!raw) {
    return false
  }

  const timestamp = parseInt(raw, 10)
  if (Number.isNaN(timestamp)) {
    return false
  }

  return Date.now() - timestamp < durationMs
}

export function registerAuthenticatedPromptVisit(userId: string): number {
  const countKey = getUserStorageKey(AUTH_VISIT_COUNT_KEY_PREFIX, userId)
  const sessionKey = getUserStorageKey(AUTH_VISIT_SESSION_KEY_PREFIX, userId)
  const currentCount = getStoredNumber(countKey)

  if (getStorageItem(sessionStorage, sessionKey) === '1') {
    return currentCount
  }

  const nextCount = currentCount + 1
  setStorageItem(localStorage, countKey, nextCount.toString())
  setStorageItem(sessionStorage, sessionKey, '1')

  return nextCount
}

export function wasNotificationPromptDismissedRecently(
  userId: string,
): boolean {
  const userKey = getUserStorageKey(NOTIFICATION_DISMISS_KEY_PREFIX, userId)
  const userValue = getStorageItem(localStorage, userKey)

  if (isRecentTimestamp(userValue, NOTIFICATION_DISMISS_MS)) {
    return true
  }

  const legacyValue = getStorageItem(
    localStorage,
    LEGACY_NOTIFICATION_DISMISS_KEY,
  )

  return isRecentTimestamp(legacyValue, NOTIFICATION_DISMISS_MS)
}

export function dismissNotificationPrompt(userId: string): void {
  const userKey = getUserStorageKey(NOTIFICATION_DISMISS_KEY_PREFIX, userId)
  setStorageItem(localStorage, userKey, Date.now().toString())
}

export function hasNotificationPromptBeenHandledThisSession(
  userId: string,
): boolean {
  const sessionKey = getUserStorageKey(
    NOTIFICATION_HANDLED_SESSION_KEY_PREFIX,
    userId,
  )

  return getStorageItem(sessionStorage, sessionKey) === '1'
}

export function markNotificationPromptHandledThisSession(userId: string): void {
  const sessionKey = getUserStorageKey(
    NOTIFICATION_HANDLED_SESSION_KEY_PREFIX,
    userId,
  )
  setStorageItem(sessionStorage, sessionKey, '1')
}
