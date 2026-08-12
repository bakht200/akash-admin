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

export function canReadPractitioners() {
  return can('practitioners:read')
}

export function canWritePractitioners() {
  return can('practitioners:write')
}

export function canReadClients() {
  return can('clients:read')
}

export function canWriteClients() {
  return can('clients:write')
}

export function canSuspendUsers() {
  return can('users:suspend')
}

export function canReadSessions() {
  return can('sessions:read')
}

export function canOverrideCommission() {
  return can('commission:override')
}

export function canRetryPayout() {
  return can('payouts:retry')
}

export function canReadSettings() {
  return can('settings:read')
}

export function canWriteSettings() {
  return can('settings:write')
}

export function canReadModalities() {
  return can('modalities:read')
}

export function canWriteModalities() {
  return can('modalities:write')
}

export function canReadReviews() {
  return can('reviews:read')
}

export function canFlagReviews() {
  return can('reviews:flag')
}

export function canHideReviews() {
  return can('reviews:hide')
}

export function canReadNotifications() {
  return can('notifications:read')
}

export function canWriteNotifications() {
  return can('notifications:write')
}
