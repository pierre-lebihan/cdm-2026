import { Link } from 'react-router-dom'

function LegalPage() {
  return (
    <div className="max-w-[720px] mx-auto py-8 px-4 pb-14">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-5"
        >
          Retour à l'accueil
        </Link>
        <h1 className="text-2xl font-extrabold text-navy m-0 mb-2">
          Confidentialité et conditions d'utilisation
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed m-0">
          Version courte et lisible pour Make Prono Great Again, un jeu de
          pronostics gratuit entre amis.
        </p>
      </div>

      <section className="bg-white rounded-lg shadow-card p-5 mb-5">
        <h2 className="text-lg font-bold text-navy m-0 mb-3">
          Politique de confidentialité
        </h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p className="m-0">
            L'application collecte uniquement les informations nécessaires au
            fonctionnement du jeu : votre compte de connexion, votre nom
            affiché, votre avatar, vos pronostics, vos scores et vos tribus.
          </p>
          <p className="m-0">
            Ces données servent à vous connecter, enregistrer vos pronostics,
            calculer les classements, gérer les tribus et afficher les profils
            aux autres joueurs de vos groupes.
          </p>
          <p className="m-0">
            Les données ne sont pas revendues, louées ou utilisées pour de la
            publicité. Elles peuvent être hébergées et traitées par les services
            techniques utilisés par l'application, notamment Supabase, Google
            pour la connexion et OneSignal si vous activez les notifications.
          </p>
          <p className="m-0">
            L'application peut utiliser le stockage local du navigateur pour des
            préférences d'affichage, l'installation PWA ou certains rappels
            d'interface. Les notifications sont optionnelles et peuvent être
            désactivées depuis votre navigateur.
          </p>
          <p className="m-0">
            Pour demander la suppression ou la modification de vos données,
            contactez-nous à{' '}
            <a
              href="mailto:pierre@le-bihan.eu"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              pierre@le-bihan.eu
            </a>
            .
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-card p-5">
        <h2 className="text-lg font-bold text-navy m-0 mb-3">
          Conditions d'utilisation
        </h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p className="m-0">
            Make Prono Great Again est un jeu gratuit et informel entre amis.
            Les pronostics n'ont pas de valeur financière sur la plateforme et
            ne constituent pas un service de pari sportif.
          </p>
          <p className="m-0">
            Chaque joueur s'engage à utiliser l'application de bonne foi, sans
            triche, usurpation d'identité, spam, tentative d'accès non autorisé
            ou comportement qui pourrait dégrader le service pour les autres.
          </p>
          <p className="m-0">
            Les administrateurs peuvent corriger, modérer ou supprimer un
            compte, une tribu ou un contenu en cas d'abus, d'erreur manifeste ou
            de besoin technique.
          </p>
          <p className="m-0">
            Le service est fourni tel quel, sans garantie de disponibilité
            permanente. Le classement dépend des règles affichées dans
            l'application et peut être corrigé en cas de bug ou de résultat
            erroné.
          </p>
          <p className="m-0">
            En utilisant l'application, vous acceptez ces règles simples. Si
            quelque chose n'est pas clair, écrivez-nous à{' '}
            <a
              href="mailto:pierre@le-bihan.eu"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              pierre@le-bihan.eu
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  )
}

export default LegalPage
