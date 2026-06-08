import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useCompetition } from '../../contexts/CompetitionContext'
import { saveBatchBets } from '../../hooks/bets'
import { useHideCrisp } from '../../hooks/useHideCrisp'
import { generatePredictions, type AiProvider } from '../../lib/openrouter'
import { captureEvent } from '../../lib/posthog'
import type { NormalizedMatch } from '../../hooks/matches'
import { useLanguage } from '../../contexts/LanguageContext'

import Flag from '../../components/Flag'

type ModalStep =
  | 'prompt'
  | 'choose'
  | 'loading'
  | 'error'
  | 'cn_question'
  | 'cn_rejected'
  | 'us_payment'

interface AiBetModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  matches: NormalizedMatch[]
  bettedMatchIds: Set<string>
  isAdmin: boolean
}

const AI_PROVIDERS: {
  id: AiProvider
  country: string
  title: string
  subtitle: string
  label: string
}[] = [
  {
    id: 'openai',
    country: 'us',
    title: 'IA Américaine',
    subtitle: 'Yes, of course!',
    label: 'OpenAI',
  },
  {
    id: 'deepseek',
    country: 'cn',
    title: 'IA Chinoise',
    subtitle: "L'IA qui fait trembler la Silicon Valley",
    label: 'DeepSeek',
  },
  {
    id: 'mistral',
    country: 'fr',
    title: 'Une IA française, monsieur',
    subtitle: 'Cocorico !',
    label: 'Mistral',
  },
]

function computeMatchesToPredict(
  matches: NormalizedMatch[],
  bettedMatchIds: Set<string>,
  overwrite: boolean,
): NormalizedMatch[] {
  const withTeams = matches.filter((m) => m.teamAName && m.teamBName)
  if (overwrite) return withTeams
  return withTeams.filter((m) => !bettedMatchIds.has(m.id))
}

function getPromptSuggestionIndex(
  suggestion: string,
  suggestions: string[],
): number {
  return suggestions.indexOf(suggestion)
}

function getAiPredictionErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    return err.message
  }

  return fallback
}

