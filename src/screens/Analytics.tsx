import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DASHBOARD_URL =
  'https://metabase.plb-n8n.cloud/public/dashboard/0220c51e-e6c9-46a6-b5ff-56ac19859ad3'

const Analytics = () => {
  const { user } = useAuth()
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)

  useEffect(() => {
    async function loadGroupsAndSetUrl() {
      if (!user) {
        setIframeSrc(`${DASHBOARD_URL}#bordered=false&titled=true&theme=light`)
        return
      }

      // Fetch user's groups
      const { data: members } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('status', 'member')

      const groupIds = members?.map((m) => m.group_id) || []

      let params = new URLSearchParams()

      if (groupIds.length > 0) {
        const { data: groups } = await supabase
          .from('groups')
          .select('name')
          .in('id', groupIds)

        if (groups) {
          groups.forEach((g) => params.append('tribu', g.name)) // "tribu" doit correspondre au nom interne du filtre dans Metabase
        }
      }

      const queryString = params.toString()
      const url = `${DASHBOARD_URL}${
        queryString ? `?${queryString}` : ''
      }#bordered=false&titled=true&theme=light`
      
      setIframeSrc(url)
    }

    loadGroupsAndSetUrl()
  }, [user])

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
