import { supabase } from '../supabase'

async function checkScores() {
  const { data: cpRows, error: cpError } = await supabase
    .from('competition_profiles')
    .select('user_id, competition_id, score')

  if (cpError) throw cpError

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name')

  if (profilesError) throw profilesError

  const nameByUser = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

  const { data: bets, error: betsError } = await supabase
    .from('bets')
    .select('user_id, competition_id, points_won')

  if (betsError) throw betsError

  const sumByUserComp = new Map<string, number>()
  for (const bet of bets ?? []) {
    if (!bet.user_id) continue
    const cid = bet.competition_id
    if (!cid) continue
    const key = `${bet.user_id}|${cid}`
    const add = bet.points_won != null && !Number.isNaN(bet.points_won) ? Math.round(bet.points_won) : 0
    sumByUserComp.set(key, (sumByUserComp.get(key) ?? 0) + add)
  }

  for (const cp of cpRows ?? []) {
    const key = `${cp.user_id}|${cp.competition_id}`
    const betScore = sumByUserComp.get(key) ?? 0
    if (Math.abs((cp.score ?? 0) - betScore) > 0.01) {
      const display = nameByUser.get(cp.user_id) ?? cp.user_id
      console.log(
        `Écart: ${display} [${cp.competition_id}] — competition_profiles.score=${cp.score}, somme des paris=${betScore}`,
      )
    }
  }

  console.log('Vérification terminée.')
}

checkScores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
