import { X } from 'lucide-react'
import Mascot from './Mascot'
import { useHideCrisp } from '../hooks/useHideCrisp'
import { dismissNotificationPrompt } from '../lib/promptCadence'
import {
  optInPushSubscription,
  type PushNotificationUiState,
} from '../lib/pushNotificationState'
import { captureEvent } from '../lib/posthog'

interface NotificationPromptProps {
  userId: string
  state: PushNotificationUiState
  enabled: boolean
  refresh: () => Promise<void>
  onHandled: () => void
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

function isStandalonePwa(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

export default function NotificationPrompt({
  userId,
  state,
  enabled,
  refresh,
  onHandled,
}: NotificationPromptProps) {
  const iosNeedsInstall = isIos() && !isStandalonePwa()
  const show = enabled && state === 'can_enable'

  useHideCrisp(show)

  const handleEnable = async () => {
    captureEvent('push_prompt_enable_clicked')
    try {
      await optInPushSubscription()
      await refresh()
      captureEvent('push_prompt_enabled')
    } catch (err: unknown) {
      captureEvent('push_prompt_enable_failed')
      console.error('Notification prompt', err)
    } finally {
      onHandled()
    }
  }

  const handleDismiss = () => {
    captureEvent('push_prompt_dismissed', {
      ios_needs_install: iosNeedsInstall,
    })
    dismissNotificationPrompt(userId)
    onHandled()
  }

  if (!show) {
    return null
  }

  return (
    <div className="fixed bottom-28 left-4 right-4 md:bottom-4 md:left-4 md:right-auto md:w-96 z-[9998] p-4 bg-cream rounded-xl shadow-2xl border border-navy/10 flex flex-col gap-3 animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 rounded-full bg-white shadow-card ring-2 ring-white">
            <Mascot id="canada" size="md" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-navy leading-tight">
              Pierre te sauve du prono oublié
            </h3>
            <p className="text-sm text-navy/70 leading-snug mt-1 m-0">
              Un rappel 5 min avant le coup d&apos;envoi si ta grille est vide.
              Pas de spam : Pierre a déjà assez de bois à couper.
            </p>
            {iosNeedsInstall ? (
              <p className="text-xs text-navy/80 mt-2 m-0 leading-snug bg-white/70 border border-navy/10 rounded-lg p-2">
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
          className="shrink-0 text-navy/40 hover:bg-white/70 hover:text-navy rounded-lg p-1 transition-colors -mt-1 -mr-1"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>
      {!iosNeedsInstall ? (
        <button
          type="button"
          onClick={handleEnable}
          className="w-full py-2.5 bg-navy hover:bg-navy/90 text-cream font-semibold rounded-lg transition-colors shadow-sm"
        >
          Oui, sauve mon prono
        </button>
      ) : (
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-2.5 text-navy font-semibold rounded-lg border border-navy/20 bg-white/60 hover:bg-white"
        >
          Compris
        </button>
      )}
    </div>
  )
}
