import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'react-hot-toast'
import { clearDismissed, isDismissed, setDismissed } from 'utils/pwaUpdateDismiss'

const TOAST_ID = 'pwa-update-available'

export const PwaUpdatePrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false)

  // Garde useRegisterSW uniquement pour l'enregistrement du SW et le polling horaire.
  // On ignore délibérément son propre état needRefresh : workbox-window déclenche
  // l'event "waiting" même pour un SW déjà en attente au chargement de la page,
  // ce qui causerait le popup à s'afficher en permanence.
  const { updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => {
          r.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error("Erreur d'enregistrement du Service Worker", error)
    },
  })

  // Détection native : uniquement via updatefound → statechange === 'installed'
  // Le popup ne s'affiche que si un nouveau SW vient de terminer son installation
  // ET qu'il existe déjà un SW actif (= vraie mise à jour, pas première installation).
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return

        // Une nouvelle installation commence → effacer tout dismiss précédent
        clearDismissed()

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller !== null
          ) {
            // Nouveau SW installé et en attente, avec un controller existant
            // = vraie mise à jour (pas une première installation)
            setNeedRefresh(true)
          }
        })
      })
    })
  }, [])

  useEffect(() => {
    if (!needRefresh) {
      toast.dismiss(TOAST_ID)
      return
    }

    if (isDismissed()) {
      return
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-navy">
            Une nouvelle version de l'application est disponible !
          </span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-white bg-navy rounded-md hover:bg-navy/90 transition-colors"
              onClick={() => {
                toast.dismiss(t.id)
                updateServiceWorker(true)
              }}
            >
              Mettre à jour
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium text-navy bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => {
                setDismissed()
                setNeedRefresh(false)
                toast.dismiss(t.id)
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      ),
      {
        id: TOAST_ID,
        duration: Infinity,
        position: 'bottom-center',
      },
    )

    return () => {
      toast.dismiss(TOAST_ID)
    }
  }, [needRefresh, updateServiceWorker])

  return null
}

export default PwaUpdatePrompt
