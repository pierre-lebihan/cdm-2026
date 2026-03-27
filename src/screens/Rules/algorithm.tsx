import { Link } from 'react-router-dom'

const AlgorithmPage = () => (
  <div className="max-w-[640px] mx-auto py-8 px-4 pb-16">
    <div className="mb-8">
      <Link
        to="/rules"
        className="text-sm font-semibold text-indigo-600 hover:underline mb-4 inline-block"
      >
        ← Règles du jeu
      </Link>
      <h1 className="text-2xl font-extrabold text-navy m-0 mb-2">
        Règlement détaillé et algorithme
      </h1>
      <p className="text-sm text-gray-500 m-0">
        Tout ce qui concerne les points de base, la popularité des pronos et des exemples chiffrés.
      </p>
    </div>

    <section className="mb-8">
      <h2 className="text-lg font-bold text-navy m-0 mb-3">1. Points de précision (par match)</h2>
      <p className="text-sm text-gray-600 m-0 mb-3 leading-relaxed">
        Le <strong>Résultat</strong> et le <strong>Bonus score exact</strong> nécessitent le bon résultat à
        90 min (V / N / D). La <strong>Proximité</strong> et l’<strong>Écart de buts</strong> sont attribués
        si le résultat à 90 min est correct <em>ou</em> si le bon gagnant est prédit (phase finale uniquement).
        Le <strong>Gagnant</strong> est toujours indépendant du résultat à 90 min en phase finale.
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-navy">
              <th className="p-3 font-semibold">Critère</th>
              <th className="p-3 font-semibold w-24 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b border-gray-100">
              <td className="p-3">Résultat correct (V / N / D à 90 min)</td>
              <td className="p-3 text-right font-mono tabular-nums">2</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3">Bon gagnant du match (règle phase groupe vs phase finale)</td>
              <td className="p-3 text-right font-mono tabular-nums">8</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3">
                Proximité du score — max(3 − écart total des buts, 0)
              </td>
              <td className="p-3 text-right font-mono tabular-nums">0 à 3</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3">
                Écart de buts — max(3 − |marge réelle − marge pariée|, 0)
              </td>
              <td className="p-3 text-right font-mono tabular-nums">0 à 3</td>
            </tr>
            <tr>
              <td className="p-3">Bonus score exact à 90 min</td>
              <td className="p-3 text-right font-mono tabular-nums">4</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2 m-0">
        Maximum théorique sur ces critères : 20 points avant multiplicateur.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-lg font-bold text-navy m-0 mb-3">2. Popularité du pronostic</h2>
      <p className="text-sm text-gray-600 m-0 mb-3 leading-relaxed">
        On regarde comment les joueurs se répartissent sur le match :
      </p>
      <ul className="text-sm text-gray-600 m-0 mb-3 pl-5 space-y-2 list-disc">
        <li>
          <span className="font-semibold text-navy">Phase de groupe</span> : trois « familles » — victoire équipe A,
          match nul, victoire équipe B.
        </li>
        <li>
          <span className="font-semibold text-navy">Phase finale</span> : deux « familles » — au final, c’est soit une
          victoire de A, soit une victoire de B (y compris après prolongations ou penalties ; si tu pars sur un nul à
          90 min, ton choix de vainqueur départage ta famille).
        </li>
      </ul>
      <p className="text-sm text-gray-600 m-0 mb-2 leading-relaxed">
        Soit <span className="font-mono text-navy">p</span> la proportion de pronostics valides sur ce match qui
        tombent dans la même famille que le tien (par exemple 30 % des gens ont aussi misé une victoire A). La cote
        appliquée à tes points de base est :
      </p>
      <div className="rounded-xl bg-navy/[0.04] border border-navy/10 px-4 py-3 mb-3 font-mono text-sm text-navy break-all">
        Cote = exp(−p² × 2) × 10
      </div>
      <p className="text-sm text-gray-600 m-0 mb-2 leading-relaxed">
        La cote est ensuite bornée entre <span className="font-semibold">×1</span> et{' '}
        <span className="font-semibold">×10</span>. Tant qu’il n’y a qu’un seul pronostic valide sur le match, la
        cote reste à ×1 (pas d’effet « anti-mouton » sans foule).
      </p>
      <p className="text-sm text-gray-600 m-0 leading-relaxed">
        <span className="font-semibold text-navy">Points finaux</span> = arrondi des points de base × cote.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-lg font-bold text-navy m-0 mb-3">3. Exemples extrêmes (ordre de grandeur)</h2>
      <p className="text-sm text-gray-600 m-0 mb-4 leading-relaxed">
        Imaginons que tu fasses un quasi sans-faute sur un match (ordre de grandeur ~18 points de base). Si tout le
        monde a joué la même famille que toi, <span className="font-mono">p</span> est proche de 1 : la cote plonge
        vers le plancher — tu peux finir autour de <span className="font-semibold">25 points</span> sur ce match
        (le « pari de la masse »).
      </p>
      <p className="text-sm text-gray-600 m-0 mb-4 leading-relaxed">
        Même base, mais tu es presque seul sur ta famille : <span className="font-mono">p</span> est très faible, la
        cote grimpe — tu peux dépasser <span className="font-semibold">150 points</span> sur un seul match (le «
        hold-up »).
      </p>
      <p className="text-xs text-gray-500 m-0">
        Les valeurs exactes dépendent du nombre de joueurs et de la répartition réelle ; l’app affiche une estimation
        de cote et une fourchette de gain potentiel au moment où tu saisis ton score.
      </p>
    </section>

    <p className="text-sm text-gray-500 m-0">
      Questions courtes : voir aussi la{' '}
      <Link to="/faq" className="text-indigo-600 font-medium hover:underline">
        FAQ
      </Link>
      .
    </p>
  </div>
)

export default AlgorithmPage