const AiBetModal = ({
  open,
  onClose,
  onComplete,
  matches,
  bettedMatchIds,
  isAdmin,
}: AiBetModalProps) => {
  const { user, profile } = useAuth()
  const { activeCompetitionId, competition } = useCompetition()
  const { t } = useLanguage()
  useHideCrisp(open)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<ModalStep>('prompt')
  const [prompt, setPrompt] = useState('')
  const [overwriteExisting, setOverwriteExisting] = useState(isAdmin)
  const [error, setError] = useState<string | null>(null)

  const hasSomeBets = useMemo(
    () => matches.some((m) => bettedMatchIds.has(m.id)),
    [matches, bettedMatchIds],
  )

  const matchesToPredict = useMemo(
    () => computeMatchesToPredict(matches, bettedMatchIds, overwriteExisting),
    [matches, bettedMatchIds, overwriteExisting],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
      captureEvent('ai_bet_modal_opened', {
        matches_count: matches.length,
        already_betted_count: bettedMatchIds.size,
        admin: isAdmin,
      })
      setStep('prompt')
      setError(null)
    } else {
      dialog.close()
    }
  }, [open, matches.length, bettedMatchIds.size, isAdmin])

  const handleClose = useCallback(() => {
    captureEvent('ai_bet_modal_closed', {
      step,
    })
    onClose()
  }, [onClose, step])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget && step !== 'loading') {
        handleClose()
      }
    },
    [step, handleClose],
  )

  const handleGoToChoose = useCallback(() => {
    captureEvent('ai_bet_choose_provider_opened', {
      matches_to_predict_count: matchesToPredict.length,
      overwrite_existing: overwriteExisting,
      prompt_length: prompt.length,
    })
    setStep('choose')
  }, [matchesToPredict.length, overwriteExisting, prompt.length])

  const handleBackToPrompt = useCallback(() => {
    setStep('prompt')
    setError(null)
  }, [])

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value)
    },
    [],
  )

  const handleOverwriteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      captureEvent('ai_bet_overwrite_toggled', {
        enabled: e.target.checked,
      })
      setOverwriteExisting(e.target.checked)
    },
    [],
  )

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      captureEvent('ai_bet_prompt_suggestion_clicked', {
        suggestion_index: getPromptSuggestionIndex(
          suggestion,
          t.aiBet.promptSuggestions,
        ),
      })
      setPrompt(suggestion)
    },
    [t.aiBet.promptSuggestions],
  )

  const executeAiPrediction = useCallback(
    async (provider: AiProvider) => {
      if (!user) return
      captureEvent('ai_bet_prediction_requested', {
        provider,
        competition_id: activeCompetitionId,
        matches_to_predict_count: matchesToPredict.length,
        overwrite_existing: overwriteExisting,
        prompt_length: prompt.length,
      })
      setStep('loading')
      setError(null)

      try {
        const aiCompetitionLabel = competition?.name?.trim() ?? ''
        const predictions = await generatePredictions(
          matchesToPredict,
          prompt,
          provider,
          aiCompetitionLabel,
        )

        if (predictions.length === 0) {
          throw new Error(t.aiBet.noValidPrediction)
        }

        const count = await saveBatchBets(
          user.id,
          predictions,
          activeCompetitionId,
        )
        captureEvent('ai_bet_prediction_succeeded', {
          provider,
          competition_id: activeCompetitionId,
          predictions_count: count,
        })
        toast.success(`${count} ${t.aiBet.successFilledByAi}`)
        onComplete()
        onClose()
      } catch (err: unknown) {
        captureEvent('ai_bet_prediction_failed', {
          provider,
          competition_id: activeCompetitionId,
          matches_to_predict_count: matchesToPredict.length,
        })
        setError(getAiPredictionErrorMessage(err, t.aiBet.unknownError))
        setStep('error')
      }
    },
    [
      user,
      matchesToPredict,
      prompt,
      onComplete,
      onClose,
      activeCompetitionId,
      competition?.name,
      overwriteExisting,
      t.aiBet.noValidPrediction,
      t.aiBet.successFilledByAi,
      t.aiBet.unknownError,
    ],
  )

  const handleChooseProvider = useCallback(
    (provider: AiProvider) => {
      if (!user) return
      captureEvent('ai_bet_provider_selected', {
        provider,
      })

      if (provider === 'deepseek') {
        setStep('cn_question')
        return
      }

      if (provider === 'openai') {
        setStep('us_payment')
        return
      }

      executeAiPrediction(provider)
    },
    [user, executeAiPrediction],
  )

  return createPortal(
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto w-[90vw] max-w-md rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/40"
      onClose={handleClose}
      onClick={handleBackdropClick}
    >
      <div className="relative p-6 flex flex-col gap-4">
        {step !== 'loading' && (
          <button
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        )}

        {step === 'prompt' && (
          <div className="flex flex-col gap-4">
            <div className="text-3xl text-center">✨</div>
            <h2 className="text-lg font-bold text-navy text-center m-0">
              {t.aiBet.promptTitle}
            </h2>
            <p className="text-sm text-gray-500 text-center m-0">
              {t.aiBet.promptSubtitle}
            </p>

            <textarea
              className="w-full py-2.5 px-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm outline-none transition-colors bg-white focus:border-indigo-500 placeholder:text-gray-300 resize-none"
              placeholder={t.aiBet.promptPlaceholder}
              value={prompt}
              onChange={handlePromptChange}
              rows={3}
            />

            <div className="flex flex-wrap gap-2">
              {t.aiBet.promptSuggestions.map((s) => (
                <button
                  key={s}
                  className="text-xs py-1.5 px-3 rounded-full border border-gray-200 bg-gray-50 text-gray-600 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {hasSomeBets && (
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={handleOverwriteChange}
                  className="accent-indigo-500"
                />
                <span>{t.aiBet.overwriteExisting}</span>
              </label>
            )}

            <p className="text-xs text-gray-400 text-center m-0">
              {matchesToPredict.length}{' '}
              {matchesToPredict.length > 1
                ? t.aiBet.countSuffixPlural
                : t.aiBet.countSuffixSingular}
            </p>

            <button
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full border-none cursor-pointer transition-all duration-150 bg-navy text-white py-2.5 px-5 text-sm hover:bg-navy-light disabled:opacity-50"
              onClick={handleGoToChoose}
              disabled={matchesToPredict.length === 0}
            >
              {t.aiBet.chooseProvider}
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 'choose' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-navy text-center m-0">
              {t.aiBet.chooseProviderTitle}
            </h2>
            <p className="text-sm text-gray-500 text-center m-0">
              {t.aiBet.chooseProviderSubtitle}
            </p>

            <div className="flex flex-col gap-2">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-indigo-300 hover:shadow-card transition-all text-left"
                  onClick={() => handleChooseProvider(p.id)}
                >
                  <Flag
                    country={p.country}
                    className="w-[34px] rounded-[4px]"
                  />
                  <div className="flex-1">
                    <span className="block text-sm font-semibold text-navy">
                      {p.title}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {p.subtitle}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 py-0.5 px-2 rounded-full">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full border-none cursor-pointer bg-transparent text-gray-500 py-2 px-4 text-sm hover:text-navy hover:bg-navy/[0.04] transition-colors"
              onClick={handleBackToPrompt}
            >
              {t.aiBet.back}
            </button>
          </div>
        )}

        {step === 'cn_question' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-navy text-center m-0">
              {t.aiBet.securityTitle}
            </h2>
            <p className="text-sm text-gray-700 text-center m-0">
              {t.aiBet.securityQuestion}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button
                className="w-full py-2.5 px-4 rounded-xl border-none cursor-pointer bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                onClick={() => executeAiPrediction('deepseek')}
              >
                {t.aiBet.securityYes}
              </button>
              <button
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => setStep('cn_rejected')}
              >
                {t.aiBet.securityNo}
              </button>
            </div>
            <button
              className="mt-2 inline-flex items-center justify-center gap-2 font-semibold rounded-full border-none cursor-pointer bg-transparent text-gray-500 py-2 px-4 text-sm hover:text-navy hover:bg-navy/[0.04] transition-colors"
              onClick={handleGoToChoose}
            >
              {t.aiBet.back}
            </button>
          </div>
        )}

        {step === 'cn_rejected' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="text-4xl">🚨</div>
            <h2 className="text-lg font-bold text-red-600 m-0">
              {t.aiBet.rejectedTitle}
            </h2>
            <p className="text-sm text-gray-700 m-0">
              {t.aiBet.rejectedTextPrefix}{' '}
              {profile?.display_name || t.common.anonymous} !<br />
              {t.aiBet.rejectedTextSuffix}
            </p>
            <button
              className="mt-4 inline-flex items-center justify-center gap-2 font-semibold rounded-full border-none cursor-pointer bg-gray-100 text-gray-600 py-2 px-5 text-sm hover:bg-gray-200 transition-colors"
              onClick={handleGoToChoose}
            >
              {t.aiBet.rejectedButton}
            </button>
          </div>
        )}

        {step === 'us_payment' && (
          <div className="flex flex-col gap-4 text-center">
            <div className="text-4xl">🦅</div>
            <h2 className="text-lg font-bold text-navy m-0">
              {t.aiBet.customsTitle}
            </h2>
            <p className="text-sm text-gray-700 m-0">{t.aiBet.customsText}</p>
            <div className="flex flex-col gap-2 mt-2">
              <a
                href="https://soutenir.amnesty.fr/b/mon-don"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border-none cursor-pointer bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors no-underline block"
                onClick={handleClose}
              >
                {t.aiBet.customsButton}
              </a>
              <button
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleGoToChoose}
              >
                {t.aiBet.back}
              </button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            <h2 className="text-lg font-bold text-navy m-0">
              {t.aiBet.loadingTitle}
            </h2>
            <p className="text-sm text-gray-500 m-0">{t.aiBet.loadingText}</p>
            <p className="text-xs text-gray-400 m-0">
              {t.aiBet.loadingSubtitle}
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="text-3xl">😬</div>
            <h2 className="text-lg font-bold text-navy m-0">
              {t.aiBet.errorTitle}
            </h2>
            <p className="text-sm text-gray-500 m-0">{error}</p>
            <button
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full border-none cursor-pointer transition-all duration-150 bg-navy text-white py-2 px-5 text-sm hover:bg-navy-light"
              onClick={handleBackToPrompt}
            >
              {t.common.retry}
            </button>
          </div>
        )}
      </div>
    </dialog>,
    document.body,
  )
}

export default AiBetModal
