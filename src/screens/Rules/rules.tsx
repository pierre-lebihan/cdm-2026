import { Link } from 'react-router-dom'
import Bonus from './bonus'
import Groups from './groups'
import Playoff from './playoff'
import Subscription from './subscription'

const Rules = () => (
  <div className="max-w-[600px] mx-auto py-8 px-4 pb-12">
    <div className="text-center mb-8">
      <div className="text-4xl mb-3">📋</div>
      <h1 className="text-2xl font-extrabold text-navy mb-2">
        Règles du jeu
      </h1>
      <p className="text-sm text-gray-500 m-0 mb-3">
        Tout ce qu'il faut savoir pour pronostiquer
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
