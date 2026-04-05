import { Menu, X } from 'lucide-react'
import { Suspense, lazy, useState } from 'react'
import { Route, Routes, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useIsUserConnected } from '../../hooks/user'
import HomePage from '../HomePage/HomePage'
import UserPage from '../User'
import MatchesPage from '../Matches'
import NotFoundPage from '../NotFoundPage'
import ConnectionWidget from './ConnectionWidget/ConnectionWidget'
import NavigationMenu from './NavigationMenu'
import InstallPrompt from 'components/InstallPrompt'
import PwaUpdatePrompt from 'components/PwaUpdatePrompt'
import NotificationPrompt from 'components/NotificationPrompt'
import { OneSignalSubscriber } from 'components/OneSignalSubscriber'

const AnalyticsPage = lazy(() => import('../Analytics'))
const FAQPage = lazy(() => import('../FAQ/FAQ'))
const GroupsPage = lazy(() => import('../Groups/Groups'))
const Profile = lazy(() => import('../Profile/Profile'))
const RankingPage = lazy(() => import('../Ranking/Ranking'))
const RulesPage = lazy(() => import('../Rules/rules'))
const AlgorithmPage = lazy(() => import('../Rules/algorithm'))
const AdminPage = lazy(() => import('../Admin'))

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { loading } = useAuth()
  const signedIn = useIsUserConnected()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <>
      {!isHomePage && (
        <header className="fixed top-0 left-0 right-0 z-[1100] h-14 flex items-center justify-between px-4 bg-cream/[0.88] backdrop-blur-sm border-b border-black/[0.06]">
          <button type="button" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)} className="p-2 -ml-2 rounded-full text-navy hover:bg-navy/[0.06] transition-colors">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="text-[1.05rem] font-extrabold text-navy tracking-tight hover:opacity-80 active:scale-95 transition-all inline-block" title="Retour à l'accueil">Make Prono Great Again</Link>
          <div className="shrink-0">
            <ConnectionWidget />
          </div>
        </header>
      )}

      {!isHomePage && <NavigationMenu menuOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />}

      <main className={isHomePage ? '' : 'pt-14 min-h-[calc(100vh-56px)]'}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh] text-gray-400">Chargement...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/rules/algorithm" element={<AlgorithmPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />

            {signedIn && (
              <>
                <Route path="/matches/*" element={<MatchesPage />} />
                <Route path="/user/*" element={<UserPage />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPage />} />
              </>
            )}

            {!loading && <Route path="*" element={<NotFoundPage />} />}
          </Routes>
        </Suspense>
      </main>
      <InstallPrompt />
      <NotificationPrompt />
      <PwaUpdatePrompt />
      <OneSignalSubscriber />
      <Toaster position="bottom-center" />
    </>
  )
}

export default App
