import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Mascot from '../../components/Mascot'
import type { MascotId } from '../../lib/mascots'
import { useHideCrisp } from '../../hooks/useHideCrisp'
import { captureEvent } from '../../lib/posthog'
import { useLanguage } from '../../contexts/LanguageContext'

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

interface Step {
  bgGradient: string
  mascot: MascotId
}

const STEPS: Step[] = [
  {
    mascot: 'usa',
    bgGradient: 'from-red-50 via-white to-blue-50',
  },
  {
    mascot: 'mexico',
    bgGradient: 'from-emerald-50 via-amber-50 to-orange-50',
  },
  {
    mascot: 'canada',
    bgGradient: 'from-amber-50 via-white to-emerald-50',
  },
]

const OnboardingModal = ({ open, onClose }: OnboardingModalProps) => {
  const [stepIndex, setStepIndex] = useState(0)
  const navigate = useNavigate()
  const { t } = useLanguage()

  useHideCrisp(open)

  useEffect(() => {
    if (open) {
      captureEvent('onboarding_opened')
      setStepIndex(0)
    }
  }, [open])

  if (!open) {
    return null
  }

  const step = STEPS[stepIndex]
  const stepText = t.onboarding.steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      captureEvent('onboarding_completed')
      onClose()
      return
    }
    captureEvent('onboarding_next_clicked', {
      step_index: stepIndex,
    })
    setStepIndex((idx) => idx + 1)
  }

  const handlePrev = () => {
    if (isFirst) return
    captureEvent('onboarding_previous_clicked', {
      step_index: stepIndex,
    })
    setStepIndex((idx) => idx - 1)
  }

  const handleGoToMatches = () => {
    captureEvent('onboarding_matches_clicked')
    onClose()
    navigate('/matches')
  }

  const handleGoToGroups = () => {
    captureEvent('onboarding_groups_clicked')
    onClose()
    navigate('/groups')
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy/50 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onClick={onClose}
    >
      <div
        className={`w-full sm:max-w-md bg-gradient-to-br ${step.bgGradient} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 pt-3">
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === stepIndex
                    ? 'w-6 bg-navy'
                    : idx < stepIndex
                      ? 'w-3 bg-navy/40'
                      : 'w-3 bg-navy/15'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full text-navy/50 hover:bg-white/60 hover:text-navy"
            aria-label={t.common.close}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-2 pb-5 text-center">
          <div className="flex justify-center mb-3">
            <div className="ring-4 ring-white/80 rounded-full shadow-lg">
              <Mascot id={step.mascot} size="xl" />
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-navy/60 mb-1">
            {stepText.subtitle}
          </p>
          <h2
            id="onboarding-title"
            className="text-xl font-extrabold text-navy mb-3 leading-tight"
          >
            {stepText.title}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {stepText.body}
          </p>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-left mb-4 border border-white/80">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-navy/70 mb-1">
              💡 {stepText.tipLabel}
            </p>
            <p className="text-xs text-gray-600 leading-snug m-0">
              {stepText.tip}
            </p>
          </div>

          {isLast && (
            <div className="flex flex-col gap-2 mb-4">
              <button
                type="button"
                onClick={handleGoToMatches}
                className="w-full py-2.5 px-4 rounded-xl bg-navy text-white text-sm font-semibold shadow-md hover:bg-navy/90 transition-all"
              >
                {t.onboarding.startBetting}
              </button>
              <button
                type="button"
                onClick={handleGoToGroups}
                className="w-full py-2 px-4 rounded-xl bg-white/80 text-navy text-sm font-semibold hover:bg-white transition-all"
              >
                {t.onboarding.joinGroup}
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-white/40 border-t border-white/60">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-sm font-semibold text-navy disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/70 transition-colors"
          >
            <ChevronLeft size={16} />
            {t.onboarding.previous}
          </button>
          <span className="text-xs text-navy/50 font-medium">
            {stepIndex + 1} / {STEPS.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-navy/90 transition-colors"
          >
            {isLast ? t.onboarding.finish : t.onboarding.next}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
