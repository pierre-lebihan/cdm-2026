import cartoonUSA from '../assets/icons/cartoon-USA.png'
import cartoonMexicain from '../assets/icons/cartoon-mexicain.png'
import cartoonCanadien from '../assets/icons/cartoon-canadien.png'

export type MascotId = 'usa' | 'mexico' | 'canada'

export interface MascotInfo {
  id: MascotId
  name: string
  src: string
  accent: string
  bg: string
}

export const MASCOTS: Record<MascotId, MascotInfo> = {
  usa: {
    id: 'usa',
    name: 'Sam',
    src: cartoonUSA,
    accent: 'text-red-600',
    bg: 'bg-red-50',
  },
  mexico: {
    id: 'mexico',
    name: 'Iván',
    src: cartoonMexicain,
    accent: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  canada: {
    id: 'canada',
    name: 'Pierre',
    src: cartoonCanadien,
    accent: 'text-amber-700',
    bg: 'bg-amber-50',
  },
}

export const MASCOT_LIST: MascotInfo[] = [
  MASCOTS.usa,
  MASCOTS.mexico,
  MASCOTS.canada,
]
