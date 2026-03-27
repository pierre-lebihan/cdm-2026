interface PlayoffWinnerSelectorProps {
  teamAName: string | null
  teamBName: string | null
  value: 'A' | 'B' | null
  onChange: (winner: 'A' | 'B') => void
}

const PlayoffWinnerSelector = ({
  teamAName,
  teamBName,
  value,
  onChange,
}: PlayoffWinnerSelectorProps) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-wide text-center">
      Vainqueur (prolongations / tirs au but)
    </p>
    <div className="flex gap-2">
      {(['A', 'B'] as const).map((side) => {
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
            {name ?? 'À déterminer'}
          </button>
        )
      })}
    </div>
  </div>
)

export default PlayoffWinnerSelector
