import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCompetitionDisplayName } from '../../hooks/competition'
import { isGenericCompetitionName } from '../../lib/localizedNames'
import FaqEntry from './FaqEntry'
import Mascot from '../../components/Mascot'
import { MASCOT_LIST } from '../../lib/mascots'

function faqWhatIsItAnswer(
  competitionLabel: string,
  defaultAnswer: string,
  competitionPrefix: string,
  competitionSuffix: string,
): string {
  if (isGenericCompetitionName(competitionLabel)) {
    return defaultAnswer
  }

  return `${competitionPrefix} ${competitionLabel}, ${competitionSuffix}`
}

function FAQPage() {
  const competitionLabel = useCompetitionDisplayName()
  const { t } = useLanguage()
  const whatIsItAnswer = faqWhatIsItAnswer(
    competitionLabel,
    t.faq.whatIsItDefault,
    t.faq.whatIsItCompetitionPrefix,
    t.faq.whatIsItCompetitionSuffix,
  )

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
          {t.faq.title}
        </h1>
        <p className="text-sm text-gray-500 m-0 mb-5">{t.faq.subtitle}</p>
      </div>

      <FaqEntry
        mascot="usa"
        punchline={t.faq.whatIsItPunchline}
        question={t.faq.whatIsItQuestion}
        answer={whatIsItAnswer}
      />
      <FaqEntry
        mascot="usa"
        punchline={t.faq.freePunchline}
        question={t.faq.freeQuestion}
        answer={t.faq.freeAnswer}
      />
      <FaqEntry
        mascot="canada"
        punchline={t.faq.participatePunchline}
        question={t.faq.participateQuestion}
        answer={t.faq.participateAnswer}
      />
      <FaqEntry
        mascot="canada"
        punchline={t.faq.tribePunchline}
        question={t.faq.tribeQuestion}
        answer={t.faq.tribeAnswer}
      />
      <FaqEntry
        mascot="canada"
        punchline={t.faq.joinTribePunchline}
        question={t.faq.joinTribeQuestion}
        answer={t.faq.joinTribeAnswer}
      />
      <FaqEntry
        mascot="canada"
        punchline={t.faq.createTribePunchline}
        question={t.faq.createTribeQuestion}
        answer={t.faq.createTribeAnswer}
      />
      <FaqEntry
        mascot="mexico"
        punchline={t.faq.scoringPunchline}
        question={t.faq.scoringQuestion}
        answer={
          <>
            <p className="m-0 mb-3">{t.faq.scoringAnswerPrecision}</p>
            <p className="m-0 mb-3">{t.faq.scoringAnswerMultiplier}</p>
            <p className="m-0 text-xs text-gray-500">
              {t.faq.scoringAlgorithmPrefix}{' '}
              <Link
                to="/rules/algorithm"
                className="text-indigo-600 font-medium"
              >
                {t.faq.scoringLinkLabel}
              </Link>
              .
            </p>
          </>
        }
      />
      <FaqEntry
        mascot="mexico"
        punchline={t.faq.multipleTribesPunchline}
        question={t.faq.multipleTribesQuestion}
        answer={t.faq.multipleTribesAnswer}
      />
      <FaqEntry
        mascot="usa"
        punchline={t.faq.dataPunchline}
        question={t.faq.dataQuestion}
        answer={
          <>
            {t.faq.dataAnswerIntro} <b>{t.faq.dataAnswerBold}</b>
          </>
        }
      />
      <FaqEntry
        mascot="canada"
        punchline={t.faq.problemPunchline}
        question={t.faq.problemQuestion}
        answer={t.faq.problemAnswer}
      />
    </div>
  )
}

export default memo(FAQPage)
