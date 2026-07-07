const SESSION_KEY = 'my-portal:session'

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  localStorage.setItem('my-portal:isAuthed', '1')
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('my-portal:isAuthed')
}

export function isAuthed() {
  return Boolean(getSession()?.accessToken)
}

export function getAccessToken() {
  return getSession()?.accessToken ?? null
}

export function getCurrentUser() {
  return getSession()?.user ?? null
}

export function getPermissions() {
  return getSession()?.permissions ?? []
}

/** Mock login until P1 OAuth lands — preserves dev access. */
export function mockLogin(email, password) {
  const role =
    email.includes('finance') ? 'finance' : email.includes('admin') ? 'admin' : 'super_admin'
  const permissionsByRole = {
    super_admin: ['*'],
    admin: ['users:read', 'users:write', 'sessions:read', 'financials:read', 'payments:refund'],
    finance: ['financials:read', 'payments:refund', 'sessions:read'],
  }
  setSession({
    accessToken: 'mock-token',
    user: { email, role, name: 'Admin User' },
    permissions: permissionsByRole[role] ?? permissionsByRole.admin,
  })
  return getSession()
}
