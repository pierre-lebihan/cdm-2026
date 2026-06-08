import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const AlgorithmPage = () => {
  const { t } = useLanguage()

  return (
    <div className="max-w-[640px] mx-auto py-8 px-4 pb-16">
      <div className="mb-8">
        <Link
          to="/rules"
          className="text-sm font-semibold text-indigo-600 hover:underline mb-4 inline-block"
        >
          {t.algorithm.backToRules}
        </Link>
        <h1 className="text-2xl font-extrabold text-navy m-0 mb-2">
          {t.algorithm.title}
        </h1>
        <p className="text-sm text-gray-500 m-0">{t.algorithm.description}</p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-navy m-0 mb-3">
          {t.algorithm.precisionTitle}
        </h2>
        <p className="text-sm text-gray-600 m-0 mb-3 leading-relaxed">
          {t.algorithm.precisionText}
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-navy">
                <th className="p-3 font-semibold">
                  {t.algorithm.criterionHeader}
                </th>
                <th className="p-3 font-semibold w-24 text-right">
                  {t.algorithm.pointsHeader}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {t.algorithm.precisionRows.map((row) => (
                <tr key={row.criterion} className="border-b border-gray-100">
                  <td className="p-3">{row.criterion}</td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2 m-0">
          {t.algorithm.maxTheoretical}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-navy m-0 mb-3">
          {t.algorithm.popularityTitle}
        </h2>
        <p className="text-sm text-gray-600 m-0 mb-3 leading-relaxed">
          {t.algorithm.popularityIntro}
        </p>
        <ul className="text-sm text-gray-600 m-0 mb-3 pl-5 space-y-2 list-disc">
          <li>
            <span className="font-semibold text-navy">
              {t.algorithm.groupFamilyLabel}
            </span>{' '}
            : {t.algorithm.groupFamilyText}
          </li>
          <li>
            <span className="font-semibold text-navy">
              {t.algorithm.knockoutFamilyLabel}
            </span>{' '}
            : {t.algorithm.knockoutFamilyText}
          </li>
        </ul>
        <p className="text-sm text-gray-600 m-0 mb-2 leading-relaxed">
          {t.algorithm.formulaIntro}
        </p>
        <div className="rounded-xl bg-navy/[0.04] border border-navy/10 px-4 py-3 mb-3 font-mono text-sm text-navy break-all">
          {t.algorithm.formulaLabel}
        </div>
        <p className="text-sm text-gray-600 m-0 mb-2 leading-relaxed">
          {t.algorithm.boundsText}
        </p>
        <p className="text-sm text-gray-600 m-0 leading-relaxed">
          <span className="font-semibold text-navy">
            {t.algorithm.finalFormulaText}
          </span>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-navy m-0 mb-3">
          {t.algorithm.examplesTitle}
        </h2>
        <p className="text-sm text-gray-600 m-0 mb-4 leading-relaxed">
          {t.algorithm.exampleMassText}
        </p>
        <p className="text-sm text-gray-600 m-0 mb-4 leading-relaxed">
          {t.algorithm.exampleHoldUpText}
        </p>
        <p className="text-xs text-gray-500 m-0">
          {t.algorithm.exactValuesText}
        </p>
      </section>

      <p className="text-sm text-gray-500 m-0">
        {t.algorithm.faqPrefix}{' '}
        <Link to="/faq" className="text-indigo-600 font-medium hover:underline">
          {t.algorithm.faqLink}
        </Link>
        {t.algorithm.faqSuffix}
      </p>
    </div>
  )
}

export default AlgorithmPage
