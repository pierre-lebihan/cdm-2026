import { supabase } from '../supabase'

async function whoHaveNoWinner() {
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
    .select('display_name, score, winner_team_name')
    .eq('competition_id', comp.id)
    .is('winner_team', null)
    .order('display_name', { ascending: true })

  if (error) throw error

  console.log(`Sans vainqueur final — ${comp.name}`)
  console.table(data)
}

whoHaveNoWinner()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
