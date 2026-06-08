import { useLanguage } from '../../contexts/LanguageContext'
import Section from './component/rulesSection'
import Table from './component/table'

const Groups = () => {
  const { t } = useLanguage()

  return (
    <Section>
      <div>
        <h2 className="text-xl font-bold text-navy">{t.rules.groupTitle}</h2>
        <p>{t.rules.groupIntro}</p>
        <div className="overflow-x-auto">
          <Table
            header={t.rules.groupTable.header}
            rows={t.rules.groupTable.rows}
          />
        </div>
      </div>
      <div>
        <p>
          <u>{t.rules.groupExampleTitle}</u>
        </p>
        <br />
        <div className="overflow-x-auto">
          <Table
            header={t.rules.groupExamplesTable.header}
            rows={t.rules.groupExamplesTable.rows}
          />
        </div>
      </div>
    </Section>
  )
}

export default Groups
