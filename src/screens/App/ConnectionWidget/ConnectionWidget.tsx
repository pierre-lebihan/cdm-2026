import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { useIsUserConnected } from '../../../hooks/user'
import ConnectionModal from '../ConnectionModal'
import User from './User'
import { captureEvent } from '../../../lib/posthog'
import { useLanguage } from '../../../contexts/LanguageContext'

function handleDialogBackdropClick(
  e: React.MouseEvent<HTMLDialogElement>,
  onClose: () => void,
) {
  if (e.target === e.currentTarget) {
    onClose()
  }
}

const ConnectionWidget = () => {
  const isConnected = useIsUserConnected()
  const { t } = useLanguage()
  const [modalOpened, setModalOpened] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isConnected && modalOpened) {
      setModalOpened(false)
    }
  }, [isConnected, modalOpened])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (modalOpened) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [modalOpened])

  const closeModalRef = useRef<() => void>(() => {})
  closeModalRef.current = () => {
    captureEvent('auth_modal_closed')
    setModalOpened(false)
  }

  const handleRequestCloseModal = () => {
    setModalOpened(false)
  }

  const handleOpenModal = () => {
    captureEvent('auth_modal_opened')
    setModalOpened(true)
  }

  return (
    <>
      {createPortal(
        <dialog
          ref={dialogRef}
          className="fixed inset-0 m-auto w-[90vw] max-w-sm rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/40"
          onClose={() => closeModalRef.current?.()}
          onClick={(e) => handleDialogBackdropClick(e, handleRequestCloseModal)}
        >
          <ConnectionModal />
        </dialog>,
        document.body,
      )}

      {isConnected ? (
        <User />
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-2 font-semibold rounded-full border-none cursor-pointer transition-all duration-150 bg-navy text-white py-1.5 px-4 text-xs hover:bg-navy-light"
          onClick={handleOpenModal}
        >
          {t.common.connection}
        </button>
      )}
    </>
  )
}

export default ConnectionWidget
