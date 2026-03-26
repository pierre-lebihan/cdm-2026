import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon-32x32.png', 'apple-touch-icon.png', 'icon-192x192.png', 'icon-256x256.png', 'icon-384x384.png', 'icon-512x512.png'],
      manifest: {
        short_name: 'Make Prono Great Again',
        name: 'Make Prono Great Again',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          },
          {
            src: 'favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        theme_color: '#1a1f72',
        background_color: '#1a1f72',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        importScripts: [
          'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js',
        ],
      }
    })
  ],
  base: '/',
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      utils: path.resolve(__dirname, 'src/utils'),
    },
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
