import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useCompetitionDisplayName } from '../../hooks/competition'
import FaqEntry from './FaqEntry'
import Mascot from '../../components/Mascot'
import { MASCOT_LIST } from '../../lib/mascots'

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
        <div className="flex justify-center gap-3 sm:gap-5 mb-4">
          {MASCOT_LIST.map((m) => (
            <Mascot
              key={m.id}
              id={m.id}
              size="lg"
              className="ring-4 ring-cream shadow-md"
            />
          ))}
        </div>
        <h1 className="text-xl font-extrabold text-navy m-0 mb-1">
          Questions fréquentes
        </h1>
        <p className="text-sm text-gray-500 m-0 mb-5">
          Sam, Iván et Pierre répondent à tes questions
        </p>
      </div>

      <FaqEntry
        mascot="usa"
        punchline="Welcome to the show, partner !"
        question="Qu'est-ce que c'est ?"
        answer={faqWhatIsItAnswer(competitionLabel)}
      />
      <FaqEntry
        mascot="usa"
        punchline="Free as in freedom, baby !"
        question="Est-ce gratuit ?"
        answer="Oui, l'inscription au site est gratuite. Néanmoins, il est conseillé aux tribus de mettre en place une
          cagnotte pour récompenser les vainqueurs et rajouter de l'enjeu."
      />
      <FaqEntry
        mascot="canada"
        punchline="Trouve ta tribu et plante ta hache !"
        question="Comment participer ?"
        answer="Après vous être connecté, vous devez tout d'abord rejoindre une tribu ou créer votre propre tribu.
          Une fois cette étape réalisée, vous pourrez pronostiquer votre vainqueur final ainsi que vos premiers
          matchs."
      />
      <FaqEntry
        mascot="canada"
        punchline="C'est ta meute, ta cabane, ton clan !"
        question="Qu'est-ce qu'une tribu ?"
        answer="Une tribu est un groupe de personnes qui regroupe des amis, des connaissances, des familles, avec lesquels vous aurez
          choisi de jouer. Chacun d'entre vous peut créer sa propre tribu s'il le souhaite."
      />
      <FaqEntry
        mascot="canada"
        punchline="Le code, c'est la clé du chalet !"
        question="Comment rejoindre une tribu ?"
        answer="Allez dans l'onglet 'Tribus' dans le menu, entrez le code que vous a indiqué votre chef d'équipe dans la section 'Rejoindre une tribu'. Votre demande sera validée et vous pourrez commencer vos pronostics."
      />
      <FaqEntry
        mascot="canada"
        punchline="Bâtis-la comme une cabane en rondins !"
        question="Comment créer ma tribu ?"
        answer="Allez dans l'onglet 'Tribus' dans le menu. Dans la section 'Créer une tribu', choisissez le nom de la tribu. Un code d'accès sera alors créé, qu'il vous suffira d'envoyer aux personnes qui souhaitent faire partie de votre tribu."
      />
      <FaqEntry
        mascot="mexico"
        punchline="Sois précis, sois malin, sois original !"
        question="Comment sont calculés les points ?"
        answer={
          <>
            <p className="m-0 mb-3">
              D’abord, la <strong>précision</strong> : plus ton pronostic colle au vrai match (bon vainqueur ou bon
              nul, score proche, petits bonus si tu es juste ou tout proche), plus tu accumules des points de base —
              jusqu’à une vingtaine de points par rencontre.
            </p>
            <p className="m-0 mb-3">
              Ensuite, un <strong>multiplicateur dynamique</strong> amplifie ces points : si tout le monde a joué la
              même tendance que toi, le gain reste modeste ; si tu es dans une minorité de pronos, le multiplicateur
              peut monter fort. L’objectif est de récompenser les choix originaux sans casser l’équilibre du jeu.
            </p>
            <p className="m-0 text-xs text-gray-500">
              Tableau complet, formule et exemples :{' '}
              <Link to="/rules/algorithm" className="text-indigo-600 font-medium">
                règlement détaillé et algorithme
              </Link>
              .
            </p>
          </>
        }
      />
      <FaqEntry
        mascot="mexico"
        punchline="Una apuesta, muchas tribus, amigo !"
        question="Puis-je faire partie de plusieurs tribus ?"
        answer="Oui, vous pouvez faire partie d'autant de tribus que vous le souhaitez. Par contre, vous ne pouvez parier qu'un seul score par match, qui sera le même dans toutes vos tribus."
      />
      <FaqEntry
        mascot="usa"
        punchline="Tes données restent dans ton territoire !"
        question="Que faites-vous de mes données ?"
        answer={
          <>
            Les données personnelles collectées le sont uniquement dans le but
            du jeu. <b>Aucune donnée ne sera réutilisée pour un autre objectif.</b>
          </>
        }
      />
      <FaqEntry
        mascot="canada"
        punchline="Envoie un signal de fumée à Pierre !"
        question="J'ai un problème non listé ici"
        answer="Vous pouvez nous envoyer votre requête à l'adresse pierre@le-bihan.eu. Nous vous répondrons le plus rapidement possible."
      />
    </div>
  )
}

export default memo(FAQPage)
