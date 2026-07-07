import { useMemo } from 'react'
import { can as canPermission } from '../lib/permissions'
import { getCurrentUser, getPermissions } from '../auth/session'

export function usePermissions() {
  const user = getCurrentUser()
  const permissions = getPermissions()

  return useMemo(
    () => ({
      user,
      permissions,
      can: canPermission,
      canReadFinancials: () => canPermission('financials:read'),
      canRefund: () => canPermission('payments:refund'),
    }),
    [user, permissions],
  )
}
