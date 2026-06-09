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
  ar: {
    fr: 'Argentine',
    en: 'Argentina',
    mk: 'Аргентина',
  },
  at: {
    fr: 'Autriche',
    en: 'Austria',
    mk: 'Австрија',
  },
  au: {
    fr: 'Australie',
    en: 'Australia',
    mk: 'Австралија',
  },
  ba: {
    fr: 'Bosnie-Herzégovine',
    en: 'Bosnia & Herzegovina',
    mk: 'Босна и Херцеговина',
  },
  be: {
    fr: 'Belgique',
    en: 'Belgium',
    mk: 'Белгија',
  },
  br: {
    fr: 'Brésil',
    en: 'Brazil',
    mk: 'Бразил',
  },
  ca: {
    fr: 'Canada',
    en: 'Canada',
    mk: 'Канада',
  },
  cd: {
    fr: 'RD Congo',
    en: 'Congo - Kinshasa',
    mk: 'Конго - Киншаса',
  },
  ch: {
    fr: 'Suisse',
    en: 'Switzerland',
    mk: 'Швајцарија',
  },
  ci: {
    fr: "Côte d'Ivoire",
    en: 'Côte d’Ivoire',
    mk: 'Брегот на Слоновата Коска',
  },
  co: {
    fr: 'Colombie',
    en: 'Colombia',
    mk: 'Колумбија',
  },
  cv: {
    fr: 'Cap-Vert',
    en: 'Cape Verde',
    mk: 'Кабо Верде',
  },
  cw: {
    fr: 'Curaçao',
    en: 'Curaçao',
    mk: 'Курасао',
  },
  cz: {
    fr: 'République tchèque',
    en: 'Czechia',
    mk: 'Чешка',
  },
  de: {
    fr: 'Allemagne',
    en: 'Germany',
    mk: 'Германија',
  },
  dz: {
    fr: 'Algérie',
    en: 'Algeria',
    mk: 'Алжир',
  },
  ec: {
    fr: 'Equateur',
    en: 'Ecuador',
    mk: 'Еквадор',
  },
  eg: {
    fr: 'Égypte',
    en: 'Egypt',
    mk: 'Египет',
  },
  es: {
    fr: 'Espagne',
    en: 'Spain',
    mk: 'Шпанија',
  },
  fr: {
    fr: 'France',
    en: 'France',
    mk: 'Франција',
  },
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
  gh: {
    fr: 'Ghana',
    en: 'Ghana',
    mk: 'Гана',
  },
  hr: {
    fr: 'Croatie',
    en: 'Croatia',
    mk: 'Хрватска',
  },
  ht: {
    fr: 'Haïti',
    en: 'Haiti',
    mk: 'Хаити',
  },
  iq: {
    fr: 'Irak',
    en: 'Iraq',
    mk: 'Ирак',
  },
  ir: {
    fr: 'Iran',
    en: 'Iran',
    mk: 'Иран',
  },
  it: {
    fr: 'Italie',
    en: 'Italy',
    mk: 'Италија',
  },
  jo: {
    fr: 'Jordanie',
    en: 'Jordan',
    mk: 'Јордан',
  },
  jp: {
    fr: 'Japon',
    en: 'Japan',
    mk: 'Јапонија',
  },
  kr: {
    fr: 'Corée du Sud',
    en: 'South Korea',
    mk: 'Јужна Кореја',
  },
  ma: {
    fr: 'Maroc',
    en: 'Morocco',
    mk: 'Мароко',
  },
  mx: {
    fr: 'Mexique',
    en: 'Mexico',
    mk: 'Мексико',
  },
  nl: {
    fr: 'Pays-Bas',
    en: 'Netherlands',
    mk: 'Холандија',
  },
  no: {
    fr: 'Norvège',
    en: 'Norway',
    mk: 'Норвешка',
  },
  nz: {
    fr: 'Nouvelle-Zélande',
    en: 'New Zealand',
    mk: 'Нов Зеланд',
  },
  pa: {
    fr: 'Panama',
    en: 'Panama',
    mk: 'Панама',
  },
  pt: {
    fr: 'Portugal',
    en: 'Portugal',
    mk: 'Португалија',
  },
  py: {
    fr: 'Paraguay',
    en: 'Paraguay',
    mk: 'Парагвај',
  },
  qa: {
    fr: 'Qatar',
    en: 'Qatar',
    mk: 'Катар',
  },
  sa: {
    fr: 'Arabie Saoudite',
    en: 'Saudi Arabia',
    mk: 'Саудиска Арабија',
  },
  se: {
    fr: 'Suède',
    en: 'Sweden',
    mk: 'Шведска',
  },
  sn: {
    fr: 'Sénégal',
    en: 'Senegal',
    mk: 'Сенегал',
  },
  tbd: {
    fr: 'À déterminer',
    en: 'To be decided',
    mk: 'Ќе се одреди',
  },
  tn: {
    fr: 'Tunisie',
    en: 'Tunisia',
    mk: 'Тунис',
  },
  tr: {
    fr: 'Turquie',
    en: 'Türkiye',
    mk: 'Турција',
  },
  us: {
    fr: 'États-Unis',
    en: 'United States',
    mk: 'Соединети Американски Држави',
  },
  uy: {
    fr: 'Uruguay',
    en: 'Uruguay',
    mk: 'Уругвај',
  },
  uz: {
    fr: 'Ouzbékistan',
    en: 'Uzbekistan',
    mk: 'Узбекистан',
  },
  xk: {
    fr: 'Kosovo',
    en: 'Kosovo',
    mk: 'Косово',
  },
  za: {
    fr: 'Afrique du Sud',
    en: 'South Africa',
    mk: 'Јужноафриканска Република',
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
