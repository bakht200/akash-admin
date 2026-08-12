import { useEffect, useMemo, useState } from 'react'
import { can as canPermission } from '../lib/permissions'
import { getCurrentUser, getPermissions, getSession } from '../auth/session'

export function usePermissions() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1)
    window.addEventListener('akash-admin:session', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('akash-admin:session', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  return useMemo(() => {
    void tick
    void getSession()
    return {
      user: getCurrentUser(),
      permissions: getPermissions(),
      can: canPermission,
      canReadFinancials: () => canPermission('financials:read'),
      canRefund: () => canPermission('payments:refund'),
      canReadPractitioners: () => canPermission('practitioners:read'),
      canWritePractitioners: () => canPermission('practitioners:write'),
      canReadClients: () => canPermission('clients:read'),
      canWriteClients: () => canPermission('clients:write'),
      canSuspendUsers: () => canPermission('users:suspend'),
      canReadSessions: () => canPermission('sessions:read'),
      canOverrideCommission: () => canPermission('commission:override'),
      canRetryPayout: () => canPermission('payouts:retry'),
      canReadSettings: () => canPermission('settings:read'),
      canWriteSettings: () => canPermission('settings:write'),
      canReadModalities: () => canPermission('modalities:read'),
      canWriteModalities: () => canPermission('modalities:write'),
      canReadReviews: () => canPermission('reviews:read'),
      canFlagReviews: () => canPermission('reviews:flag'),
      canHideReviews: () => canPermission('reviews:hide'),
      canReadNotifications: () => canPermission('notifications:read'),
      canWriteNotifications: () => canPermission('notifications:write'),
    }
  }, [tick])
}
