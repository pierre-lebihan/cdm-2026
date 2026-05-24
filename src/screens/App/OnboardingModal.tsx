import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Mascot from '../../components/Mascot'
import type { MascotId } from '../../lib/mascots'
import { setCrispChatVisible } from '../../lib/crisp'

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

interface Step {
  mascot: MascotId
  title: string
  subtitle: string
  body: string
  tipLabel: string
  tip: string
  bgGradient: string
}

const STEPS: Step[] = [
  {
    mascot: 'usa',
    title: 'Pronostique chaque match',
    subtitle: '« Listen up, partner ! »',
    body:
      'Avant chaque coup d\'envoi, donne ton pronostic : le score exact des deux équipes. Ton vote est sauvegardé automatiquement. Tu peux revenir le modifier autant que tu veux tant que le match n\'a pas commencé.',
    tipLabel: 'Astuce de Sam',
    tip:
      'Pas le temps de tout pronostiquer ? L\'IA peut le faire pour toi : repère le bouton violet en haut de la page des matchs.',
    bgGradient: 'from-red-50 via-white to-blue-50',
  },
  {
    mascot: 'mexico',
    title: 'Marque (et multiplie) tes points',
    subtitle: '« Sois malin, amigo ! »',
    body:
      'Score parfait, bon vainqueur, bon nul, écart proche : tu marques jusqu\'à 20 points de base. Puis une cote « anti-mouton » multiplie ton score : plus tu pronostiques l\'inattendu, plus le gain potentiel grimpe.',
    tipLabel: 'Astuce de Diego',
    tip:
      'Regarde la barre de tendance sous chaque match : elle te montre où vont les autres joueurs et la cote correspondante.',
    bgGradient: 'from-emerald-50 via-amber-50 to-orange-50',
  },
  {
    mascot: 'canada',
    title: 'Rejoins ta tribu, affronte tes amis',
    subtitle: '« On va voir qui est le bûcheron ! »',
    body:
      'Crée une tribu ou rejoins-en une avec un code. Tu suivras le classement de ton groupe en temps réel, match après match. Que le meilleur gagne (et que les autres paient la cagnotte).',
    tipLabel: 'Astuce de Pierre',
    tip:
      'Va dans l\'onglet Tribus pour créer la tienne ou en rejoindre une avec un code partagé par ton chef de tribu.',
    bgGradient: 'from-amber-50 via-white to-emerald-50',
  },
]

const OnboardingModal = ({ open, onClose }: OnboardingModalProps) => {
  const [stepIndex, setStepIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setStepIndex(0)
    }
    setCrispChatVisible(!open)
    return () => {
      setCrispChatVisible(true)
    }
  }, [open])

  if (!open) {
    return null
  }

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onClose()
      return
    }
    setStepIndex((idx) => idx + 1)
  }

  const handlePrev = () => {
    if (isFirst) return
    setStepIndex((idx) => idx - 1)
  }

  const handleGoToMatches = () => {
    onClose()
    navigate('/matches')
  }

  const handleGoToGroups = () => {
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
            aria-label="Fermer"
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
            {step.subtitle}
          </p>
          <h2
            id="onboarding-title"
            className="text-xl font-extrabold text-navy mb-3 leading-tight"
          >
            {step.title}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {step.body}
          </p>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-left mb-4 border border-white/80">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-navy/70 mb-1">
              💡 {step.tipLabel}
            </p>
            <p className="text-xs text-gray-600 leading-snug m-0">
              {step.tip}
            </p>
          </div>

          {isLast && (
            <div className="flex flex-col gap-2 mb-4">
              <button
                type="button"
                onClick={handleGoToMatches}
                className="w-full py-2.5 px-4 rounded-xl bg-navy text-white text-sm font-semibold shadow-md hover:bg-navy/90 transition-all"
              >
                ⚽ Commencer à pronostiquer
              </button>
              <button
                type="button"
                onClick={handleGoToGroups}
                className="w-full py-2 px-4 rounded-xl bg-white/80 text-navy text-sm font-semibold hover:bg-white transition-all"
              >
                🏕️ Rejoindre une tribu
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
            Précédent
          </button>
          <span className="text-xs text-navy/50 font-medium">
            {stepIndex + 1} / {STEPS.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-navy/90 transition-colors"
          >
            {isLast ? 'Terminer' : 'Suivant'}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
