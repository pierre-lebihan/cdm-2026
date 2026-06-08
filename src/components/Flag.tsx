import { memo, type CSSProperties } from 'react'
import Tooltip from './Tooltip'

interface FlagProps {
  country?: string
  tooltipText?: string
  className?: string
  style?: CSSProperties
}

const svgModules = import.meta.glob('../assets/flags/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const pngModules = import.meta.glob('../assets/flags/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function flagKeyFromPath(path: string, extension: string): string | null {
  const file = path.split('/').pop()
  if (!file || !file.endsWith(extension)) {
    return null
  }
  return file.slice(0, -extension.length).toLowerCase()
}

function buildFlagUrlByCode(): Record<string, string> {
  const byCode: Record<string, string> = {}
  for (const [path, url] of Object.entries(svgModules)) {
    const key = flagKeyFromPath(path, '.svg')
    if (key) {
      byCode[key] = url
    }
  }
  for (const [path, url] of Object.entries(pngModules)) {
    const key = flagKeyFromPath(path, '.png')
    if (key) {
      byCode[key] = url
    }
  }
  return byCode
}

const flagUrlByCode = buildFlagUrlByCode()

function getFlagSrc(country: string): string | undefined {
  return flagUrlByCode[country.toLowerCase().trim()]
}

const Flag = memo<FlagProps>(({ country, tooltipText, className, style }) => {
  if (!country) return <FlagPlaceholder className={className} style={style} />

  const flag = getFlagSrc(country)
  if (!flag) return <FlagPlaceholder className={className} style={style} />

  const imgElement = (
    <img src={flag} alt={country} className={className} style={style} />
  )

  if (tooltipText) {
    return <Tooltip content={tooltipText}>{imgElement}</Tooltip>
  }

  return imgElement
})

const FlagPlaceholder = memo<{ className?: string; style?: CSSProperties }>(
  ({ className, style }) => (
    <div
      className={`flex items-center justify-center rounded-lg overflow-hidden ${className ?? ''}`}
      style={{
        ...style,
        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    </div>
  ),
)

Flag.displayName = 'Flag'
FlagPlaceholder.displayName = 'FlagPlaceholder'

export default Flag
