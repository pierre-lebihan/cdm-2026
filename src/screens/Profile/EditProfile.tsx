import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Camera, Check, Pencil, X } from 'lucide-react'
import { useSaveProfile, useUploadAvatar } from '../../hooks/user'
import { compressAvatarImage } from '../../lib/imageCompression'

const MAX_INPUT_BYTES = 15 * 1024 * 1024

function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const EditProfile = ({
  displayName,
  photoURL,
  email,
}: {
  displayName: string
  photoURL: string
  email: string
}) => {
  const saveProfile = useSaveProfile()
  const uploadAvatar = useUploadAvatar()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(displayName)
  const [savingName, setSavingName] = useState(false)
  const [uploading, setUploading] = useState(false)

  const trimmed = name.trim()
  const isNameValid =
    trimmed.length >= 2 && trimmed.length <= 20 && trimmed !== displayName

  const handleSaveName = async () => {
    if (!isNameValid || savingName) return
    setSavingName(true)
    try {
      await saveProfile({ display_name: trimmed })
      toast.success('Nom mis à jour')
      setEditingName(false)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la mise à jour du nom')
    } finally {
      setSavingName(false)
    }
  }

  const handleCancelName = () => {
    setName(displayName)
    setEditingName(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Format de fichier non supporté')
      return
    }

    if (file.size > MAX_INPUT_BYTES) {
      toast.error('Image trop lourde (15 Mo max)')
      return
    }

    setUploading(true)
    try {
      const compressed = await compressAvatarImage(file)
      const url = await uploadAvatar(compressed)
      await saveProfile({ avatar_url: url })
      toast.success('Photo mise à jour')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la mise à jour de la photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card text-center">
      <div className="relative inline-block mb-3">
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="w-[72px] h-[72px] rounded-full object-cover overflow-hidden"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-500 overflow-hidden">
            {getInitials(displayName)}
          </div>
        )}
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-navy text-cream flex items-center justify-center shadow-card hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Changer la photo"
          aria-label="Changer la photo de profil"
        >
          <Camera size={14} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploading && (
        <p className="text-xs text-gray-400 m-0 mb-2">
          Compression et envoi de la photo…
        </p>
      )}

      {editingName ? (
        <div className="flex items-center justify-center gap-2 mb-1">
          <input
            autoFocus
            className="py-1.5 px-2.5 border-[1.5px] border-gray-200 rounded-[8px] text-sm outline-none transition-colors bg-white focus:border-indigo-500 text-center"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName()
              if (e.key === 'Escape') handleCancelName()
            }}
          />
          <button
            type="button"
            onClick={handleSaveName}
            disabled={!isNameValid || savingName}
            className="p-1.5 rounded-md text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Enregistrer"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={handleCancelName}
            disabled={savingName}
            className="p-1.5 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300"
            title="Annuler"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-navy m-0">{displayName}</h2>
          <button
            type="button"
            onClick={() => {
              setName(displayName)
              setEditingName(true)
            }}
            className="p-1 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
            title="Renommer"
            aria-label="Renommer"
          >
            <Pencil size={14} />
          </button>
        </div>
      )}

      <p className="text-sm text-gray-400 m-0">{email}</p>
    </div>
  )
}

export default EditProfile
