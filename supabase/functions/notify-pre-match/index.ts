import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CHUNK = 2000

function chunkExternalIds(ids: string[]): string[][] {
  const out: string[][] = []
  for (let i = 0; i < ids.length; i += CHUNK) {
    out.push(ids.slice(i, i + CHUNK))
  }
  return out
}

async function sendOneSignalToExternalIds(
  appId: string,
  apiKey: string,
  externalIds: string[],
  heading: string,
  body: string,
  url: string | undefined,
): Promise<void> {
  const chunks = chunkExternalIds(externalIds)
  for (const chunk of chunks) {
    const payload: Record<string, unknown> = {
      app_id: appId,
      target_channel: 'push',
      include_aliases: { external_id: chunk },
      headings: { fr: heading, en: heading },
      contents: { fr: body, en: body },
    }
    if (url) {
      payload.url = url
    }
    const res = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OneSignal ${res.status}: ${text}`)
    }
  }
}

Deno.serve(async (_req: Request) => {
  const appId = Deno.env.get('ONESIGNAL_APP_ID')
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!appId || !apiKey || !supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Missing OneSignal or Supabase env' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const now = new Date()
  const winStart = new Date(now.getTime() + 4 * 60 * 1000)
  const winEnd = new Date(now.getTime() + 9 * 60 * 1000)

  try {
    const { data: rows, error: qErr } = await supabase
      .from('matches_with_teams')
      .select(
        'id, date_time, status, competition_id, pre_match_reminder_sent_at, team_a_name, team_b_name',
      )
      .eq('status', 'PLANNED')
      .eq('visible_to_users', true)
      .is('pre_match_reminder_sent_at', null)
      .not('date_time', 'is', null)
      .gt('date_time', winStart.toISOString())
      .lte('date_time', winEnd.toISOString())

    if (qErr) {
      throw qErr
    }

    const results: Record<string, unknown>[] = []

    for (const m of rows ?? []) {
      const matchId = m.id
      const competitionId = m.competition_id
      if (!competitionId) {
        results.push({ matchId, skipped: 'no_competition_id' })
        continue
      }

      const { data: bettors, error: bErr } = await supabase
        .from('bets')
        .select('user_id')
        .eq('match_id', matchId)
        .not('bet_team_a', 'is', null)
        .not('bet_team_b', 'is', null)

      if (bErr) {
        throw bErr
      }

      const bettorSet = new Set(
        (bettors ?? []).flatMap((b) => (b.user_id ? [b.user_id] : [])),
      )

      const { data: pool, error: pErr } = await supabase
        .from('competition_profiles')
        .select('user_id')
        .eq('competition_id', competitionId)

      if (pErr) {
        throw pErr
      }

      const targets = (pool ?? []).flatMap((r) => {
        if (!r.user_id || bettorSet.has(r.user_id)) {
          return []
        }
        return [r.user_id]
      })

      const labelA = m.team_a_name ?? 'Équipe A'
      const labelB = m.team_b_name ?? 'Équipe B'
      const heading = 'Le match commence bientôt'
      const body = `Il te reste 5 minutes pour pronostiquer ${labelA} — ${labelB}.`
      const siteUrl =
        Deno.env.get('PUBLIC_SITE_URL') ?? 'https://makepronogreatagain.bzh/'
      const url = `${siteUrl.replace(/\/$/, '')}/matches`

      if (targets.length > 0) {
        await sendOneSignalToExternalIds(
          appId,
          apiKey,
          targets,
          heading,
          body,
          url,
        )
      }

      const { error: uErr } = await supabase
        .from('matches')
        .update({ pre_match_reminder_sent_at: new Date().toISOString() })
        .eq('id', matchId)

      if (uErr) {
        throw uErr
      }

      results.push({
        matchId,
        notified: targets.length,
      })
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
