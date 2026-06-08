import { useLanguage } from '../../contexts/LanguageContext'
import Section from './component/rulesSection'
import Table from './component/table'

const Playoff = () => {
  const { t } = useLanguage()

  return (
    <Section>
      <div>
        <h2 className="text-xl font-bold text-navy">{t.rules.playoffTitle}</h2>
        <p>{t.rules.playoffIntro}</p>
        <p>{t.rules.playoffDrawText}</p>
      </div>
      <div>
        <p>
          <u>{t.rules.playoffExampleTitle}</u>
        </p>
        <br />
        <div className="overflow-x-auto">
          <Table
            header={t.rules.playoffExamplesTable.header}
            rows={t.rules.playoffExamplesTable.rows}
          />
        </div>
      </div>
    </Section>
  )
}

export default Playoff
