import { getPermissions } from '../auth/session'

export function can(permission) {
  const permissions = getPermissions()
  if (permissions.includes('*')) return true
  return permissions.includes(permission)
}

export function canReadFinancials() {
  return can('financials:read')
}

export function canRefund() {
  return can('payments:refund')
}
