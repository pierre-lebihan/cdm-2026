import { ArrowLeft, ArrowRight, KeyRound, Mail, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  useCreatePasswordSetupAccount,
  useEmailExists,
  useGoogleLogin,
  usePasswordLogin,
  usePasswordReset,
} from '../../hooks/user'
import { useCompetitionDisplayName } from '../../hooks/competition'
import {
  isAndroidDevice,
  isInAppBrowser,
  openInChromeAndroid,
} from '../../lib/inAppBrowser'

type ConnectionStep = 'email' | 'display_name' | 'password' | 'created'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_DISPLAY_NAME_LENGTH = 2
const MAX_DISPLAY_NAME_LENGTH = 20

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.78.42 3.46 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

function normalizeDisplayName(displayName: string): string {
  return displayName.trim()
}

function getDisplayNameValidationError(displayName: string): string | null {
  const normalizedDisplayName = normalizeDisplayName(displayName)

  if (normalizedDisplayName.length < MIN_DISPLAY_NAME_LENGTH) {
    return 'Le nom doit contenir au moins 2 caractères.'
  }

  if (normalizedDisplayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return 'Le nom doit contenir 20 caractères maximum.'
  }

  return null
}

function getEmailSubmitError(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }

  return "Impossible de vérifier l'adresse email."
}

function getLoginError(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }

  return 'Email ou mot de passe incorrect.'
}

function reloadCurrentPage() {
  window.location.reload()
}

function showOpenInSafariToast(): void {
  toast(
    'Pour continuer avec Google, ouvre cette page dans Safari : touche le menu « ··· » en haut à droite, puis « Ouvrir dans Safari ».',
    { duration: 7000, icon: '🌐' },
  )
}

