import Section from './component/rulesSection'

const Subscription = () => (
  <Section>
    <h2 className="text-xl font-bold text-navy">
      Droits d&apos;inscription et mode de qualification
    </h2>
    <br />
    <h3 className="text-lg font-bold text-navy">Mode de qualification</h3>
    <p>
      Il n&apos;y a pas d&apos;élimination, tout le monde participe aux pronostics de tous
      les matchs. Chacun des participants garde son nombre de points acquis
      durant toute la compétition.
    </p>
    <h3 className="text-lg font-bold text-navy">Droits d&apos;inscription</h3>
    <p>
      L&apos;inscription est gratuite et instantanée. Néanmoins, il est conseillé aux
      tribus de mettre en place une cagnotte pour récompenser les vainqueurs et
      rajouter de l&apos;enjeu.
    </p>
    <h3 className="text-lg font-bold text-navy">Date de validation des pronostics</h3>
    <p>
      <b>
        Les pronostics pour chaque match doivent être remplis sur le site avant
        le début de ceux-ci.
      </b>
      &nbsp;En ce qui concerne les pronostics sur le vainqueur de la
      compétition, ceux-ci doivent être réalisés avant le premier match de la
      compétition, soit
      <b> le samedi 14 juin 2025 à 21h.</b>
      <br />
      <br />
      <b>
        <u>En cas de retard ou de non-réponse</u>
      </b>
      &nbsp;sur un match ou pour le vainqueur final,&nbsp;
      <b>
        <u>
          le joueur aura 0 point mais ne sera pas éliminé et pourra donc
          participer aux autres matchs.
        </u>
      </b>
    </p>
  </Section>
)

export default Subscription
