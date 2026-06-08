import type { LanguageCode } from './i18n'

interface LocalizedName {
  fr: string
  en: string
  mk: string
}

const competitionNamesByKey: Record<string, LocalizedName> = {
  pronostics: {
    fr: 'Pronostics',
    en: 'Predictions',
    mk: 'Прогнози',
  },
  'coupe du monde': {
    fr: 'Coupe du Monde',
    en: 'World Cup',
    mk: 'Светско првенство',
  },
  'coupe du monde 2026': {
    fr: 'Coupe du Monde 2026',
    en: '2026 World Cup',
    mk: 'Светско првенство 2026',
  },
  'ligue des champions': {
    fr: 'Ligue des champions',
    en: 'Champions League',
    mk: 'Лига на шампиони',
  },
  'ligue des champions 2024-25': {
    fr: 'Ligue des champions 2024-25',
    en: 'Champions League 2024-25',
    mk: 'Лига на шампиони 2024-25',
  },
}

const footballRegionNamesByCode: Record<string, LocalizedName> = {
  'gb-eng': {
    fr: 'Angleterre',
    en: 'England',
    mk: 'Англија',
  },
  'gb-nir': {
    fr: 'Irlande du Nord',
    en: 'Northern Ireland',
    mk: 'Северна Ирска',
  },
  'gb-sct': {
    fr: 'Écosse',
    en: 'Scotland',
    mk: 'Шкотска',
  },
  'gb-wls': {
    fr: 'Pays de Galles',
    en: 'Wales',
    mk: 'Велс',
  },
  tbd: {
    fr: 'À déterminer',
    en: 'To be decided',
    mk: 'Ќе се одреди',
  },
  xk: {
    fr: 'Kosovo',
    en: 'Kosovo',
    mk: 'Косово',
  },
}

function normalizeNameKey(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function normalizedText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''

  if (trimmed === '') {
    return null
  }

  return trimmed
}

function getLocalizedEntryName(
  entry: LocalizedName,
  language: LanguageCode,
): string {
  const translated = entry[language].trim()

  if (translated !== '') {
    return translated
  }

  return entry.fr
}

function normalizeCountryCode(code: string | null | undefined): string | null {
  const normalized = code?.trim().toLowerCase() ?? ''

  if (normalized === '') {
    return null
  }

  return normalized
}

function getIsoRegionCode(countryCode: string): string | null {
  const upperCode = countryCode.toUpperCase()

  if (/^[A-Z]{2}$/.test(upperCode)) {
    return upperCode
  }

  return null
}

function getIntlRegionName(
  regionCode: string,
  localeCode: string,
): string | null {
  try {
    const displayNames = new Intl.DisplayNames([localeCode, 'fr-FR'], {
      type: 'region',
    })
    const regionName = displayNames.of(regionCode)
    return normalizedText(regionName)
  } catch {
    return null
  }
}

export function isGenericCompetitionName(
  name: string | null | undefined,
): boolean {
  const normalized = normalizedText(name)

  if (!normalized) {
    return true
  }

  const key = normalizeNameKey(normalized)
  return key === 'pronostics' || key === 'predictions' || key === 'прогнози'
}

export function getLocalizedCompetitionName(
  name: string | null | undefined,
  language: LanguageCode,
): string {
  const fallbackName = normalizedText(name) ?? 'Pronostics'
  const key = normalizeNameKey(fallbackName)
  const translated = competitionNamesByKey[key]

  if (translated) {
    return getLocalizedEntryName(translated, language)
  }

  return fallbackName
}

export function getLocalizedCountryName(
  code: string | null | undefined,
  fallbackName: string | null | undefined,
  language: LanguageCode,
  localeCode: string,
): string | null {
  const fallback = normalizedText(fallbackName)
  const countryCode = normalizeCountryCode(code)

  if (!countryCode) {
    return fallback
  }

  const footballRegionName = footballRegionNamesByCode[countryCode]

  if (footballRegionName) {
    return getLocalizedEntryName(footballRegionName, language)
  }

  const isoRegionCode = getIsoRegionCode(countryCode)

  if (!isoRegionCode) {
    return fallback
  }

  if (language === 'fr' && fallback) {
    return fallback
  }

  return getIntlRegionName(isoRegionCode, localeCode) ?? fallback
}
