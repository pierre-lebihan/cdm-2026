type LoaderSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<LoaderSize, string> = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
}

const wrapperClasses: Record<'inline' | 'section' | 'page', string> = {
  inline: 'flex flex-col items-center justify-center py-6',
  section: 'flex flex-col items-center justify-center min-h-[40vh]',
  page: 'flex flex-col items-center justify-center min-h-screen',
}

interface LoaderProps {
  label?: string | null
  size?: LoaderSize
  variant?: 'inline' | 'section' | 'page'
}

const Loader = ({
  label = 'Chargement...',
  size = 'md',
  variant = 'section',
}: LoaderProps) => {
  return (
    <div className={wrapperClasses[variant]}>
      <img
        src="/og-image.png"
        alt=""
        className={`${sizeClasses[size]} object-contain animate-pulse`}
      />
      {label ? <p className="mt-3 text-sm text-gray-400">{label}</p> : null}
    </div>
  )
}

export default Loader
