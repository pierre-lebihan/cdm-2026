import { MASCOTS, type MascotId } from '../lib/mascots'

type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<MascotSize, string> = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-40 h-40',
}

interface MascotProps {
  id: MascotId
  size?: MascotSize
  className?: string
}

const Mascot = ({ id, size = 'md', className = '' }: MascotProps) => {
  const mascot = MASCOTS[id]
  return (
    <img
      src={mascot.src}
      alt={`Mascotte ${mascot.name}`}
      className={`${sizeClasses[size]} object-contain rounded-full select-none ${className}`}
      draggable={false}
    />
  )
}

export default Mascot
