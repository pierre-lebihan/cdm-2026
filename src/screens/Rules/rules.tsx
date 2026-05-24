import { Link } from 'react-router-dom'
import Bonus from './bonus'
import Groups from './groups'
import Playoff from './playoff'
import Subscription from './subscription'
import Mascot from '../../components/Mascot'
import { MASCOT_LIST } from '../../lib/mascots'

const Rules = () => (
  <div className="max-w-[600px] mx-auto py-8 px-4 pb-12">
    <div className="text-center mb-8">
      <div className="flex justify-center -space-x-4 mb-3">
        {MASCOT_LIST.map((m) => (
          <Mascot
            key={m.id}
            id={m.id}
            size="md"
            className="ring-4 ring-cream shadow-md"
          />
        ))}
      </div>
      <h1 className="text-2xl font-extrabold text-navy mb-2">
        Règles du jeu
      </h1>
      <p className="text-sm text-gray-500 m-0 mb-3">
        Sam, Diego et Pierre t'expliquent comment pronostiquer
      </p>
      <Link
        to="/rules/algorithm"
        className="text-sm font-semibold text-indigo-600 hover:underline"
      >
        Règlement détaillé et algorithme →
      </Link>
    </div>

    <div className="flex flex-col gap-5">
      <Subscription />
      <Groups />
      <Playoff />
      <Bonus />
    </div>
  </div>
)

export default Rules
