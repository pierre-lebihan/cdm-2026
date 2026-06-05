import { isPast } from 'date-fns'
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  useCompetitionData,
  useCompetitionDisplayName,
} from '../../hooks/competition'
import { useIsUserConnected } from '../../hooks/user'
import FinalWinner from './FinalWinner/FinalWinner'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import baniere from '../../assets/visuels/baniere.webp'
import logo from '../../assets/icons/logo.webp'
import ConnectionModal from '../App/ConnectionModal'
import OnboardingModal from '../App/OnboardingModal'
import Mascot from '../../components/Mascot'
import { MASCOT_LIST } from '../../lib/mascots'
import { captureEvent } from '../../lib/posthog'

const ONBOARDING_STORAGE_KEY = 'mpga-onboarding-seen'
const FINAL_WINNER_ELEMENT_ID = 'final-winner'
const FINAL_WINNER_HASH = `#${FINAL_WINNER_ELEMENT_ID}`

type HeroSlide = {
  imagePosition: number
}

const HERO_SLIDE_INTERVAL_MS = 5000
const HERO_SLIDE_STORAGE_KEY = 'mpga-home-hero-start-index'

const HERO_SLIDES: HeroSlide[] = [
  { imagePosition: 21 },
  { imagePosition: 50 },
  { imagePosition: 83 },
]

let cachedHeroStartIndex: number | undefined

const getNextHeroSlideIndex = (index: number) => {
  if (index >= HERO_SLIDES.length - 1) {
    return 0
  }

  return index + 1
}

const getFallbackHeroSlideIndex = () => {
  return Math.floor(Date.now() / 1000) % HERO_SLIDES.length
}

const getStoredHeroSlideIndex = () => {
  if (typeof window === 'undefined') {
    return getFallbackHeroSlideIndex()
  }

  try {
    const rawIndex = window.localStorage.getItem(HERO_SLIDE_STORAGE_KEY)
    const storedIndex = Number(rawIndex)

    if (
      Number.isInteger(storedIndex) &&
      storedIndex >= 0 &&
      storedIndex < HERO_SLIDES.length
    ) {
      return storedIndex
    }
  } catch {
    return getFallbackHeroSlideIndex()
  }

  return getFallbackHeroSlideIndex()
}

const saveHeroSlideIndex = (index: number) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(HERO_SLIDE_STORAGE_KEY, index.toString())
  } catch {
    return
  }
}

const getInitialHeroSlideIndex = () => {
  if (cachedHeroStartIndex !== undefined) {
    return cachedHeroStartIndex
  }

  cachedHeroStartIndex = getStoredHeroSlideIndex()
  saveHeroSlideIndex(getNextHeroSlideIndex(cachedHeroStartIndex))

  return cachedHeroStartIndex
}

const getHeroSlidePosition = (index: number) => {
  const slide = HERO_SLIDES[index]

  if (!slide) {
    return HERO_SLIDES[0].imagePosition
  }

  return slide.imagePosition
}

const advanceHeroSlide = (
  setHeroSlideIndex: Dispatch<SetStateAction<number>>,
) => {
  setHeroSlideIndex(getNextHeroSlideIndex)
}

const scrollToFinalWinner = () => {
  const element = document.getElementById(FINAL_WINNER_ELEMENT_ID)

  if (!element) {
    return
  }

  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ─── Page connecté : ancienne homepage ───────────────────────────────────────

const WinnerChoice = () => {
  const competitionData = useCompetitionData()

  const launchBetOk = useMemo(() => {
    if (!competitionData?.launch_bet) return true
    return isPast(new Date(competitionData.launch_bet))
  }, [competitionData?.launch_bet])

  if (!competitionData?.start_date) return null

  if (!launchBetOk) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-card text-center">
        <p className="text-gray-500 text-sm">
          Le pronostic du vainqueur final sera bientôt accessible !
        </p>
      </div>
    )
  }

  return (
    <div id={FINAL_WINNER_ELEMENT_ID} className="mb-7 scroll-mt-24">
      <FinalWinner />
    </div>
  )
}

