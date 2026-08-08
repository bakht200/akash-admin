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

export function getRefreshToken() {
  return getSession()?.refreshToken ?? null
}

export function getCurrentUser() {
  return getSession()?.user ?? null
}

export function getPermissions() {
  return getSession()?.permissions ?? []
}

/**
 * Display name for the admin. The API returns firstName/lastName, which are nullable
 * for a seeded account that has never been edited, so fall back to the email rather
 * than rendering an empty string.
 */
function displayName(admin) {
  const full = [admin?.firstName, admin?.lastName].filter(Boolean).join(' ').trim()
  return full || admin?.email || 'Admin'
}

/**
 * Store the result of POST /admin/auth/oauth or /admin/auth/refresh.
 *
 * Permissions come from the API, which resolves them from the account's role. They are
 * not derived here: the mapping is deliberately non-obvious — the plain admin role is
 * excluded from the money-sensitive permissions — so a second copy of that table in the
 * dashboard would drift and show controls the server rejects.
 *
 * They govern presentation only. Every request is authorized server-side.
 */
export function saveAuthResult({ accessToken, refreshToken, admin }) {
  setSession({
    accessToken,
    refreshToken: refreshToken ?? getRefreshToken(),
    user: { ...admin, name: displayName(admin) },
    permissions: admin?.permissions ?? [],
  })
  return getSession()
}

/** Replace the profile without touching tokens — used after GET /admin/auth/me. */
export function updateStoredAdmin(admin) {
  const current = getSession()
  if (!current) return null
  setSession({
    ...current,
    user: { ...admin, name: displayName(admin) },
    permissions: admin?.permissions ?? current.permissions ?? [],
  })
  return getSession()
}
