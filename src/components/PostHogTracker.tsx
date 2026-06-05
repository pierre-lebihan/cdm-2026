import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { capturePageView, initPostHog } from '../lib/posthog'

function getCurrentUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.href
}

function getCurrentPath(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function getReferrer(): string {
  if (typeof document === 'undefined') {
    return ''
  }

  return document.referrer
}

const PostHogTracker = () => {
  const location = useLocation()
  const routeKey = useMemo(() => {
    return `${location.pathname}${location.search}${location.hash}`
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    capturePageView({
      path: getCurrentPath(),
      url: getCurrentUrl(),
      referrer: getReferrer(),
    })
  }, [routeKey])

  return null
}

export default PostHogTracker
