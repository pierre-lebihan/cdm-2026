import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useGroupsForUserMember, type GroupWithMembers } from '../hooks/groups'
import Loader from '../components/Loader'

function getSelectedGroup(
  groups: GroupWithMembers[],
  selectedGroupId: string,
): GroupWithMembers | null {
  for (const group of groups) {
    if (group.id === selectedGroupId) {
      return group
    }
  }

  return null
}

const Analytics = () => {
  const { user } = useAuth()
  const groups = useGroupsForUserMember()
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false)

  useEffect(() => {
    setIframeLoaded(false)
  }, [iframeSrc])

  useEffect(() => {
    const selectedGroup = getSelectedGroup(groups, selectedGroupId)
    if (!selectedGroup && groups.length > 0) {
      setSelectedGroupId(groups[0].id)
    }
  }, [groups, selectedGroupId])

  useEffect(() => {
    async function loadEmbedUrl() {
      if (!user || !selectedGroupId) {
        setIframeSrc(null)
        return
      }

      setError(null)
      setLoading(true)
      const { data, error: invokeErr } = await supabase.functions.invoke(
        'metabase-embed',
        { body: { tribuId: selectedGroupId } },
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
  }, [user, selectedGroupId])

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
      <div className="sticky top-20 z-10 flex gap-1 justify-center py-3 px-4 bg-cream/[0.85] backdrop-blur-sm flex-wrap">
        {groups.map((g) => (
          <button
            key={g.id}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedGroupId === g.id
                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                : 'text-gray-500 hover:text-navy'
            }`}
            onClick={() => setSelectedGroupId(g.id)}
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

      {!error && loading && <Loader />}

      {!error && !loading && iframeSrc && (
        <div
          className="relative"
          style={{ minHeight: 'calc(100vh - 144px)' }}
        >
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            width="100%"
            height="100%"
            style={{ border: 'none', minHeight: 'calc(100vh - 144px)' }}
            allowTransparency
            onLoad={() => setIframeLoaded(true)}
          />
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream">
              <Loader />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Analytics
