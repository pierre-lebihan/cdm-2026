import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useHideCrisp } from '../hooks/useHideCrisp'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { optInPushSubscription } from '../lib/pushNotificationState'

const DISMISS_KEY = 'mpgaNotificationPromptDismissed'
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000

function wasDismissedRecently(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) {
    return false
  }
  const t = parseInt(raw, 10)
  if (Number.isNaN(t)) {
    return false
  }
  return Date.now() - t < DISMISS_MS
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

function isStandalonePwa(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

export default function NotificationPrompt() {
  const { user, loading } = useAuth()
  const { state, enabled, refresh } = usePushNotifications()
  const [dismissed, setDismissed] = useState(() => wasDismissedRecently())

  const show =
    !loading &&
    user &&
    enabled &&
    !dismissed &&
    state === 'can_enable'

  useHideCrisp(!!show)

  if (!show) {
    return null
  }

  const iosNeedsInstall = isIos() && !isStandalonePwa()

  const handleEnable = async () => {
    try {
      await optInPushSubscription()
      await refresh()
    } catch (err: unknown) {
      console.error('Notification prompt', err)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  return (
    <div className="fixed bottom-28 left-4 right-4 md:bottom-4 md:left-4 md:right-auto md:w-96 z-[9998] p-4 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col gap-3 animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 bg-navy/10 p-2 rounded-lg text-navy">
            <Bell size={22} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-navy leading-tight">
              Ne rate pas les matchs
            </h3>
            <p className="text-sm text-gray-500 leading-snug mt-1 m-0">
              Un rappel ~5 min avant le coup d&apos;envoi si tu n&apos;as pas
              encore mis ton prono.
            </p>
            {iosNeedsInstall ? (
              <p className="text-xs text-navy/80 mt-2 m-0 leading-snug">
                Sur iPhone : ajoute d&apos;abord l&apos;app à l&apos;écran
                d&apos;accueil (Partager → sur l&apos;écran d&apos;accueil),
                puis active les alertes depuis le profil.
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 text-gray-400 hover:bg-gray-100 rounded-lg p-1 transition-colors -mt-1 -mr-1"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>
      {!iosNeedsInstall ? (
        <button
          type="button"
          onClick={handleEnable}
          className="w-full py-2.5 bg-navy hover:bg-navy/90 text-cream font-medium rounded-lg transition-colors shadow-sm"
        >
          Activer les notifications
        </button>
      ) : (
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-2.5 text-navy font-medium rounded-lg border border-navy/20 hover:bg-navy/[0.04]"
        >
          Compris
        </button>
      )}
    </div>
  )
}
