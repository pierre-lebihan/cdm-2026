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
import Loader from 'components/Loader'
import PromptCoordinator from 'components/PromptCoordinator'
import PwaUpdatePrompt from 'components/PwaUpdatePrompt'
import { OneSignalSubscriber } from 'components/OneSignalSubscriber'

const AnalyticsPage = lazy(() => import('../Analytics'))
const AuthPasswordPage = lazy(() => import('../AuthPasswordPage'))
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
  const hideHeader = isHomePage && !signedIn

  return (
    <>
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-[1100] h-14 flex items-center justify-between px-4 bg-cream/[0.88] backdrop-blur-sm border-b border-black/[0.06]">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -ml-2 rounded-full text-navy hover:bg-navy/[0.06] transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 text-[1.05rem] font-extrabold text-navy tracking-tight hover:opacity-80 active:scale-95 transition-all"
            title="Retour à l'accueil"
          >
            <img
              src="/icon-192x192.png"
              alt=""
              className="w-8 h-8 rounded-md object-contain shrink-0"
            />
            <span>Make Prono Great Again</span>
          </Link>
          <div className="shrink-0">
            <ConnectionWidget />
          </div>
        </header>
      )}

      {!hideHeader && (
        <NavigationMenu
          menuOpen={menuOpen}
          closeMenu={() => setMenuOpen(false)}
        />
      )}

      <main className={hideHeader ? '' : 'pt-14 min-h-[calc(100vh-56px)]'}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/rules/algorithm" element={<AlgorithmPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route
              path="/auth/set-password"
              element={<AuthPasswordPage mode="setup" />}
            />
            <Route
              path="/auth/reset-password"
              element={<AuthPasswordPage mode="reset" />}
            />

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
      <PromptCoordinator />
      <PwaUpdatePrompt />
      <OneSignalSubscriber />
      <Toaster position="bottom-center" />
    </>
  )
}

export default App
