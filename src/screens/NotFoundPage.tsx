import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const NotFound = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <span className="text-5xl mb-3">🤔</span>
      <h1 className="text-xl font-extrabold text-navy mb-2">
        {t.notFound.title}
      </h1>
      <p className="text-sm text-gray-400 mb-5">{t.notFound.description}</p>
      <button
        className="inline-flex items-center gap-2 font-semibold rounded-full border-none cursor-pointer transition-all duration-150 bg-navy text-white py-2 px-5 text-sm hover:bg-navy-light"
        onClick={() => navigate('/')}
      >
        {t.notFound.action}
      </button>
    </div>
  )
}

export default NotFound
