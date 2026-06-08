import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useLogout } from '../../../hooks/user'
import { captureEvent } from '../../../lib/posthog'

const User = () => {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const logout = useLogout()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const displayName =
    profile?.display_name || user?.user_metadata?.full_name || ''
  const photoURL = profile?.avatar_url || user?.user_metadata?.avatar_url || ''

  const handleProfileClick = () => {
    captureEvent('user_menu_profile_clicked')
    navigate('/profile')
    setIsOpen(false)
  }

  const handleUserMenuToggle = () => {
    const nextIsOpen = !isOpen
    captureEvent('user_menu_toggled', {
      opened: nextIsOpen,
    })
    setIsOpen(nextIsOpen)
  }

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        e.target instanceof Node &&
        !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-1 rounded-full hover:ring-2 hover:ring-navy/20 transition-all"
        aria-label={t.common.profile}
        aria-haspopup="true"
        onClick={handleUserMenuToggle}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={handleProfileClick}
          >
            {t.common.profile}
          </button>
          <button
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={logout}
          >
            {t.common.signOut}
          </button>
        </div>
      )}
    </div>
  )
}

export default User
