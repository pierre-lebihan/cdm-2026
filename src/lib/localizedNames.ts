import type { LanguageCode } from './i18n'

interface LocalizedName {
  fr: string
  en: string
  mk: string
  eu: string
}

const competitionNamesByKey: Record<string, LocalizedName> = {
  pronostics: {
    fr: 'Pronostics',
    en: 'Predictions',
    mk: 'Прогнози',
    eu: 'Iragarpenak',
  },
  'coupe du monde': {
    fr: 'Coupe du Monde',
    en: 'World Cup',
    mk: 'Светско првенство',
    eu: 'Mundiala',
  },
  'coupe du monde 2026': {
    fr: 'Coupe du Monde 2026',
    en: '2026 World Cup',
    mk: 'Светско првенство 2026',
    eu: '2026ko Mundiala',
  },
  'ligue des champions': {
    fr: 'Ligue des champions',
    en: 'Champions League',
    mk: 'Лига на шампиони',
    eu: 'Txapeldunen Liga',
  },
  'ligue des champions 2024-25': {
    fr: 'Ligue des champions 2024-25',
    en: 'Champions League 2024-25',
    mk: 'Лига на шампиони 2024-25',
    eu: 'Txapeldunen Liga 2024-25',
  },
}

const footballRegionNamesByCode: Record<string, LocalizedName> = {
  ar: {
    fr: 'Argentine',
    en: 'Argentina',
    mk: 'Аргентина',
    eu: 'Argentina',
  },
  at: {
    fr: 'Autriche',
    en: 'Austria',
    mk: 'Австрија',
    eu: 'Austria',
  },
  au: {
    fr: 'Australie',
    en: 'Australia',
    mk: 'Австралија',
    eu: 'Australia',
  },
  ba: {
    fr: 'Bosnie-Herzégovine',
    en: 'Bosnia & Herzegovina',
    mk: 'Босна и Херцеговина',
    eu: 'Bosnia eta Herzegovina',
  },
  be: {
    fr: 'Belgique',
    en: 'Belgium',
    mk: 'Белгија',
    eu: 'Belgika',
  },
  br: {
    fr: 'Brésil',
    en: 'Brazil',
    mk: 'Бразил',
    eu: 'Brasil',
  },
  ca: {
    fr: 'Canada',
    en: 'Canada',
    mk: 'Канада',
    eu: 'Kanada',
  },
  cd: {
    fr: 'RD Congo',
    en: 'Congo - Kinshasa',
    mk: 'Конго - Киншаса',
    eu: 'Kongo - Kinshasa',
  },
  ch: {
    fr: 'Suisse',
    en: 'Switzerland',
    mk: 'Швајцарија',
    eu: 'Suitza',
  },
  ci: {
    fr: "Côte d'Ivoire",
    en: 'Côte d’Ivoire',
    mk: 'Брегот на Слоновата Коска',
    eu: 'Boli Kosta',
  },
  co: {
    fr: 'Colombie',
    en: 'Colombia',
    mk: 'Колумбија',
    eu: 'Kolonbia',
  },
  cv: {
    fr: 'Cap-Vert',
    en: 'Cape Verde',
    mk: 'Кабо Верде',
    eu: 'Cabo Verde',
  },
  cw: {
    fr: 'Curaçao',
    en: 'Curaçao',
    mk: 'Курасао',
    eu: 'Curaçao',
  },
  cz: {
    fr: 'République tchèque',
    en: 'Czechia',
    mk: 'Чешка',
    eu: 'Txekia',
  },
  de: {
    fr: 'Allemagne',
    en: 'Germany',
    mk: 'Германија',
    eu: 'Alemania',
  },
  dz: {
    fr: 'Algérie',
    en: 'Algeria',
    mk: 'Алжир',
    eu: 'Aljeria',
  },
  ec: {
    fr: 'Equateur',
    en: 'Ecuador',
    mk: 'Еквадор',
    eu: 'Ekuador',
  },
  eg: {
    fr: 'Égypte',
    en: 'Egypt',
    mk: 'Египет',
    eu: 'Egipto',
  },
  es: {
    fr: 'Espagne',
    en: 'Spain',
    mk: 'Шпанија',
    eu: 'Espainia',
  },
  fr: {
    fr: 'France',
    en: 'France',
    mk: 'Франција',
    eu: 'Frantzia',
  },
  'gb-eng': {
    fr: 'Angleterre',
    en: 'England',
    mk: 'Англија',
    eu: 'Ingalaterra',
  },
  'gb-nir': {
    fr: 'Irlande du Nord',
    en: 'Northern Ireland',
    mk: 'Северна Ирска',
    eu: 'Ipar Irlanda',
  },
  'gb-sct': {
    fr: 'Écosse',
    en: 'Scotland',
    mk: 'Шкотска',
    eu: 'Eskozia',
  },
  'gb-wls': {
    fr: 'Pays de Galles',
    en: 'Wales',
    mk: 'Велс',
    eu: 'Gales',
  },
  gh: {
    fr: 'Ghana',
    en: 'Ghana',
    mk: 'Гана',
    eu: 'Ghana',
  },
  hr: {
    fr: 'Croatie',
    en: 'Croatia',
    mk: 'Хрватска',
    eu: 'Kroazia',
  },
  ht: {
    fr: 'Haïti',
    en: 'Haiti',
    mk: 'Хаити',
    eu: 'Haiti',
  },
  iq: {
    fr: 'Irak',
    en: 'Iraq',
    mk: 'Ирак',
    eu: 'Irak',
  },
  ir: {
    fr: 'Iran',
    en: 'Iran',
    mk: 'Иран',
    eu: 'Iran',
  },
  it: {
    fr: 'Italie',
    en: 'Italy',
    mk: 'Италија',
    eu: 'Italia',
  },
  jo: {
    fr: 'Jordanie',
    en: 'Jordan',
    mk: 'Јордан',
    eu: 'Jordania',
  },
  jp: {
    fr: 'Japon',
    en: 'Japan',
    mk: 'Јапонија',
    eu: 'Japonia',
  },
  kr: {
    fr: 'Corée du Sud',
    en: 'South Korea',
    mk: 'Јужна Кореја',
    eu: 'Hego Korea',
  },
  ma: {
    fr: 'Maroc',
    en: 'Morocco',
    mk: 'Мароко',
    eu: 'Maroko',
  },
  mx: {
    fr: 'Mexique',
    en: 'Mexico',
    mk: 'Мексико',
    eu: 'Mexiko',
  },
  nl: {
    fr: 'Pays-Bas',
    en: 'Netherlands',
    mk: 'Холандија',
    eu: 'Herbehereak',
  },
  no: {
    fr: 'Norvège',
    en: 'Norway',
    mk: 'Норвешка',
    eu: 'Norvegia',
  },
  nz: {
    fr: 'Nouvelle-Zélande',
    en: 'New Zealand',
    mk: 'Нов Зеланд',
    eu: 'Zeelanda Berria',
  },
  pa: {
    fr: 'Panama',
    en: 'Panama',
    mk: 'Панама',
    eu: 'Panama',
  },
  pt: {
    fr: 'Portugal',
    en: 'Portugal',
    mk: 'Португалија',
    eu: 'Portugal',
  },
  py: {
    fr: 'Paraguay',
    en: 'Paraguay',
    mk: 'Парагвај',
    eu: 'Paraguai',
  },
  qa: {
    fr: 'Qatar',
    en: 'Qatar',
    mk: 'Катар',
    eu: 'Qatar',
  },
  sa: {
    fr: 'Arabie Saoudite',
    en: 'Saudi Arabia',
    mk: 'Саудиска Арабија',
    eu: 'Arabia Saudita',
  },
  se: {
    fr: 'Suède',
    en: 'Sweden',
    mk: 'Шведска',
    eu: 'Suedia',
  },
  sn: {
    fr: 'Sénégal',
    en: 'Senegal',
    mk: 'Сенегал',
    eu: 'Senegal',
  },
  tbd: {
    fr: 'À déterminer',
    en: 'To be decided',
    mk: 'Ќе се одреди',
    eu: 'Zehazteke',
  },
  tn: {
    fr: 'Tunisie',
    en: 'Tunisia',
    mk: 'Тунис',
    eu: 'Tunisia',
  },
  tr: {
    fr: 'Turquie',
    en: 'Türkiye',
    mk: 'Турција',
    eu: 'Turkia',
  },
  us: {
    fr: 'États-Unis',
    en: 'United States',
    mk: 'Соединети Американски Држави',
    eu: 'Estatu Batuak',
  },
  uy: {
    fr: 'Uruguay',
    en: 'Uruguay',
    mk: 'Уругвај',
    eu: 'Uruguai',
  },
  uz: {
    fr: 'Ouzbékistan',
    en: 'Uzbekistan',
    mk: 'Узбекистан',
    eu: 'Uzbekistan',
  },
  xk: {
    fr: 'Kosovo',
    en: 'Kosovo',
    mk: 'Косово',
    eu: 'Kosovo',
  },
  za: {
    fr: 'Afrique du Sud',
    en: 'South Africa',
    mk: 'Јужноафриканска Република',
    eu: 'Hego Afrika',
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
