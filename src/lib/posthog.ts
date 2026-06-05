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

function hasPostHogKey(): boolean {
  return Boolean(POSTHOG_KEY)
}

export function initPostHog() {
  if (initialized || !hasPostHogKey()) {
    return
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    person_profiles: 'identified_only',
  })
  initialized = true
}

export function isPostHogEnabled(): boolean {
  return initialized && hasPostHogKey()
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
