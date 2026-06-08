import { useLanguage } from '../../contexts/LanguageContext'
import Section from './component/rulesSection'

const Subscription = () => {
  const { t } = useLanguage()

  return (
    <Section>
      <h2 className="text-xl font-bold text-navy">
        {t.rules.subscriptionTitle}
      </h2>
      <br />
      <h3 className="text-lg font-bold text-navy">
        {t.rules.qualificationTitle}
      </h3>
      <p>{t.rules.qualificationText}</p>
      <h3 className="text-lg font-bold text-navy">{t.rules.feesTitle}</h3>
      <p>{t.rules.feesText}</p>
      <h3 className="text-lg font-bold text-navy">{t.rules.validationTitle}</h3>
      <p>
        <b>{t.rules.validationDeadlineIntro}</b>&nbsp;
        {t.rules.validationWinnerDeadline}
        <br />
        <br />
        <b>
          <u>{t.rules.validationLateTitle}</u>
        </b>
        &nbsp;{t.rules.validationLateText}
      </p>
    </Section>
  )
}

export default Subscription
