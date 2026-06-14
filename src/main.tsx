import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './screens/App/App'
import Loader from './components/Loader'
import { AuthProvider } from './contexts/AuthContext'
import { CompetitionProvider } from './contexts/CompetitionContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { queryClient } from './lib/queryClient'
import './index.css'

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__deferredInstallPrompt = e
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Element root introuvable')
}

const root = createRoot(rootElement)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<Loader variant="page" size="lg" />}>
          <LanguageProvider>
            <CompetitionProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </CompetitionProvider>
          </LanguageProvider>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
