import { useEffect } from 'react'
import { setCrispChatVisible } from '../lib/crisp'

let hiddenCount = 0

function incrementHidden() {
  hiddenCount++
  if (hiddenCount === 1) {
    setCrispChatVisible(false)
  }
}

function decrementHidden() {
  hiddenCount--
  if (hiddenCount <= 0) {
    hiddenCount = 0
    setCrispChatVisible(true)
  }
}

export function useHideCrisp(shouldHide: boolean) {
  useEffect(() => {
    if (!shouldHide) {
      return
    }

    incrementHidden()
    return () => {
      decrementHidden()
    }
  }, [shouldHide])
}
