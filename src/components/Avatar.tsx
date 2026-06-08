interface InlineAvatarProps {
  avatarUrl?: string
  displayName?: string
  size?: number
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const InlineAvatar = ({
  avatarUrl,
  displayName,
  size = 32,
}: InlineAvatarProps) => (
  <div className="flex items-center">
    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt={displayName || ''}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    ) : (
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-500"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials(displayName)}
      </div>
    )}
    {displayName && (
      <span className="ml-2 text-sm font-semibold text-navy">
        {displayName}
      </span>
    )}
  </div>
)

export default InlineAvatar
