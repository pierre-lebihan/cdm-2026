import Section from './component/rulesSection'
import Table from './component/table'

const Groups = () => (
  <Section>
    <div>
      <h2 className="text-xl font-bold text-navy">
        Règles durant la phase de groupe
      </h2>
      <p>
        Pour chaque match, vous pouvez marquer jusqu&apos;à{' '}
        <strong>20 points</strong> répartis en 5 critères indépendants. Si le
        résultat (V/N/D) est incorrect, vous obtenez 0 point.
      </p>
      <div className="overflow-x-auto">
        <Table
          header={['Critère', 'Description', 'Points']}
          rows={[
            ['Résultat Correct', 'Victoire / Nul / Défaite correcte', '2'],
            ['Gagnant Correct', 'Bonne équipe gagnante (hors nul)', '8'],
            ['Proximité du Score', '3 − écart total des buts (min 0)', '0–3'],
            ['Écart de Buts', 'Bonne marge de victoire / nul', '3'],
            ['Bonus Score Exact', 'Score 100 % exact', '4'],
          ]}
        />
      </div>
    </div>
    <div>
      <p>
        <u>Exemples : France 3-0 Mexique</u>
      </p>
      <br />
      <div className="overflow-x-auto">
        <Table
          header={[
            'Prono',
            'Résultat',
            'Gagnant',
            'Proximité',
            'Écart',
            'Bonus',
            'Total',
          ]}
          rows={[
            ['3-0', '2', '8', '3', '3', '4', '20'],
            ['4-0', '2', '8', '2 (diff 1)', '0 (marge 4≠3)', '0', '12'],
            ['4-1', '2', '8', '1 (diff 2)', '3 (marge 3=3)', '0', '14'],
            ['2-1', '2', '8', '1 (diff 2)', '0 (marge 1≠3)', '0', '11'],
            ['0-2', '0 (mauvais résultat)', '—', '—', '—', '—', '0'],
          ]}
        />
      </div>
    </div>
  </Section>
)

export default Groups
