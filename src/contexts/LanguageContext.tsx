import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  dateLocales,
  languageOptionsByCode,
  translations,
  type LanguageCode,
  type TranslationDictionary,
} from '../lib/i18n'
import type { Locale } from 'date-fns'

const LANGUAGE_STORAGE_KEY = 'mpga-language'
const DEFAULT_LANGUAGE: LanguageCode = 'fr'

interface LanguageContextValue {
  dateLocale: Locale
  language: LanguageCode
  localeCode: string
  setLanguage: Dispatch<SetStateAction<LanguageCode>>
  t: TranslationDictionary
}

interface LanguageProviderProps {
  children: ReactNode
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === 'fr' || value === 'en' || value === 'mk' || value === 'eu'
}

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isLanguageCode(storedLanguage)) {
      return storedLanguage
    }
  } catch {
    return DEFAULT_LANGUAGE
  }

  return DEFAULT_LANGUAGE
}

function saveLanguage(language: LanguageCode): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    return
  }
}

function syncDocumentLanguage(language: LanguageCode): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = languageOptionsByCode[language].htmlLang
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<LanguageCode>(readStoredLanguage)

  useEffect(() => {
    saveLanguage(language)
    syncDocumentLanguage(language)
  }, [language])

  const dictionary = translations[language]
  const languageOption = languageOptionsByCode[language]
  const dateLocale = dateLocales[language]

  const value = useMemo(() => {
    return {
      dateLocale,
      language,
      localeCode: languageOption.localeCode,
      setLanguage,
      t: dictionary,
    }
  }, [dateLocale, dictionary, language, languageOption.localeCode])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
