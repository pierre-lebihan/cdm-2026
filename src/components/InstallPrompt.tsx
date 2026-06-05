import { useState, useEffect } from 'react'
import { Download, Share, X } from 'lucide-react'
import { useHideCrisp } from '../hooks/useHideCrisp'
import { captureEvent } from '../lib/posthog'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

const DISMISS_KEY = 'pwaPromptDismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000

interface InstallPromptProps {
  enabled?: boolean
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

function wasDismissedRecently(): boolean {
  const dismissedTimestamp = localStorage.getItem(DISMISS_KEY)
  if (!dismissedTimestamp) return false
  return Date.now() - parseInt(dismissedTimestamp, 10) < DISMISS_DURATION_MS
}

export default function InstallPrompt({ enabled = true }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showChromePrompt, setShowChromePrompt] = useState(false)
  const [showIosPrompt, setShowIosPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setShowChromePrompt(false)
      setShowIosPrompt(false)
      return
    }

    if (isInStandaloneMode() || wasDismissedRecently()) return

    if (isIos()) {
      setShowIosPrompt(true)
      return
    }

    const stored = window.__deferredInstallPrompt
    if (stored) {
      setDeferredPrompt(stored)
      setShowChromePrompt(true)
      window.__deferredInstallPrompt = undefined
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowChromePrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [enabled])

  useEffect(() => {
    if (!enabled || dismissed) {
      return
    }

    if (showChromePrompt) {
      captureEvent('pwa_install_prompt_shown', {
        platform: 'browser',
      })
      return
    }

    if (showIosPrompt) {
      captureEvent('pwa_install_prompt_shown', {
        platform: 'ios',
      })
    }
  }, [enabled, dismissed, showChromePrompt, showIosPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    captureEvent('pwa_install_prompt_accepted')
    await deferredPrompt.prompt()
    setDeferredPrompt(null)
    setShowChromePrompt(false)
  }

  const handleDismiss = () => {
    captureEvent('pwa_install_prompt_dismissed', {
      platform: showIosPrompt ? 'ios' : 'browser',
    })
    setDismissed(true)
    setShowChromePrompt(false)
    setShowIosPrompt(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  const isVisible = enabled && !dismissed && (showChromePrompt || showIosPrompt)
  useHideCrisp(isVisible)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] p-4 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col gap-4 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            {showIosPrompt ? <Share size={24} /> : <Download size={24} />}
          </div>
          <div>
            <h3 className="font-semibold text-navy">Installer l'application</h3>
            <p className="text-sm text-gray-500 leading-tight mt-0.5">
              {showIosPrompt
                ? 'Appuyez sur le bouton Partager puis "Sur l\'écran d\'accueil"'
                : 'Pour un accès plus rapide, même hors ligne !'}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:bg-gray-100 rounded-lg p-1 transition-colors -mt-1 -mr-1"
          aria-label="Plus tard"
        >
          <X size={20} />
        </button>
      </div>

      {showChromePrompt && (
        <button
          onClick={handleInstallClick}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Ajouter à l'écran d'accueil
        </button>
      )}
    </div>
  )
}
