import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useGroupsForUserMember } from '../hooks/groups'

const Analytics = () => {
  const { user } = useAuth()
  const groups = useGroupsForUserMember()
  const [selectedTribu, setSelectedTribu] = useState<string>('')
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!selectedTribu && groups.length > 0) {
      setSelectedTribu(groups[0].name)
    }
  }, [groups, selectedTribu])

  useEffect(() => {
    async function loadEmbedUrl() {
      if (!user || !selectedTribu) {
        setIframeSrc(null)
        return
      }

      setError(null)
      setLoading(true)
      const { data, error: invokeErr } = await supabase.functions.invoke(
        'metabase-embed',
        { body: { tribu: selectedTribu } },
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
        setError(`Impossible de charger le dashboard analytics : ${detail}`)
        setIframeSrc(null)
        setLoading(false)
        return
      }

      setIframeSrc(data.url)
      setLoading(false)
    }

    loadEmbedUrl()
  }, [user, selectedTribu])

  if (user && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-6 text-center text-navy">
        Tu n'es membre d'aucune tribu : rejoins-en une pour voir les analytics.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      <div className="flex items-center gap-3 p-3 bg-cream-dark border-b border-navy/10">
        <label htmlFor="tribu-select" className="text-navy font-medium">
          Tribu :
        </label>
        <select
          id="tribu-select"
          value={selectedTribu}
          onChange={(e) => setSelectedTribu(e.target.value)}
          className="px-3 py-1.5 rounded border border-navy/20 bg-white text-navy"
        >
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-navy">
          {error}
        </div>
      )}

      {!error && loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-4xl text-navy">⏳</div>
        </div>
      )}

      {!error && !loading && iframeSrc && (
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: 'none', flex: 1, minHeight: 'calc(100vh - 120px)' }}
          allowTransparency
        />
      )}
    </div>
  )
}

export default Analytics
