import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Analytics = () => {
  const { user } = useAuth()
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEmbedUrl() {
      if (!user) {
        setIframeSrc(null)
        return
      }

      setError(null)
      const { data, error: invokeErr } = await supabase.functions.invoke(
        'metabase-embed',
      )

      if (invokeErr || !data?.url) {
        let serverDetail: string | null = null
        const ctxResponse = invokeErr?.context?.response
        if (ctxResponse && typeof ctxResponse.text === 'function') {
          try {
            const body = await ctxResponse.text()
            try {
              const parsed = JSON.parse(body)
              serverDetail = parsed?.error || body
            } catch {
              serverDetail = body
            }
          } catch {
            serverDetail = null
          }
        }
        console.error('metabase-embed invoke failed', {
          invokeErr,
          data,
          serverDetail,
        })
        const detail =
          serverDetail || data?.error || invokeErr?.message || 'Erreur inconnue'
        setError(
          `Impossible de charger le dashboard analytics : ${detail}`,
        )
        return
      }

      setIframeSrc(data.url)
    }

    loadEmbedUrl()
  }, [user])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-6 text-center text-navy">
        {error}
      </div>
    )
  }

  if (!iframeSrc) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin text-4xl text-navy">⏳</div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <iframe
        src={iframeSrc}
        width="100%"
        height="100%"
        style={{ border: 'none', minHeight: 'calc(100vh - 60px)' }}
        allowTransparency
      />
    </div>
  )
}

export default Analytics
