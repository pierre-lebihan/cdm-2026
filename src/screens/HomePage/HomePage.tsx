import { isPast } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  useCompetitionData,
  useCompetitionDisplayName,
} from '../../hooks/competition'
import { useIsUserConnected, useGoogleLogin } from '../../hooks/user'
import FinalWinner from './FinalWinner/FinalWinner'
import { useNavigate, Link } from 'react-router-dom'
import baniere from '../../assets/visuels/baniere.jpeg'
import logo from '../../assets/icons/logo.png'
import ConnectionModal from '../App/ConnectionModal'

// Dimensions originales de la bannière (1191×850 d'après l'image)
const IMG_W = 1191
const IMG_H = 850

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
    <div className="mb-7">
      <FinalWinner />
    </div>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const signedIn = useIsUserConnected()
  const competitionTitle = useCompetitionDisplayName()

  // Modale de connexion
  const [modalOpen, setModalOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (modalOpen) dialog.showModal()
    else dialog.close()
  }, [modalOpen])

  useEffect(() => {
    if (signedIn && modalOpen) setModalOpen(false)
  }, [signedIn, modalOpen])

  // Swipe horizontal pour déplacer l'image de fond
  const heroRef = useRef<HTMLDivElement>(null)
  const [imgX, setImgX] = useState(50) // % de 0 (gauche) à 100 (droite)
  const touchStartX = useRef(0)
  const touchStartImgX = useRef(50)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartImgX.current = imgX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const hero = heroRef.current
    if (!hero) return
    const { width: cw, height: ch } = hero.getBoundingClientRect()
    // Largeur rendue de l'image avec object-cover
    const containerRatio = cw / ch
    const imgRatio = IMG_W / IMG_H
    const renderedW = containerRatio < imgRatio ? ch * imgRatio : cw
    const overflow = Math.max(0, renderedW - cw)
    if (overflow === 0) return

    const delta = e.touches[0].clientX - touchStartX.current
    const currentOffset = (touchStartImgX.current / 100) * overflow
    const newOffset = Math.max(0, Math.min(overflow, currentOffset - delta))
    setImgX((newOffset / overflow) * 100)
  }

  return (
    <div>
      {/* Hero plein écran */}
      <div
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: '100dvh' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <img
          src={baniere}
          alt="Make Prono Great Again"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: `${imgX}% 50%` }}
          draggable={false}
        />

        {/* Gradient sombre en bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <img
          src={logo}
          alt="Make Prono Great Again"
          className="absolute top-3 left-3 z-10 h-14 w-auto max-w-[min(140px,38vw)] object-contain drop-shadow-lg select-none sm:top-4 sm:left-4 sm:h-16 sm:max-w-[min(160px,42vw)]"
          draggable={false}
        />

        {/* Contenu superposé en bas */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 text-white text-center">
          <h1 className="text-3xl font-extrabold mb-2 drop-shadow-lg">
            {competitionTitle}
          </h1>
          <p className="text-sm text-white/75 mb-7 leading-relaxed max-w-[340px] mx-auto">
            Pronostiquez les résultats des matches, marquez des points et affrontez vos amis dans votre tribu !
          </p>

          {!signedIn && (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="py-3 px-8 rounded-xl bg-white text-navy font-semibold text-sm shadow-lg hover:bg-white/90 hover:-translate-y-px transition-all"
                onClick={() => setModalOpen(true)}
              >
                Connexion
              </button>
              <Link
                to="/rules"
                className="text-xs text-white/60 hover:text-white/90 transition-colors underline underline-offset-2"
              >
                Voir les règles
              </Link>
            </div>
          )}

          {signedIn && (
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-white font-semibold text-sm hover:bg-white/25 transition-all"
                onClick={() => navigate('/matches')}
              >
                <span>⚽</span> Pronostics
              </button>
              <button
                type="button"
                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-white font-semibold text-sm hover:bg-white/25 transition-all"
                onClick={() => navigate('/ranking')}
              >
                <span>🥇</span> Classement
              </button>
              <button
                type="button"
                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-white font-semibold text-sm hover:bg-white/25 transition-all"
                onClick={() => navigate('/rules')}
              >
                <span>📋</span> Règles
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu sous le fold pour les connectés */}
      {signedIn && (
        <div className="py-8 px-4 pb-12 max-w-[520px] mx-auto">
          <WinnerChoice />
        </div>
      )}

      {/* Modale de connexion */}
      {createPortal(
        <dialog
          ref={dialogRef}
          className="fixed inset-0 m-auto w-[90vw] max-w-sm rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/40"
          onClose={() => setModalOpen(false)}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <ConnectionModal />
        </dialog>,
        document.body,
      )}
    </div>
  )
}

export default HomePage
