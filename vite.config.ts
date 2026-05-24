import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { PWA_SERVICE_WORKER_FILENAME } from './src/serviceWorkerName'

const APP_VERSION_FILENAME = 'app-version.json'
const appBuildId = getAppBuildId()

function getAppBuildId(): string {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA
  }
  return new Date().toISOString()
}

function appVersionPlugin(): Plugin {
  return {
    name: 'app-version',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: APP_VERSION_FILENAME,
        source: JSON.stringify({ buildId: appBuildId }),
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    appVersionPlugin(),
    VitePWA({
      filename: PWA_SERVICE_WORKER_FILENAME,
      registerType: 'prompt',
      includeAssets: [
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'icon-192x192.png',
        'icon-256x256.png',
        'icon-384x384.png',
        'icon-512x512.png',
        'title.png',
      ],
      manifest: {
        lang: 'fr',
        short_name: 'Make Prono',
        name: 'Make Prono Great Again',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        theme_color: '#19194b',
        background_color: '#f9f6ed',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        importScripts: [
          'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js',
        ],
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      utils: path.resolve(__dirname, 'src/utils'),
    },
  },
  define: {
    __APP_BUILD_ID__: JSON.stringify(appBuildId),
  },
  esbuild: {
    include: /\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuild: {
      loader: { '.js': 'jsx', '.ts': 'tsx', '.tsx': 'tsx' },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
})
