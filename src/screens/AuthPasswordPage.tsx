import { KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PasswordForm from 'components/PasswordForm'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { TranslationDictionary } from '../lib/i18n'

type AuthPasswordMode = 'setup' | 'reset'

interface AuthPasswordPageProps {
  mode: AuthPasswordMode
}

function getPageTitle(
  mode: AuthPasswordMode,
  t: TranslationDictionary,
): string {
  if (mode === 'setup') {
    return t.authPassword.setupTitle
  }

  return t.authPassword.resetTitle
}

function getPageDescription(
  mode: AuthPasswordMode,
  t: TranslationDictionary,
): string {
  if (mode === 'setup') {
    return t.authPassword.setupDescription
  }

  return t.authPassword.resetDescription
}

function getSuccessMessage(
  mode: AuthPasswordMode,
  t: TranslationDictionary,
): string {
  if (mode === 'setup') {
    return t.authPassword.setupSuccess
  }

  return t.authPassword.resetSuccess
}

const AuthPasswordPage = ({ mode }: AuthPasswordPageProps) => {
  const { user, loading, updatePassword } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  async function handlePasswordSubmit(password: string) {
    await updatePassword(password)
    toast.success(getSuccessMessage(mode, t))
    navigate('/')
  }

  if (loading) {
    return (
      <div className="max-w-[420px] mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-card text-center">
          <p className="text-sm text-gray-400 m-0">{t.profile.loading}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-[420px] mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-card text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <KeyRound size={22} />
          </div>
          <h1 className="text-xl font-extrabold text-navy m-0 mb-2">
            {t.authPassword.invalidTitle}
          </h1>
          <p className="text-sm text-gray-500 m-0 mb-5 leading-snug">
            {t.authPassword.invalidDescription}
          </p>
          <button
            type="button"
            className="inline-flex justify-center py-2.5 px-5 bg-navy text-cream font-semibold rounded-lg hover:bg-navy/90 transition-colors"
            onClick={() => navigate('/')}
          >
            {t.auth.backToLogin}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[420px] mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="w-12 h-12 rounded-full bg-navy/[0.06] text-navy flex items-center justify-center mx-auto mb-4">
          <KeyRound size={22} />
        </div>
        <h1 className="text-xl font-extrabold text-navy text-center m-0 mb-2">
          {getPageTitle(mode, t)}
        </h1>
        <p className="text-sm text-gray-500 text-center m-0 mb-5 leading-snug">
          {getPageDescription(mode, t)}
        </p>
        <PasswordForm
          submitLabel={t.authPassword.savePassword}
          submittingLabel={t.authPassword.savingPassword}
          onSubmit={handlePasswordSubmit}
        />
      </div>
    </div>
  )
}

export default AuthPasswordPage
