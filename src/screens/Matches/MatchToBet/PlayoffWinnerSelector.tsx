import { useLanguage } from '../../../contexts/LanguageContext'

interface PlayoffWinnerSelectorProps {
  teamAName: string | null
  teamBName: string | null
  value: 'A' | 'B' | null
  onChange: (winner: 'A' | 'B') => void
}

const PLAYOFF_WINNER_SIDES: Array<'A' | 'B'> = ['A', 'B']

const PlayoffWinnerSelector = ({
  teamAName,
  teamBName,
  value,
  onChange,
}: PlayoffWinnerSelectorProps) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-wide text-center">
        {t.matches.playoffWinner}
      </p>
      <div className="flex gap-2">
        {PLAYOFF_WINNER_SIDES.map((side) => {
          const name = side === 'A' ? teamAName : teamBName
          const selected = value === side
          return (
            <button
              key={side}
              type="button"
              onClick={() => onChange(side)}
              className={[
                'flex-1 py-2 rounded-[10px] text-xs font-bold border-[1.5px] transition-all duration-150',
                selected
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-gray-50 border-gray-200 text-navy hover:border-indigo-300',
              ].join(' ')}
            >
              {name ?? t.common.tbd}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PlayoffWinnerSelector
