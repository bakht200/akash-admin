import {
  isAuthed,
  clearSession,
  getCurrentUser,
  getPermissions,
  getAccessToken,
  getRefreshToken,
  saveAuthResult,
  updateStoredAdmin,
} from './session'
import {
  signInWithProvider,
  signOutOfFirebase,
  isFirebaseConfigured,
  isAppleSignInEnabled,
} from './firebase'
import { apiPost, apiGet } from '../api/client'

export {
  isAuthed,
  getCurrentUser,
  getPermissions,
  getAccessToken,
  getRefreshToken,
  isFirebaseConfigured,
  isAppleSignInEnabled,
}

/**
 * Sign in with an OAuth provider, then exchange the Firebase token for this app's admin
 * session. 'google' and 'apple' are the providers the API recognises.
 *
 * The stored token is the backend's, not Firebase's: it carries the role and permissions
 * the route guards read, and the API accepts only it.
 */
export async function loginWithProvider(providerId = 'google') {
  const idToken = await signInWithProvider(providerId)

  let response
  try {
    response = await apiPost('/admin/auth/oauth', {
      idToken,
      deviceInfo: navigator.userAgent?.slice(0, 255),
    })
  } catch (error) {
    // The Google account is valid but not an admin. Drop the Firebase session too,
    // otherwise the next attempt silently reuses it and appears to fail for no reason.
    await signOutOfFirebase()
    throw error
  }

  const data = response?.data ?? response
  if (!data?.accessToken) {
    await signOutOfFirebase()
    throw new Error('Sign-in succeeded but the server returned no access token.')
  }
  return saveAuthResult(data)
}

/** Kept as the common case; delegates to loginWithProvider. */
export async function loginWithGoogle() {
  return loginWithProvider('google')
}

/** Refresh the access token. Returns the new one, or null if the session is finished. */
export async function refreshSession() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  const response = await apiPost('/admin/auth/refresh', { refreshToken })
  const data = response?.data ?? response
  if (!data?.accessToken) return null

  saveAuthResult({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    admin: data.admin ?? getCurrentUser(),
  })
  return data.accessToken
}

/** Re-read the profile so a role or permission change lands without a re-login. */
export async function reloadCurrentAdmin() {
  const response = await apiGet('/admin/auth/me')
  const admin = (response?.data ?? response)?.admin
  return admin ? updateStoredAdmin(admin) : null
}

/**
 * Clear the session locally and in Firebase, and tell the backend so the refresh token
 * is revoked. Local state is cleared regardless of whether that call succeeds.
 */
export async function logout() {
  try {
    if (getAccessToken()) await apiPost('/admin/auth/logout', {})
  } catch {
    // A network failure must not leave the browser stuck signed in.
  }
  await signOutOfFirebase()
  clearSession()
}

/**
 * Kept for the existing call site in the sidebar, which calls setAuthed(null) to log
 * out. Only falsy values are meaningful — authentication happens via loginWithGoogle.
 */
export function setAuthed(value) {
  if (!value) {
    // Fire and forget: the caller navigates immediately after this returns.
    void logout()
  }
}
