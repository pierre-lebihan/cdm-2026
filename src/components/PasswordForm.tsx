import { KeyRound } from 'lucide-react'
import { useState } from 'react'

interface PasswordFormProps {
  submitLabel: string
  submittingLabel: string
  onSubmit: (password: string) => Promise<void>
}

function getPasswordValidationError(
  password: string,
  confirmPassword: string,
): string | null {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.'
  }

  if (password !== confirmPassword) {
    return 'Les deux mots de passe ne correspondent pas.'
  }

  return null
}

const PasswordForm = ({
  submitLabel,
  submittingLabel,
  onSubmit,
}: PasswordFormProps) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const validationError = getPasswordValidationError(
      password,
      confirmPassword,
    )
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(password)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de mettre à jour le mot de passe.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="new-password"
          className="text-xs font-semibold text-navy"
        >
          Nouveau mot de passe
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm focus:outline-none focus:border-navy"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirm-password"
          className="text-xs font-semibold text-navy"
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm focus:outline-none focus:border-navy"
        />
      </div>

      {error ? (
        <p className="text-xs text-red-500 m-0" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-navy text-white text-sm font-semibold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <KeyRound size={16} />
        <span>{submitting ? submittingLabel : submitLabel}</span>
      </button>
    </form>
  )
}

export default PasswordForm
