import { Bell, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import PasswordForm from 'components/PasswordForm'
import { useAuth } from '../../contexts/AuthContext'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { useLogout } from '../../hooks/user'
import {
  optInPushSubscription,
  optOutPushSubscription,
} from '../../lib/pushNotificationState'
import { isLocalhostOrigin } from '../../lib/onesignal'
import EditProfile from './EditProfile'
import { captureEvent } from '../../lib/posthog'

const Profile = () => {
  const { user, profile, updatePassword } = useAuth()
  const logout = useLogout()
  const {
    state: pushState,
    refresh: refreshPush,
    enabled: pushEnabled,
  } = usePushNotifications()
  const showLocalhostNotice = isLocalhostOrigin()

  if (!user) return null

  const displayName =
    profile?.display_name || user?.user_metadata?.full_name || ''
  const photoURL = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  const email = user?.email || ''

  async function handlePasswordSubmit(password: string) {
    await updatePassword(password)
    toast.success('Mot de passe mis à jour')
  }

  return (
    <div className="max-w-[500px] mx-auto py-8 px-4">
      <EditProfile
        displayName={displayName}
        photoURL={photoURL}
        email={email}
      />

      <div className="text-center mt-4">
        <button
          className="inline-flex items-center gap-2 font-semibold rounded-full border-[1.5px] border-navy text-navy bg-transparent py-2 px-5 text-sm cursor-pointer transition-all hover:bg-navy/[0.06]"
          onClick={logout}
        >
          Se déconnecter
        </button>
      </div>

      {showLocalhostNotice ? (
        <p className="mt-6 text-sm text-gray-400 m-0 text-center leading-snug">
          Les notifications push ne sont pas disponibles sur localhost — elles
          fonctionnent sur le site en ligne une fois déployé.
        </p>
      ) : null}

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-card text-left">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound
            className="text-navy shrink-0"
            size={20}
            strokeWidth={2.25}
          />
          <h3 className="text-base font-bold text-navy m-0">Mot de passe</h3>
        </div>
        <p className="text-sm text-gray-500 m-0 mb-4 leading-snug">
          Ajoute ou remplace le mot de passe utilisé avec ton email.
        </p>
        <PasswordForm
          submitLabel="Mettre à jour"
          submittingLabel="Mise à jour…"
          onSubmit={handlePasswordSubmit}
        />
      </div>

      {pushEnabled ? (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-card text-left">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="text-navy shrink-0" size={20} strokeWidth={2.25} />
            <h3 className="text-base font-bold text-navy m-0">Notifications</h3>
          </div>
          <p className="text-sm text-gray-500 m-0 mb-4 leading-snug">
            Les rappels t&apos;aident à ne pas louper un coup d&apos;envoi quand
            ton prono n&apos;est pas encore posé (~5 min avant le match).
          </p>

          {pushState === 'loading' ? (
            <p className="text-sm text-gray-400 m-0">Chargement…</p>
          ) : null}

          {pushState === 'subscribed' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-green-700 font-medium m-0">
                Alertes matchs activées
              </p>
              <button
                type="button"
                className="text-sm font-semibold text-navy py-2 px-4 rounded-lg border border-navy/25 hover:bg-navy/[0.06] transition-colors"
                onClick={async () => {
                  try {
                    await optOutPushSubscription()
                    await refreshPush()
                    captureEvent('push_profile_disabled')
                    toast.success('Notifications désactivées pour ce site')
                  } catch (err: unknown) {
                    captureEvent('push_profile_disable_failed')
                    console.error(err)
                    toast.error('Impossible de mettre à jour les notifications')
                  }
                }}
              >
                Désactiver les alertes
              </button>
            </div>
          ) : null}

          {pushState === 'can_enable' || pushState === 'can_reenable' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-600 m-0">
                {pushState === 'can_reenable'
                  ? 'Tu avais coupé les alertes dans l’app. Tu peux les réactiver ici.'
                  : 'Tu n’as pas encore autorisé les notifications sur cet appareil.'}
              </p>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center py-2.5 px-5 bg-navy text-cream font-semibold rounded-lg hover:bg-navy/90 transition-colors"
                onClick={async () => {
                  try {
                    await optInPushSubscription()
                    await refreshPush()
                    captureEvent('push_profile_enabled', {
                      previous_state: pushState,
                    })
                    toast.success('Préférences enregistrées')
                  } catch (err: unknown) {
                    captureEvent('push_profile_enable_failed', {
                      previous_state: pushState,
                    })
                    console.error(err)
                    toast.error('Impossible d’activer les notifications')
                  }
                }}
              >
                {pushState === 'can_reenable'
                  ? 'Réactiver les alertes matchs'
                  : 'Activer les alertes matchs'}
              </button>
            </div>
          ) : null}

          {pushState === 'denied' ? (
            <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3 m-0 leading-snug">
              Le navigateur a refusé les notifications. Ouvre les réglages du
              site (icône cadenas ou menu du site dans la barre d’adresse) pour
              autoriser les notifications, puis reviens ici.
            </p>
          ) : null}

          {pushState === 'error' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-600 m-0 leading-snug">
                Le service de notifications n&apos;a pas répondu à temps ou une
                erreur est survenue. Vérifie ta connexion ou réessaie dans un
                instant.
              </p>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center py-2.5 px-5 bg-navy text-cream font-semibold rounded-lg hover:bg-navy/90 transition-colors"
                onClick={() => {
                  void refreshPush({ showLoading: true })
                }}
              >
                Réessayer
              </button>
            </div>
          ) : null}

          {pushState === 'unsupported' ? (
            <p className="text-sm text-gray-600 m-0 leading-snug">
              Les notifications ne sont pas disponibles sur ce navigateur ou cet
              appareil. Sur iPhone, installe l&apos;app sur l&apos;écran
              d&apos;accueil puis réessaie.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Profile
