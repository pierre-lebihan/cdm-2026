import imageCompression from 'browser-image-compression'

const AVATAR_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 512,
  useWebWorker: true,
  fileType: 'image/webp' as const,
}

export async function compressAvatarImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, AVATAR_COMPRESSION_OPTIONS)
  return new File([compressed], file.name.replace(/\.\w+$/, '.webp'), {
    type: 'image/webp',
  })
}
