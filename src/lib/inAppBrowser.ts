// Detection of in-app browsers (webviews embedded inside apps like Messenger,
// Instagram, Facebook...). Google blocks OAuth inside these webviews with the
// error "disallowed_useragent", so we warn the user and invite them to open the
// app in their real browser (Safari / Chrome) or to sign in with email instead.

const IN_APP_BROWSER_TOKENS = [
  'FBAN',
  'FBAV',
  'FB_IAB',
  'FBIOS',
  'Messenger',
  'Instagram',
  'Line/',
  'Twitter',
  'Snapchat',
  'WhatsApp',
  'TikTok',
  'musical_ly',
  'Pinterest',
  'LinkedInApp',
]

function hasInAppBrowserToken(userAgent: string): boolean {
  return IN_APP_BROWSER_TOKENS.some((token) => userAgent.includes(token))
}

function isAndroidWebView(userAgent: string): boolean {
  return userAgent.includes('Android') && userAgent.includes('; wv)')
}

function getUserAgent(): string {
  if (typeof navigator === 'undefined') {
    return ''
  }

  return navigator.userAgent || ''
}

export function isInAppBrowser(): boolean {
  const userAgent = getUserAgent()

  return hasInAppBrowserToken(userAgent) || isAndroidWebView(userAgent)
}

export function getInAppBrowserName(): string | null {
  const userAgent = getUserAgent()

  if (userAgent.includes('Messenger')) {
    return 'Messenger'
  }

  if (userAgent.includes('Instagram')) {
    return 'Instagram'
  }

  if (
    userAgent.includes('FBAN') ||
    userAgent.includes('FBAV') ||
    userAgent.includes('FB_IAB') ||
    userAgent.includes('FBIOS')
  ) {
    return 'Facebook'
  }

  if (userAgent.includes('WhatsApp')) {
    return 'WhatsApp'
  }

  if (userAgent.includes('Snapchat')) {
    return 'Snapchat'
  }

  if (userAgent.includes('TikTok') || userAgent.includes('musical_ly')) {
    return 'TikTok'
  }

  return null
}

export function isIosDevice(): boolean {
  const userAgent = getUserAgent()

  return /iPhone|iPad|iPod/.test(userAgent)
}
