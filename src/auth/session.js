const SESSION_KEY = 'akash-admin:session'

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
    // Migrate legacy key once
    const legacy = localStorage.getItem('my-portal:session')
    if (legacy) {
      const parsed = JSON.parse(legacy)
      localStorage.setItem(SESSION_KEY, legacy)
      localStorage.removeItem('my-portal:session')
      localStorage.removeItem('my-portal:isAuthed')
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('akash-admin:session'))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('my-portal:session')
  localStorage.removeItem('my-portal:isAuthed')
  window.dispatchEvent(new Event('akash-admin:session'))
}

export function isAuthed() {
  return Boolean(getSession()?.accessToken)
}

export function getAccessToken() {
  return getSession()?.accessToken ?? null
}

export function getRefreshToken() {
  return getSession()?.refreshToken ?? null
}

export function setTokens(accessToken, refreshToken) {
  const current = getSession() ?? {}
  setSession({ ...current, accessToken, refreshToken })
}

export function getCurrentUser() {
  return getSession()?.user ?? getSession()?.admin ?? null
}

export function getPermissions() {
  return getSession()?.permissions ?? []
}

/**
 * Persist an authenticated admin session from OAuth /me payloads.
 * Accepts either `{ accessToken, refreshToken, admin }` or an admin-only `/me` update.
 */
export function applyAuthSession({ accessToken, refreshToken, admin, permissions } = {}) {
  const current = getSession() ?? {}
  const nextAdmin = admin ?? current.admin ?? current.user
  const nextPermissions =
    permissions ??
    admin?.permissions ??
    current.permissions ??
    permissionsForRole(nextAdmin?.role)

  const name = [nextAdmin?.firstName, nextAdmin?.lastName].filter(Boolean).join(' ') || nextAdmin?.email || 'Admin'

  setSession({
    accessToken: accessToken ?? current.accessToken,
    refreshToken: refreshToken ?? current.refreshToken,
    admin: nextAdmin,
    user: {
      id: nextAdmin?.id,
      email: nextAdmin?.email,
      role: nextAdmin?.role,
      name,
      firstName: nextAdmin?.firstName,
      lastName: nextAdmin?.lastName,
      avatarUrl: nextAdmin?.avatarUrl,
      isActive: nextAdmin?.isActive,
    },
    permissions: nextPermissions,
  })
  return getSession()
}

/** Client-side RBAC fallback when the API does not return an explicit permissions array. */
export function permissionsForRole(role) {
  switch (role) {
    case 'super_admin':
      return ['*']
    case 'admin':
      return [
        'practitioners:read',
        'practitioners:write',
        'clients:read',
        'clients:write',
        'users:suspend',
        'sessions:read',
        'financials:read',
        'settings:read',
        'settings:write',
        'modalities:read',
        'modalities:write',
        'reviews:read',
        'reviews:flag',
        'reviews:hide',
        'notifications:read',
        'notifications:write',
      ]
    case 'finance':
      return [
        'financials:read',
        'payments:refund',
        'payouts:retry',
        'commission:override',
        'practitioners:read',
        'clients:read',
        'sessions:read',
      ]
    default:
      return []
  }
}
