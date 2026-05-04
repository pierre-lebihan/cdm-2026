/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_BUILD_ID__: string

interface ImportMetaEnv {
  readonly VITE_ONESIGNAL_APP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  $crisp?: unknown[]
  CRISP_WEBSITE_ID?: string
}
