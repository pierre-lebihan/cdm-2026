import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './screens/App/App'
import Loader from './components/Loader'
import { AuthProvider } from './contexts/AuthContext'
import { CompetitionProvider } from './contexts/CompetitionContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './index.css'

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__deferredInstallPrompt = e
})

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
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
  </React.StrictMode>,
)