const HomePageConnected = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const competitionTitle = useCompetitionDisplayName()
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  useEffect(() => {
    if (location.hash !== FINAL_WINNER_HASH) return

    const timeoutId = window.setTimeout(scrollToFinalWinner, 100)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [location.hash])

  useEffect(() => {
    if (location.hash === FINAL_WINNER_HASH) return
    if (typeof window === 'undefined') return
    try {
      const seen = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (!seen) {
        setOnboardingOpen(true)
      }
    } catch {
      return
    }
  }, [location.hash])

  const handleCloseOnboarding = () => {
    captureEvent('onboarding_closed')
    setOnboardingOpen(false)
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '1')
    } catch {
      return
    }
  }

  const handleReplayOnboarding = () => {
    captureEvent('onboarding_replay_clicked')
    setOnboardingOpen(true)
  }

  const handleShortcutClick = (path: string, label: string) => {
    captureEvent('home_shortcut_clicked', {
      path,
      label,
    })
    navigate(path)
  }

  return (
    <div className="py-8 px-4 pb-12 max-w-[520px] mx-auto">
      <div className="text-center mb-7">
        <img
          src="/og-image.png"
          alt=""
          className="w-full max-w-[360px] h-auto mx-auto mb-2 rounded-xl"
        />
        <h1 className="text-2xl font-extrabold text-navy m-0 mb-2">
          {competitionTitle}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Pronostiquez les résultats des matches, marquez des points et
          affrontez vos amis et votre famille dans votre tribu !
        </p>
      </div>

      <button
        type="button"
        onClick={handleReplayOnboarding}
        className="group w-full mb-7 rounded-2xl bg-white p-4 shadow-card hover:shadow-card-hover hover:-translate-y-px transition-all text-left flex items-center gap-3"
      >
        <div className="flex -space-x-3 shrink-0">
          {MASCOT_LIST.map((m) => (
            <Mascot
              key={m.id}
              id={m.id}
              size="sm"
              className="ring-2 ring-white"
            />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-navy m-0 leading-snug">
            Découvre comment jouer
          </p>
          <p className="text-xs text-gray-500 m-0 leading-snug">
            Sam, Iván et Pierre t'expliquent en 3 étapes
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-600 shrink-0 group-hover:underline">
          Lancer →
        </span>
      </button>

      <div className="flex flex-wrap gap-2.5 justify-center mb-7">
        <button
          type="button"
          className="flex-1 min-w-[140px] max-w-[200px] bg-white rounded-[14px] p-4 text-center shadow-card cursor-pointer transition-all border-none hover:shadow-card-hover hover:-translate-y-px"
          onClick={() => handleShortcutClick('/rules', 'Règles')}
        >
          <div className="text-2xl mb-1.5">📋</div>
          <div className="text-xs font-semibold text-navy">Règles</div>
        </button>
        <button
          type="button"
          className="flex-1 min-w-[140px] max-w-[200px] bg-white rounded-[14px] p-4 text-center shadow-card cursor-pointer transition-all border-none hover:shadow-card-hover hover:-translate-y-px"
          onClick={() => handleShortcutClick('/matches', 'Pronostics')}
        >
          <div className="text-2xl mb-1.5">⚽</div>
          <div className="text-xs font-semibold text-navy">Pronostics</div>
        </button>
        <button
          type="button"
          className="flex-1 min-w-[140px] max-w-[200px] bg-white rounded-[14px] p-4 text-center shadow-card cursor-pointer transition-all border-none hover:shadow-card-hover hover:-translate-y-px"
          onClick={() => handleShortcutClick('/ranking', 'Classement')}
        >
          <div className="text-2xl mb-1.5">🥇</div>
          <div className="text-xs font-semibold text-navy">Classement</div>
        </button>
      </div>

      <WinnerChoice />

      <OnboardingModal open={onboardingOpen} onClose={handleCloseOnboarding} />
    </div>
  )
}

// ─── Page non-connecté : hero plein écran ────────────────────────────────────

const HomePageGuest = () => {
  const competitionTitle = useCompetitionDisplayName()

  const [modalOpen, setModalOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const signedIn = useIsUserConnected()
  const [heroSlideIndex, setHeroSlideIndex] = useState(getInitialHeroSlideIndex)
  const heroSlidePosition = getHeroSlidePosition(heroSlideIndex)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (modalOpen) dialog.showModal()
    else dialog.close()
  }, [modalOpen])

  useEffect(() => {
    if (signedIn && modalOpen) setModalOpen(false)
  }, [signedIn, modalOpen])

  useEffect(() => {
    const intervalId = window.setInterval(
      advanceHeroSlide,
      HERO_SLIDE_INTERVAL_MS,
      setHeroSlideIndex,
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const handleOpenConnectionModal = () => {
    captureEvent('guest_connection_modal_opened')
    setModalOpen(true)
  }

  const handleCloseConnectionModal = () => {
    captureEvent('guest_connection_modal_closed')
    setModalOpen(false)
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '100dvh' }}
    >
      <img
        src={baniere}
        alt="Make Prono Great Again"
        className="absolute inset-0 h-full w-full object-cover transition-[object-position] duration-700 ease-in-out sm:hidden"
        style={{ objectPosition: `${heroSlidePosition}% 50%` }}
        draggable={false}
        fetchPriority="high"
      />

      <img
        src={baniere}
        alt="Make Prono Great Again"
        className="absolute inset-0 hidden h-full w-full object-cover object-center sm:block"
        draggable={false}
        fetchPriority="high"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <img
        src={logo}
        alt="Make Prono Great Again"
        className="absolute top-3 left-3 z-10 w-auto max-w-[min(200px,45vw)] max-h-24 object-contain object-left-top drop-shadow-lg select-none sm:top-4 sm:left-4 sm:max-w-[min(240px,50vw)] sm:max-h-28"
        draggable={false}
      />

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2 drop-shadow-lg">
          {competitionTitle}
        </h1>
        <p className="text-sm text-white/75 mb-7 leading-relaxed max-w-[340px] mx-auto">
          Pronostiquez les résultats des matches, marquez des points et
          affrontez vos amis dans votre tribu !
        </p>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            className="py-3 px-8 rounded-xl bg-white text-navy font-semibold text-sm shadow-lg hover:bg-white/90 hover:-translate-y-px transition-all"
            onClick={handleOpenConnectionModal}
          >
            Connexion
          </button>
          <Link
            to="/rules"
            className="text-xs text-white/60 hover:text-white/90 transition-colors underline underline-offset-2"
          >
            Voir les règles
          </Link>
          <Link
            to="/legal"
            className="text-[0.7rem] text-white/45 hover:text-white/80 transition-colors underline underline-offset-2"
          >
            Confidentialité et conditions
          </Link>
        </div>
      </div>

      {createPortal(
        <dialog
          ref={dialogRef}
          className="fixed inset-0 m-auto w-[90vw] max-w-sm rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/40"
          onClose={handleCloseConnectionModal}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <ConnectionModal />
        </dialog>,
        document.body,
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

const HomePage = () => {
  const signedIn = useIsUserConnected()
  return signedIn ? <HomePageConnected /> : <HomePageGuest />
}

export default HomePage
