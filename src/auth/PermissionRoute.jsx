import { Navigate, Outlet } from 'react-router-dom'
import { can } from '../lib/permissions'

/** Route guard that requires a specific permission (or `*`). */
export default function PermissionRoute({ permission }) {
  if (!can(permission)) {
    return <Navigate to="/forbidden" replace />
  }
  return <Outlet />
}
