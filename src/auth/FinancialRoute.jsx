import { Navigate, Outlet } from 'react-router-dom'
import { canReadFinancials } from '../lib/permissions'

export default function FinancialRoute() {
  if (!canReadFinancials()) {
    return <Navigate to="/forbidden" replace />
  }
  return <Outlet />
}
