import { Routes, Route } from 'react-router-dom'
import User from './User'

export default function Index() {
  return (
    <Routes>
      <Route path="/:id/matches/:matchId" element={<User />} />
      <Route path="/:id" element={<User />} />
    </Routes>
  )
}
