import { Check, ChevronDown } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import {
  languageOptions,
  languageOptionsByCode,
  type LanguageCode,
} from '../lib/i18n'
import Flag from './Flag'

function handleLanguageMenuOutsideClick(
  event: MouseEvent,
  menuRef: RefObject<HTMLDivElement | null>,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  if (
    menuRef.current &&
    event.target instanceof Node &&
    !menuRef.current.contains(event.target)
  ) {
    setOpen(false)
  }
}

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeOption = languageOptionsByCode[language]

  useEffect(() => {
    if (!open) {
      return
    }

    function handleClick(event: MouseEvent) {
      handleLanguageMenuOutsideClick(event, menuRef, setOpen)
    }

    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const handleToggle = () => {
    setOpen(!open)
  }

  const handleSelect = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage)
    setOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label={t.language.selectorLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-navy/10 bg-white/75 px-2 text-xs font-bold text-navy shadow-sm transition-colors hover:bg-white"
        onClick={handleToggle}
      >
        <Flag
          country={activeOption.flagCode}
          className="h-5 w-5 rounded-full object-cover"
        />
        <span className="hidden sm:inline">{activeOption.shortLabel}</span>
        <ChevronDown
          size={14}
          className={`text-navy/50 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
        >
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              role="menuitemradio"
              aria-checked={language === option.code}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => handleSelect(option.code)}
            >
              <Flag
                country={option.flagCode}
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="min-w-0 flex-1">{option.nativeLabel}</span>
              {language === option.code ? (
                <Check size={14} className="text-indigo-500" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default LanguageSelector