const ConnectionModal = () => {
  const authenticateWithGoogle = useGoogleLogin()
  const checkEmailExists = useEmailExists()
  const createPasswordSetupAccount = useCreatePasswordSetupAccount()
  const authenticateWithPassword = usePasswordLogin()
  const sendPasswordReset = usePasswordReset()
  const competitionLabel = useCompetitionDisplayName()

  const [step, setStep] = useState<ConnectionStep>('email')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleGoogleClick() {
    if (!isInAppBrowser()) {
      authenticateWithGoogle()
      return
    }

    if (isAndroidDevice()) {
      openInChromeAndroid()
      return
    }

    showOpenInSafariToast()
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const nextEmail = normalizeEmail(email)
    if (!isValidEmail(nextEmail)) {
      setError('Entre une adresse email valide.')
      return
    }

    setEmail(nextEmail)
    setError(null)
    setSubmitting(true)
    try {
      const exists = await checkEmailExists(nextEmail)
      if (exists) {
        setStep('password')
      } else {
        setStep('display_name')
      }
    } catch (err) {
      setError(getEmailSubmitError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDisplayNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const validationError = getDisplayNameValidationError(displayName)
    if (validationError) {
      setError(validationError)
      return
    }

    const nextDisplayName = normalizeDisplayName(displayName)
    setDisplayName(nextDisplayName)
    setError(null)
    setSubmitting(true)
    try {
      await createPasswordSetupAccount(email, nextDisplayName)
      setStep('created')
    } catch (err) {
      setError(getEmailSubmitError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!password || passwordSubmitting) return

    setError(null)
    setPasswordSubmitting(true)
    try {
      await authenticateWithPassword(email, password)
    } catch (err) {
      setError(getLoginError(err))
    } finally {
      setPasswordSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    if (!email || resetSubmitting) return

    setError(null)
    setResetSubmitting(true)
    try {
      await sendPasswordReset(email)
      setResetSent(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer l'email de réinitialisation.",
      )
    } finally {
      setResetSubmitting(false)
    }
  }

  function handleBackToEmail() {
    setStep('email')
    setPassword('')
    setDisplayName('')
    setResetSent(false)
    setError(null)
  }

  return (
    <div className="py-8 px-7 text-center flex flex-col gap-3">
      <div className="text-4xl mb-1">⚽</div>
      <h2 className="text-xl font-extrabold text-navy m-0">Bienvenue !</h2>
      <p className="text-sm text-gray-500 mb-2">
        {competitionLabel === 'Pronostics'
          ? 'Connectez-vous pour pronostiquer les matchs et défier vos amis.'
          : `Connectez-vous pour pronostiquer les matchs de ${competitionLabel}.`}
      </p>

      <button
        type="button"
        className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-navy-dark cursor-pointer transition-all hover:border-navy hover:shadow-lg mx-auto"
        onClick={handleGoogleClick}
      >
        <GoogleIcon />
        <span>Continuer avec Google</span>
      </button>

      <div className="flex items-center gap-3 my-2 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        <span>ou</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {step === 'email' ? (
        <form
          onSubmit={handleEmailSubmit}
          className="flex flex-col gap-2 text-left"
        >
          <label
            htmlFor="email-login"
            className="text-xs font-semibold text-navy"
          >
            Email
          </label>
          <input
            id="email-login"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm focus:outline-none focus:border-navy"
          />
          {error ? (
            <p className="text-xs text-red-500 m-0" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting || !email}
            className="mt-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-navy text-white text-sm font-semibold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail size={16} />
            <span>{submitting ? 'Vérification…' : 'Continuer'}</span>
            {!submitting ? <ArrowRight size={16} /> : null}
          </button>
        </form>
      ) : null}

      {step === 'password' ? (
        <form
          onSubmit={handlePasswordSubmit}
          className="flex flex-col gap-2 text-left"
        >
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-navy"
            onClick={handleBackToEmail}
          >
            <ArrowLeft size={14} />
            <span>{email}</span>
          </button>
          <label
            htmlFor="password-login"
            className="text-xs font-semibold text-navy"
          >
            Mot de passe
          </label>
          <input
            id="password-login"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm focus:outline-none focus:border-navy"
          />
          {resetSent ? (
            <div className="text-sm text-navy-dark bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              Un email de réinitialisation vient d&apos;être envoyé à{' '}
              <strong>{email}</strong>.
            </div>
          ) : null}
          {error ? (
            <p className="text-xs text-red-500 m-0" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={passwordSubmitting || !password}
            className="mt-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-navy text-white text-sm font-semibold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyRound size={16} />
            <span>{passwordSubmitting ? 'Connexion…' : 'Se connecter'}</span>
          </button>
          <button
            type="button"
            disabled={resetSubmitting}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-navy hover:bg-navy/[0.06] disabled:opacity-50"
            onClick={handleForgotPassword}
          >
            <RotateCcw size={14} />
            <span>{resetSubmitting ? 'Envoi…' : 'Mot de passe oublié'}</span>
          </button>
        </form>
      ) : null}

      {step === 'display_name' ? (
        <form
          onSubmit={handleDisplayNameSubmit}
          className="flex flex-col gap-2 text-left"
        >
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-navy"
            onClick={handleBackToEmail}
          >
            <ArrowLeft size={14} />
            <span>{email}</span>
          </button>
          <label
            htmlFor="display-name-signup"
            className="text-xs font-semibold text-navy"
          >
            Nom affiché
          </label>
          <input
            id="display-name-signup"
            type="text"
            required
            minLength={MIN_DISPLAY_NAME_LENGTH}
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ton pseudo"
            className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm focus:outline-none focus:border-navy"
          />
          <p className="text-xs text-gray-400 m-0">Entre 2 et 20 caractères.</p>
          {error ? (
            <p className="text-xs text-red-500 m-0" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting || !displayName}
            className="mt-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-navy text-white text-sm font-semibold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail size={16} />
            <span>{submitting ? 'Création…' : 'Créer le compte'}</span>
          </button>
        </form>
      ) : null}

      {step === 'created' ? (
        <div className="text-sm text-navy-dark bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex flex-col gap-3">
          <p className="m-0">
            Un compte vient d&apos;être créé pour <strong>{email}</strong>.
            Clique sur le lien reçu par email pour configurer ton mot de passe.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-navy text-white text-xs font-semibold transition-all hover:opacity-90"
              onClick={handleBackToEmail}
            >
              <ArrowLeft size={14} />
              <span>Retour à la connexion</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-green-200 bg-white text-xs font-semibold text-navy transition-all hover:border-navy"
              onClick={reloadCurrentPage}
            >
              <RotateCcw size={14} />
              <span>Rafraîchir la page</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ConnectionModal
