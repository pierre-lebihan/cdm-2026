import posthog from 'posthog-js'
import type { Properties } from 'posthog-js'

type PostHogUserProfile = {
  email: string | null
  displayName: string | null
  role: string | null
}

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST

let initialized = false
let identifiedUserId: string | null = null

function getPostHogKey(): string | null {
  if (!POSTHOG_KEY || POSTHOG_KEY.startsWith('phx_')) {
    return null
  }

  return POSTHOG_KEY
}

export function initPostHog() {
  const postHogKey = getPostHogKey()

  if (initialized || !postHogKey) {
    return
  }

  posthog.init(postHogKey, {
    api_host: POSTHOG_HOST || 'https://t.makepronogreatagain.bzh',
    capture_pageview: false,
    person_profiles: 'identified_only',
  })
  initialized = true
}

export function isPostHogEnabled(): boolean {
  return initialized && Boolean(getPostHogKey())
}

export function captureEvent(eventName: string, properties?: Properties) {
  initPostHog()

  if (!isPostHogEnabled()) {
    return
  }

  posthog.capture(eventName, properties)
}

export function capturePageView(properties: Properties) {
  captureEvent('$pageview', properties)
}

export function identifyPostHogUser(
  userId: string,
  profile: PostHogUserProfile,
) {
  initPostHog()

  if (!isPostHogEnabled()) {
    return
  }

  if (identifiedUserId === userId) {
    posthog.setPersonProperties({
      email: profile.email,
      name: profile.displayName,
      role: profile.role,
    })
    return
  }

  posthog.identify(userId, {
    email: profile.email,
    name: profile.displayName,
    role: profile.role,
  })
  identifiedUserId = userId
}

export function resetPostHogUser() {
  if (!isPostHogEnabled()) {
    identifiedUserId = null
    return
  }

  posthog.reset()
  identifiedUserId = null
}
