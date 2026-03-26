import {
  Home,
  Trophy,
  Users,
  HelpCircle,
  MessageCircleQuestion,
  BarChart3,
  ShieldCheck,
  type LucideProps,
} from 'lucide-react'
import { Suspense, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logoUrl from '../../assets/logo.svg'
import { useIsUserConnected, useIsUserAdmin } from '../../hooks/user'
import { useCompetitionDisplayName } from '../../hooks/competition'

const FootballIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon
      points="12 12 9.5 8.5 14.5 8.5"
      fill="currentColor"
      stroke="currentColor"
    />
    <path d="M9.5 8.5L6 7" />
    <path d="M14.5 8.5L18 7" />
    <path d="M12 12v4.5" />
    <path d="M12 16.5L8.5 19" />
    <path d="M12 16.5L15.5 19" />
    <path d="M6 7l-2 3" />
    <path d="M18 7l2 3" />
  </svg>
)

const menuItems = [
  { label: 'Accueil', icon: Home, path: '/', auth: false, admin: false },
  {
    label: 'Pronostics',
    icon: FootballIcon,
    path: '/matches',
    auth: true,
    admin: false,
  },
  {
    label: 'Classement',
    icon: Trophy,
    path: '/ranking',
    auth: true,
    admin: false,
  },
  { label: 'Tribus', icon: Users, path: '/groups', auth: true, admin: false },
  {
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    auth: false,
    admin: false,
  },
  {
    label: 'Règles',
    icon: HelpCircle,
    path: '/rules',
    auth: false,
    admin: false,
  },
  {
    label: 'FAQ',
    icon: MessageCircleQuestion,
    path: '/faq',
    auth: false,
    admin: false,
  },
  {
    label: 'Admin',
    icon: ShieldCheck,
    path: '/admin',
    auth: true,
    admin: true,
  },
]

interface NavigationMenuProps {
  closeMenu: () => void
  menuOpen: boolean
}

const NavigationMenu = ({ closeMenu, menuOpen }: NavigationMenuProps) => {
  const isConnected = useIsUserConnected()
  const isAdmin = useIsUserAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const competitionSubtitle = useCompetitionDisplayName()

  useEffect(() => {
    if (!menuOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen, closeMenu])

  const visibleItems = menuItems.filter(
    (item) => (!item.auth || isConnected) && (!item.admin || isAdmin),
  )

  const goTo = (to: string) => () => {
    navigate(to)
    closeMenu()
  }

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-[1050] bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={closeMenu}
        />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[1100] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            <img src={logoUrl} alt="Make Prono Great Again" className="h-14 w-auto flex-shrink-0" />
            <span className="block text-[0.65rem] text-gray-400 leading-snug">
              {competitionSubtitle}
            </span>
          </div>

          <nav className="flex-1 py-3 px-3 overflow-y-auto">
            {visibleItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)

              return (
                <button
                  key={item.path}
                  className={`flex items-center gap-3 w-full py-3 px-3 rounded-xl border-none text-sm font-medium cursor-pointer text-left transition-all duration-150 mb-0.5 ${
                    isActive
                      ? 'bg-navy text-white font-semibold shadow-sm'
                      : 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-navy'
                  }`}
                  onClick={goTo(item.path)}
                >
                  <item.icon
                    size={20}
                    className={isActive ? 'text-white' : 'text-gray-400'}
                  />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-[0.6rem] text-gray-400 text-center">
              Fait avec ❤️ par la B-IA-N Corporation
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

const NavigationMenuSuspense = (props: NavigationMenuProps) => {
  return (
    <Suspense fallback={null}>
      <NavigationMenu {...props} />
    </Suspense>
  )
}

export default NavigationMenuSuspense
