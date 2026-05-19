import { KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PasswordForm from 'components/PasswordForm'
import { useAuth } from '../contexts/AuthContext'

type AuthPasswordMode = 'setup' | 'reset'

interface AuthPasswordPageProps {
  mode: AuthPasswordMode
}

function getPageTitle(mode: AuthPasswordMode): string {
  if (mode === 'setup') {
    return 'Configure ton mot de passe'
  }

  return 'Nouveau mot de passe'
}

function getPageDescription(mode: AuthPasswordMode): string {
  if (mode === 'setup') {
    return 'Choisis le mot de passe qui servira pour tes prochaines connexions.'
  }

  return 'Définis un nouveau mot de passe pour récupérer ton compte.'
}

function getSuccessMessage(mode: AuthPasswordMode): string {
  if (mode === 'setup') {
    return 'Mot de passe configuré'
  }

  return 'Mot de passe réinitialisé'
}

const AuthPasswordPage = ({ mode }: AuthPasswordPageProps) => {
  const { user, loading, updatePassword } = useAuth()
  const navigate = useNavigate()

  async function handlePasswordSubmit(password: string) {
    await updatePassword(password)
    toast.success(getSuccessMessage(mode))
    navigate('/')
  }

  if (loading) {
    return (
      <div className="max-w-[420px] mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-card text-center">
          <p className="text-sm text-gray-400 m-0">Chargement…</p>
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
            Lien invalide ou expiré
          </h1>
          <p className="text-sm text-gray-500 m-0 mb-5 leading-snug">
            Redemande un email de gestion du mot de passe pour continuer.
          </p>
          <button
            type="button"
            className="inline-flex justify-center py-2.5 px-5 bg-navy text-cream font-semibold rounded-lg hover:bg-navy/90 transition-colors"
            onClick={() => navigate('/')}
          >
            Retour à la connexion
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
          {getPageTitle(mode)}
        </h1>
        <p className="text-sm text-gray-500 text-center m-0 mb-5 leading-snug">
          {getPageDescription(mode)}
        </p>
        <PasswordForm
          submitLabel="Enregistrer le mot de passe"
          submittingLabel="Enregistrement…"
          onSubmit={handlePasswordSubmit}
        />
      </div>
    </div>
  )
}

export default AuthPasswordPage
