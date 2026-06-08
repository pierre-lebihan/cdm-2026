import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { LanguageCode } from '../lib/i18n'
import { getLocalizedCompetitionName } from '../lib/localizedNames'

const SITE_NAME = 'Make Prono Great Again'
const SITE_URL = 'https://makepronogreatagain.bzh'
const DEFAULT_COMPETITION_NAME = 'Coupe du Monde 2026'
const SOCIAL_IMAGE_URL = `${SITE_URL}/og-image.png`

const ogLocalesByLanguage: Record<LanguageCode, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  mk: 'mk_MK',
}

type StaticRouteSeo = {
  title: string
  description: string
  canonicalPath: string
}

type SeoState = StaticRouteSeo & {
  robots: string
}

const STATIC_ROUTE_SEO: Record<string, StaticRouteSeo> = {
  '/rules': {
    title: `Règles du jeu · ${SITE_NAME}`,
    description:
      'Découvrez les règles des pronostics, les tribus, les bonus et le fonctionnement du jeu Make Prono Great Again.',
    canonicalPath: '/rules/',
  },
  '/rules/algorithm': {
    title: `Algorithme des points · ${SITE_NAME}`,
    description:
      'Consultez le règlement détaillé des points, la popularité des pronostics et les exemples de calcul des scores.',
    canonicalPath: '/rules/algorithm/',
  },
  '/faq': {
    title: `Questions fréquentes · ${SITE_NAME}`,
    description:
      'Retrouvez les réponses aux questions fréquentes sur Make Prono Great Again, les tribus, les pronostics et les données.',
    canonicalPath: '/faq/',
  },
  '/legal': {
    title: `Confidentialité et conditions · ${SITE_NAME}`,
    description:
      "Consultez la politique de confidentialité et les conditions d'utilisation de Make Prono Great Again.",
    canonicalPath: '/legal/',
  },
}

const PRIVATE_ROUTE_SEO: SeoState = {
  title: SITE_NAME,
  description:
    'Connectez-vous à Make Prono Great Again pour gérer vos pronostics et votre tribu.',
  canonicalPath: '/',
  robots: 'noindex, nofollow',
}

const NOT_FOUND_SEO: SeoState = {
  title: `Page introuvable · ${SITE_NAME}`,
  description:
    'Cette page Make Prono Great Again est introuvable. Retournez à l’accueil pour rejoindre le jeu.',
  canonicalPath: '/',
  robots: 'noindex, nofollow',
}

function getCompetitionName(
  name: string | null | undefined,
  language: LanguageCode,
): string {
  const fallbackName = name?.trim() || DEFAULT_COMPETITION_NAME
  return getLocalizedCompetitionName(fallbackName, language)
}

function normalizePathname(pathname: string): string {
  const withoutTrailingSlashes = pathname.replace(/\/+$/, '')

  if (withoutTrailingSlashes === '') {
    return '/'
  }

  return withoutTrailingSlashes
}

function getHomeSeo(competitionName: string): SeoState {
  return {
    title: `${competitionName} · ${SITE_NAME}`,
    description: `Pronostiquez les matches de ${competitionName} entre amis, créez votre tribu et suivez le classement en temps réel.`,
    canonicalPath: '/',
    robots: 'index, follow',
  }
}

function getRouteSeo(pathname: string, competitionName: string): SeoState {
  const normalizedPathname = normalizePathname(pathname)

  if (normalizedPathname === '/') {
    return getHomeSeo(competitionName)
  }

  const staticRouteSeo = STATIC_ROUTE_SEO[normalizedPathname]

  if (staticRouteSeo) {
    return {
      ...staticRouteSeo,
      robots: 'index, follow',
    }
  }

  if (normalizedPathname.startsWith('/auth/')) {
    return PRIVATE_ROUTE_SEO
  }

  return NOT_FOUND_SEO
}

function getCanonicalUrl(canonicalPath: string): string {
  if (canonicalPath === '/') {
    return `${SITE_URL}/`
  }

  return `${SITE_URL}${canonicalPath}`
}

function ensureMetaByName(name: string): HTMLMetaElement {
  const existingElement = document.querySelector(`meta[name="${name}"]`)

  if (existingElement instanceof HTMLMetaElement) {
    return existingElement
  }

  const metaElement = document.createElement('meta')
  metaElement.setAttribute('name', name)
  document.head.appendChild(metaElement)

  return metaElement
}

function ensureMetaByProperty(property: string): HTMLMetaElement {
  const existingElement = document.querySelector(`meta[property="${property}"]`)

  if (existingElement instanceof HTMLMetaElement) {
    return existingElement
  }

  const metaElement = document.createElement('meta')
  metaElement.setAttribute('property', property)
  document.head.appendChild(metaElement)

  return metaElement
}

function ensureCanonicalLink(): HTMLLinkElement {
  const existingElement = document.querySelector('link[rel="canonical"]')

  if (existingElement instanceof HTMLLinkElement) {
    return existingElement
  }

  const linkElement = document.createElement('link')
  linkElement.rel = 'canonical'
  document.head.appendChild(linkElement)

  return linkElement
}

function updateSeoMetadata(seoState: SeoState, ogLocale: string): void {
  const canonicalUrl = getCanonicalUrl(seoState.canonicalPath)

  document.title = seoState.title
  ensureCanonicalLink().href = canonicalUrl
  ensureMetaByName('description').content = seoState.description
  ensureMetaByName('robots').content = seoState.robots
  ensureMetaByProperty('og:title').content = seoState.title
  ensureMetaByProperty('og:description').content = seoState.description
  ensureMetaByProperty('og:url').content = canonicalUrl
  ensureMetaByProperty('og:type').content = 'website'
  ensureMetaByProperty('og:locale').content = ogLocale
  ensureMetaByProperty('og:image').content = SOCIAL_IMAGE_URL
  ensureMetaByName('twitter:card').content = 'summary_large_image'
  ensureMetaByName('twitter:title').content = seoState.title
  ensureMetaByName('twitter:description').content = seoState.description
  ensureMetaByName('twitter:image').content = SOCIAL_IMAGE_URL
}

function SeoMetadata() {
  const location = useLocation()
  const { competition, loading } = useCompetition()
  const { language } = useLanguage()

  useEffect(() => {
    if (loading) {
      return
    }

    const competitionName = getCompetitionName(competition?.name, language)
    const seoState = getRouteSeo(location.pathname, competitionName)
    updateSeoMetadata(seoState, ogLocalesByLanguage[language])
  }, [competition?.name, language, loading, location.pathname])

  return null
}

export default SeoMetadata
