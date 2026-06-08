import { useMemo, useRef, useState, useEffect } from 'react'
import find from 'lodash/find'
import { ChevronDown, Search } from 'lucide-react'
import Flag from '../../../components/Flag'
import { getFinalWinnerEligibleTeams, useTeams } from '../../../hooks/teams'
import { useLanguage } from '../../../contexts/LanguageContext'

interface FinalWinnerChoiceProps {
  userTeam: string | null | undefined
  disabled: boolean
  onTeamSelect: (teamId: string) => void
}

const FinalWinnerChoice = ({
  userTeam,
  disabled,
  onTeamSelect,
}: FinalWinnerChoiceProps) => {
  const { t } = useLanguage()
  const teams = useTeams()
  const eligibleTeams = useMemo(() => {
    return getFinalWinnerEligibleTeams(teams)
  }, [teams])
  const selectedTeam = find(eligibleTeams, (t) => t.id === userTeam)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredTeams = useMemo(() => {
    if (!search) return eligibleTeams
    const q = search.toLowerCase()
    return eligibleTeams.filter((t) => t.name.toLowerCase().includes(q))
  }, [eligibleTeams, search])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        e.target instanceof Node &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [open])

  const handleSelect = (teamId: string) => {
    onTeamSelect(teamId)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {selectedTeam && (
        <Flag country={selectedTeam.code} className="h-16 mx-auto mb-3" />
      )}

      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-2.5 px-3.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-white transition-all hover:border-gray-300 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            className={selectedTeam ? 'text-navy font-medium' : 'text-gray-400'}
          >
            {selectedTeam ? selectedTeam.name : t.finalWinner.selectTeam}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-64 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <Search size={14} className="text-gray-300 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.finalWinner.searchPlaceholder}
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
            <div className="overflow-y-auto py-1">
              {filteredTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                    team.id === userTeam
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelect(team.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <Flag
                      country={team.code}
                      className="w-5 h-4 object-contain rounded-sm shrink-0"
                    />
                    <span>{team.name}</span>
                  </div>
                  {team.winOdd && (
                    <span
                      className={`text-xs ${team.id === userTeam ? 'text-indigo-600' : 'text-gray-400'}`}
                    >
                      {Math.round(team.winOdd / 10) * 10}
                    </span>
                  )}
                </button>
              ))}
              {filteredTeams.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-3">
                  {t.finalWinner.noTeamFound}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedTeam?.winOdd && (
        <p className="text-xs font-semibold text-indigo-500 mt-2">
          {t.finalWinner.odd} : {Math.round(selectedTeam.winOdd / 10) * 10}
        </p>
      )}
    </div>
  )
}

export default FinalWinnerChoice
