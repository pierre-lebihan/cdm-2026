import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePushNotifications } from '../hooks/usePushNotifications'
import {
  hasNotificationPromptBeenHandledThisSession,
  markNotificationPromptHandledThisSession,
  registerAuthenticatedPromptVisit,
  wasNotificationPromptDismissedRecently,
} from '../lib/promptCadence'
import type { PushNotificationUiState } from '../lib/pushNotificationState'
import InstallPrompt from './InstallPrompt'
import NotificationPrompt from './NotificationPrompt'

const MIN_AUTHENTICATED_PROMPT_VISITS = 2

interface PromptSlotParams {
  loading: boolean
  hasUser: boolean
  visitCount: number
  pushEnabled: boolean
  pushState: PushNotificationUiState
  notificationDismissed: boolean
  notificationHandledThisSession: boolean
}

function canShowAnyPrompt(params: PromptSlotParams): boolean {
  if (params.loading) {
    return false
  }

  if (!params.hasUser) {
    return false
  }

  return params.visitCount >= MIN_AUTHENTICATED_PROMPT_VISITS
}

function canShowNotificationPrompt(params: PromptSlotParams): boolean {
  if (!canShowAnyPrompt(params)) {
    return false
  }

  if (!params.pushEnabled) {
    return false
  }

  if (params.notificationDismissed) {
    return false
  }

  if (params.notificationHandledThisSession) {
    return false
  }

  return params.pushState === 'can_enable'
}

function canShowInstallPrompt(params: PromptSlotParams): boolean {
  if (!canShowAnyPrompt(params)) {
    return false
  }

  if (params.notificationHandledThisSession) {
    return false
  }

  if (canShowNotificationPrompt(params)) {
    return false
  }

  if (params.pushEnabled && params.pushState === 'loading') {
    return false
  }

  return true
}

export default function PromptCoordinator() {
  const { user, loading } = useAuth()
  const { state, enabled, refresh } = usePushNotifications()
  const [visitCount, setVisitCount] = useState(0)
  const [notificationDismissed, setNotificationDismissed] = useState(false)
  const [notificationHandledThisSession, setNotificationHandledThisSession] =
    useState(false)

  const userId = user?.id ?? null

  useEffect(() => {
    if (loading || !userId) {
      setVisitCount(0)
      setNotificationDismissed(false)
      setNotificationHandledThisSession(false)
      return
    }

    setVisitCount(registerAuthenticatedPromptVisit(userId))
    setNotificationDismissed(wasNotificationPromptDismissedRecently(userId))
    setNotificationHandledThisSession(
      hasNotificationPromptBeenHandledThisSession(userId),
    )
  }, [loading, userId])

  const params: PromptSlotParams = {
    loading,
    hasUser: Boolean(userId),
    visitCount,
    pushEnabled: enabled,
    pushState: state,
    notificationDismissed,
    notificationHandledThisSession,
  }

  const showNotificationPrompt = canShowNotificationPrompt(params)
  const showInstallPrompt = canShowInstallPrompt(params)

  const handleNotificationHandled = () => {
    if (!userId) {
      return
    }

    markNotificationPromptHandledThisSession(userId)
    setNotificationHandledThisSession(true)
    setNotificationDismissed(wasNotificationPromptDismissedRecently(userId))
  }

  return (
    <>
      {showNotificationPrompt && userId ? (
        <NotificationPrompt
          userId={userId}
          state={state}
          enabled={enabled}
          refresh={refresh}
          onHandled={handleNotificationHandled}
        />
      ) : null}
      <InstallPrompt enabled={showInstallPrompt} />
    </>
  )
}
