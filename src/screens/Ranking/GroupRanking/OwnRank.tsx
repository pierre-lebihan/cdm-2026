import findIndex from 'lodash/findIndex'
import size from 'lodash/size'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'

interface OwnRankProps {
  opponents: Array<{ id: string; score?: number | null }>
}

const OwnRank = ({ opponents }: OwnRankProps) => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const uid = user?.id
  const rank = findIndex(opponents, { id: uid }) + 1
  const rankSuffix =
    rank === 1 ? t.ranking.ownRankFirstSuffix : t.ranking.ownRankOtherSuffix

  return (
    <p className="text-xs font-semibold text-gray-500 text-right mb-2">
      {rank}
      <sup>{rankSuffix}</sup> {t.ranking.ownRankSuffix} {size(opponents)}{' '}
      {t.ranking.playerPlural}
    </p>
  )
}

export default OwnRank
