import { supabase } from '../supabase'

function uniqueIds(lists: (string[] | null | undefined)[]): string[] {
  const s = new Set<string>()
  for (const list of lists) {
    if (!list) continue
    for (const id of list) {
      s.add(id)
    }
  }
  return [...s]
}

async function rankingByGroups() {
  const { data: comp, error: compErr } = await supabase
    .from('competitions')
    .select('id, name')
    .eq('active', true)
    .maybeSingle()

  if (compErr) throw compErr
  if (!comp) {
    console.log('Aucune compétition active.')
    return
  }

  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, name, members')

  if (groupsError) throw groupsError
  if (!groups?.length) {
    console.log('Aucun groupe.')
    return
  }

  const memberIds = uniqueIds(groups.map((g) => g.members))
  if (memberIds.length === 0) {
    console.log('Aucun membre dans les groupes.')
    return
  }

  const { data: cpRows, error: cpError } = await supabase
    .from('competition_profiles')
    .select('user_id, score')
    .eq('competition_id', comp.id)
    .in('user_id', memberIds)

  if (cpError) throw cpError

  const { data: profRows, error: prError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', memberIds)

  if (prError) throw prError

  const scoreByUser = new Map<string, number>()
  for (const r of cpRows ?? []) {
    scoreByUser.set(r.user_id, r.score ?? 0)
  }

  const nameByUser = new Map<string, string | null>()
  for (const p of profRows ?? []) {
    nameByUser.set(p.id, p.display_name)
  }

  console.log(`Scores — ${comp.name}\n`)

  for (const group of groups) {
    console.log(`\n=== ${group.name} ===`)

    const members = (group.members ?? [])
      .map((uid) => ({
        name: nameByUser.get(uid) ?? '—',
        score: scoreByUser.get(uid) ?? 0,
      }))
      .sort((a, b) => b.score - a.score)

    console.table(members)
  }
}

rankingByGroups()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
