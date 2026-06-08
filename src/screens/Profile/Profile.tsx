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
import { useLanguage } from '../../contexts/LanguageContext'

const Profile = () => {
  const { user, profile, updatePassword } = useAuth()
  const { t } = useLanguage()
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
    toast.success(t.profile.passwordUpdated)
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
          {t.profile.signOut}
        </button>
      </div>

      {showLocalhostNotice ? (
        <p className="mt-6 text-sm text-gray-400 m-0 text-center leading-snug">
          {t.profile.localhostNotice}
        </p>
      ) : null}

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-card text-left">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound
            className="text-navy shrink-0"
            size={20}
            strokeWidth={2.25}
          />
          <h3 className="text-base font-bold text-navy m-0">
            {t.profile.passwordTitle}
          </h3>
        </div>
        <p className="text-sm text-gray-500 m-0 mb-4 leading-snug">
          {t.profile.updatePasswordDescription}
        </p>
        <PasswordForm
          submitLabel={t.profile.updatePassword}
          submittingLabel={t.profile.updatePasswordSubmitting}
          onSubmit={handlePasswordSubmit}
        />
      </div>

      {pushEnabled ? (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-card text-left">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="text-navy shrink-0" size={20} strokeWidth={2.25} />
            <h3 className="text-base font-bold text-navy m-0">
              {t.profile.notificationsTitle}
            </h3>
          </div>
          <p className="text-sm text-gray-500 m-0 mb-4 leading-snug">
            {t.profile.notificationsText}
          </p>

          {pushState === 'loading' ? (
            <p className="text-sm text-gray-400 m-0">{t.profile.loading}</p>
          ) : null}

          {pushState === 'subscribed' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-green-700 font-medium m-0">
                {t.profile.alertsEnabled}
              </p>
              <button
                type="button"
                className="text-sm font-semibold text-navy py-2 px-4 rounded-lg border border-navy/25 hover:bg-navy/[0.06] transition-colors"
                onClick={async () => {
                  try {
                    await optOutPushSubscription()
                    await refreshPush()
                    captureEvent('push_profile_disabled')
                    toast.success(t.profile.notificationsDisabledToast)
                  } catch (err: unknown) {
                    captureEvent('push_profile_disable_failed')
                    console.error(err)
                    toast.error(t.profile.notificationsEnableError)
                  }
                }}
              >
                {t.profile.disableAlerts}
              </button>
            </div>
          ) : null}

          {pushState === 'can_enable' || pushState === 'can_reenable' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-600 m-0">
                {pushState === 'can_reenable'
                  ? t.profile.enableAgainText
                  : t.profile.enableText}
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
                    toast.success(t.profile.notificationsSavedToast)
                  } catch (err: unknown) {
                    captureEvent('push_profile_enable_failed', {
                      previous_state: pushState,
                    })
                    console.error(err)
                    toast.error(t.profile.notificationsEnableError)
                  }
                }}
              >
                {pushState === 'can_reenable'
                  ? t.profile.reactivateAlerts
                  : t.profile.activateAlerts}
              </button>
            </div>
          ) : null}

          {pushState === 'denied' ? (
            <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3 m-0 leading-snug">
              {t.profile.notificationsDenied}
            </p>
          ) : null}

          {pushState === 'error' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-600 m-0 leading-snug">
                {t.profile.pushError}
              </p>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center py-2.5 px-5 bg-navy text-cream font-semibold rounded-lg hover:bg-navy/90 transition-colors"
                onClick={() => {
                  void refreshPush({ showLoading: true })
                }}
              >
                {t.common.retry}
              </button>
            </div>
          ) : null}

          {pushState === 'unsupported' ? (
            <p className="text-sm text-gray-600 m-0 leading-snug">
              {t.profile.notificationsUnsupported}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Profile
