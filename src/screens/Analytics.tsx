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
      <div className="max-w-[600px] mx-auto py-6 px-4 text-center pt-[60px]">
        <p className="text-gray-500 text-[0.9rem]">
          Pour voir les analytics, il faut d'abord rejoindre une tribu.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex gap-1 justify-center py-3 px-4 bg-cream/[0.85] backdrop-blur-sm flex-wrap">
        {groups.map((g) => (
          <button
            key={g.id}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedTribu === g.name
                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                : 'text-gray-500 hover:text-navy'
            }`}
            onClick={() => setSelectedTribu(g.name)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-center p-6 text-center text-navy">
          {error}
        </div>
      )}

      {!error && loading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin text-4xl text-navy">⏳</div>
        </div>
      )}

      {!error && !loading && iframeSrc && (
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: 'calc(100vh - 120px)' }}
          allowTransparency
        />
      )}
    </div>
  )
}

export default Analytics
