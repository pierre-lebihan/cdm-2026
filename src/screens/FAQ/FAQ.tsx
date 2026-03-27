import { memo } from 'react'
import { useCompetitionDisplayName } from '../../hooks/competition'
import FaqEntry from './FaqEntry'

function faqWhatIsItAnswer(competitionLabel: string): string {
  const suffix =
    ' À chaque bon pronostic, vous marquez un certain nombre de points, qui cumulés au fur et à mesure détermineront votre place dans le classement de votre tribu.'
  if (competitionLabel === 'Pronostics') {
    return `Un site qui vous permet de jouer avec des pronostics sportifs, entre amis ou en famille.${suffix}`
  }
  return `Un site qui vous permet de jouer avec les pronostics de ${competitionLabel}, entre amis ou en famille.${suffix}`
}

function FAQPage() {
  const competitionLabel = useCompetitionDisplayName()

  return (
    <div className="max-w-[600px] mx-auto py-6 px-4 pb-12">
      <div className="text-center mb-6">
        <h1 className="text-xl font-extrabold text-navy m-0 mb-1">
          Questions fréquentes
        </h1>
        <p className="text-sm text-gray-500 m-0 mb-5">
          Tout ce qu'il faut savoir sur Make Prono Great Again
        </p>
      </div>

      <FaqEntry
        question="Qu'est-ce que c'est ?"
        answer={faqWhatIsItAnswer(competitionLabel)}
      />
      <FaqEntry
        question="Est-ce gratuit ?"
        answer="Oui, l'inscription au site est gratuite. Néanmoins, il est conseillé aux tribus de mettre en place une
          cagnotte pour récompenser les vainqueurs et rajouter de l'enjeu."
      />
      <FaqEntry
        question="Comment participer ?"
        answer="Après vous être connecté, vous devez tout d'abord rejoindre une tribu ou créer votre propre tribu.
          Une fois cette étape réalisée, vous pourrez pronostiquer votre vainqueur final ainsi que vos premiers
          matchs."
      />
      <FaqEntry
        question="Qu'est-ce qu'une tribu ?"
        answer="Une tribu est un groupe de personnes qui regroupe des amis, des connaissances, des familles, avec lesquels vous aurez
          choisi de jouer. Chacun d'entre vous peut créer sa propre tribu s'il le souhaite."
      />
      <FaqEntry
        question="Comment rejoindre une tribu ?"
        answer="Allez dans l'onglet 'Tribus' dans le menu, entrez le code que vous a indiqué votre chef d'équipe dans la section 'Rejoindre une tribu'. Votre demande sera validée et vous pourrez commencer vos pronostics."
      />
      <FaqEntry
        question="Comment créer ma tribu ?"
        answer="Allez dans l'onglet 'Tribus' dans le menu. Dans la section 'Créer une tribu', choisissez le nom de la tribu. Un code d'accès sera alors créé, qu'il vous suffira d'envoyer aux personnes qui souhaitent faire partie de votre tribu."
      />
      <FaqEntry
        question="Comment sont calculés les points ?"
        answer="Chaque match rapporte jusqu'à 20 points répartis en 5 critères : Résultat correct V/N/D (2 pts), Gagnant correct (8 pts, hors match nul), Proximité du score (0 à 3 pts selon l'écart total de buts), Écart de buts correct (3 pts si la marge de victoire est juste), et Bonus score exact (4 pts si le score est parfait). Tous les critères sauf le bonus nécessitent d'avoir le bon résultat — sinon c'est 0 pt."
      />
      <FaqEntry
        question="Puis-je faire partie de plusieurs tribus ?"
        answer="Oui, vous pouvez faire partie d'autant de tribus que vous le souhaitez. Par contre, vous ne pouvez parier qu'un seul score par match, qui sera le même dans toutes vos tribus."
      />
      <FaqEntry
        question="Que faites-vous de mes données ?"
        answer={
          <>
            Les données personnelles collectées le sont uniquement dans le but
            du jeu. <b>Aucune donnée ne sera réutilisée pour un autre objectif.</b>
          </>
        }
      />
      <FaqEntry
        question="J'ai un problème non listé ici"
        answer="Vous pouvez nous envoyer votre requête à l'adresse pierre@le-bihan.eu. Nous vous répondrons le plus rapidement possible."
      />
    </div>
  )
}

export default memo(FAQPage)
