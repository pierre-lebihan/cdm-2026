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

export function hideCrispChat() {
  pushCrispCommand(['do', 'chat:hide'])
}

export function showCrispChat() {
  pushCrispCommand(['do', 'chat:show'])
}
