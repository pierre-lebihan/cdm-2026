import Section from './component/rulesSection'
import Table from './component/table'

const Playoff = () => (
  <Section>
    <div>
      <h2 className="text-xl font-bold text-navy">Règles durant la phase finale</h2>
      <p>
        Le fonctionnement est identique à la phase de groupe : jusqu&apos;à <strong>20 points</strong> par
        match selon les 5 mêmes critères. Vous pronostiquez le score à la fin du temps réglementaire (90 min).
      </p>
      <p>
        En phase finale, les matchs nuls au bout de 90 min sont possibles (prolongations / tirs au but).
        Pronostiquer un nul vous rapporte les points Résultat Correct + Proximité + Écart + Bonus si exact,
        mais pas le bonus Gagnant (pas de vainqueur au temps réglementaire).
      </p>
    </div>
    <div>
      <p><u>Exemples : Brésil 2-1 Allemagne</u></p>
      <br />
      <div className="overflow-x-auto">
        <Table
          header={['Prono', 'Résultat', 'Gagnant', 'Proximité', 'Écart', 'Bonus', 'Total']}
          rows={[
            ['2-1', '2', '8', '3', '3', '4', '20'],
            ['3-1', '2', '8', '2 (diff 1)', '0 (marge 2≠1)', '0', '12'],
            ['3-2', '2', '8', '1 (diff 2)', '3 (marge 1=1)', '0', '14'],
            ['3-0', '2', '8', '1 (diff 2)', '0 (marge 3≠1)', '0', '11'],
            ['1-1', '0 (mauvais résultat)', '—', '—', '—', '—', '0'],
          ]}
        />
      </div>
    </div>
  </Section>
)

export default Playoff
