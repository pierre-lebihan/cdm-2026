function pushCrispCommand(args: unknown[]) {
  if (typeof window === 'undefined') {
    return
  }
  if (!window.$crisp) {
    window.$crisp = []
  }
  window.$crisp.push(args)
}

export function syncCrispUser(opts: {
  email: string | null
  nickname: string | null
}) {
  if (!opts.email) {
    pushCrispCommand(['do', 'session:reset'])
    return
  }
  pushCrispCommand(['set', 'user:email', [opts.email]])
  if (opts.nickname) {
    pushCrispCommand(['set', 'user:nickname', [opts.nickname]])
  }
}

const CRISP_HIDE_STYLE_ID = 'crisp-hide-style'

export function setCrispChatVisible(visible: boolean) {
  if (typeof document === 'undefined') {
    return
  }

  const existing = document.getElementById(CRISP_HIDE_STYLE_ID)

  if (visible) {
    if (existing) {
      existing.remove()
    }
    return
  }

  if (existing) {
    return
  }

  const style = document.createElement('style')
  style.id = CRISP_HIDE_STYLE_ID
  style.textContent = '#crisp-chatbox { display: none !important; }'
  document.head.appendChild(style)
}
