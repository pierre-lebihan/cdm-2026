import { supabase } from '../supabase'

async function rankingGlobal() {
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

  const { data, error } = await supabase
    .from('ranking')
    .select('rank, display_name, score, winner_team_name')
    .eq('competition_id', comp.id)
    .order('rank', { ascending: true })

  if (error) throw error

  console.log(`Classement — ${comp.name}`)
  console.table(data)
}

rankingGlobal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
