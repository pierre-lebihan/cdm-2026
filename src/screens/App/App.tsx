import { Menu, X } from 'lucide-react'
import { Suspense, lazy, useState } from 'react'
import { Route, Routes, Link, Navigate, useLocation } from 'react-router-dom'
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
import SeoMetadata from 'components/SeoMetadata'
import PostHogTracker from 'components/PostHogTracker'
import LanguageSelector from 'components/LanguageSelector'
import DataRealtime from 'components/DataRealtime'
import { useLanguage } from '../../contexts/LanguageContext'
import { captureEvent } from '../../lib/posthog'

const AnalyticsPage = lazy(() => import('../Analytics'))
const AuthPasswordPage = lazy(() => import('../AuthPasswordPage'))
const FAQPage = lazy(() => import('../FAQ/FAQ'))
const GroupsPage = lazy(() => import('../Groups/Groups'))
const LegalPage = lazy(() => import('../Legal'))
const Profile = lazy(() => import('../Profile/Profile'))
const RankingPage = lazy(() => import('../Ranking/Ranking'))
const RulesPage = lazy(() => import('../Rules/rules'))
const AlgorithmPage = lazy(() => import('../Rules/algorithm'))
const AdminPage = lazy(() => import('../Admin'))

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { loading } = useAuth()
  const { t } = useLanguage()
  const signedIn = useIsUserConnected()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const hideHeader = isHomePage && !signedIn

  const handleMenuToggle = () => {
    const nextMenuOpen = !menuOpen
    captureEvent('navigation_menu_toggled', {
      opened: nextMenuOpen,
    })
    setMenuOpen(nextMenuOpen)
  }

  return (
    <>
      <PostHogTracker />
      <SeoMetadata />
      <DataRealtime />
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-[1100] h-14 flex items-center justify-between px-4 bg-cream/[0.88] backdrop-blur-sm border-b border-black/[0.06]">
          <button
            type="button"
            aria-label="Menu"
            onClick={handleMenuToggle}
            className="p-2 -ml-2 rounded-full text-navy hover:bg-navy/[0.06] transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-[0.72rem] font-extrabold leading-none text-navy transition-all hover:opacity-80 active:scale-95 sm:flex-none sm:justify-start sm:px-0 sm:text-[1.05rem] sm:leading-tight"
            title={t.nav.home}
          >
            <img
              src="/icon-192x192.png"
              alt=""
              className="hidden h-8 w-8 shrink-0 rounded-md object-contain sm:block"
            />
            <span className="flex flex-col items-center sm:block">
              <span className="sm:hidden">Make Prono</span>
              <span className="sm:hidden">Great Again</span>
              <span className="hidden sm:inline">Make Prono Great Again</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSelector />
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
            <Route path="/legal" element={<LegalPage />} />
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
                <Route path="/analytics" element={<AnalyticsPage />} />
              </>
            )}

            {!loading && !signedIn && (
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
            {!loading && signedIn && (
              <Route path="*" element={<NotFoundPage />} />
            )}
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
