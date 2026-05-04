const APP_VERSION_FILENAME = 'app-version.json'

function getVersionUrl(): string {
  const base = import.meta.env.BASE_URL
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const cacheBuster = Date.now()

  return `${normalizedBase}${APP_VERSION_FILENAME}?t=${cacheBuster}`
}

function getBuildIdFromPayload(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) {
    return null
  }
  if (!('buildId' in payload)) {
    return null
  }
  if (typeof payload.buildId !== 'string') {
    return null
  }
  if (payload.buildId.length === 0) {
    return null
  }

  return payload.buildId
}

export async function getLatestAppBuildId(): Promise<string | null> {
  try {
    const response = await fetch(getVersionUrl(), { cache: 'no-store' })
    if (!response.ok) {
      return null
    }
    const payload: unknown = await response.json()

    return getBuildIdFromPayload(payload)
  } catch {
    return null
  }
}
