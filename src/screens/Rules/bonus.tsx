import { useLanguage } from '../../contexts/LanguageContext'
import { useCompetitionDisplayName } from '../../hooks/competition'
import Section from './component/rulesSection'
import Table from './component/table'

function getFinalWinnerCopy(
  competitionLabel: string,
  defaultCopy: string,
  prefix: string,
  suffix: string,
): string {
  if (competitionLabel === 'Pronostics') {
    return defaultCopy
  }

  return `${prefix} « ${competitionLabel} » ${suffix}`
}

function Bonus() {
  const competitionLabel = useCompetitionDisplayName()
  const { t } = useLanguage()
  const winnerCopy = getFinalWinnerCopy(
    competitionLabel,
    t.rules.finalWinnerDefault,
    t.rules.finalWinnerPrefix,
    t.rules.finalWinnerSuffix,
  )

  return (
    <Section>
      <h2 className="text-xl font-bold text-navy">{t.rules.additionalTitle}</h2>
      <br />
      <h3 className="text-lg font-bold text-navy">
        {t.rules.finalWinnerTitle}
      </h3>
      <p>{winnerCopy}</p>
      <div>
        <h3 className="text-lg font-bold text-navy">
          {t.rules.distributionTitle}
        </h3>
        <p>{t.rules.distributionText}</p>
        <br />
        <div className="overflow-x-auto">
          <Table
            header={t.rules.distributionTable.header}
            rows={t.rules.distributionTable.rows}
          />
        </div>
      </div>
      <div>
        <p>{t.rules.distributionNote}</p>
      </div>
    </Section>
  )
}

export default Bonus
