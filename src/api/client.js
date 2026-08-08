import axios from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  clearSession,
  saveAuthResult,
  getCurrentUser,
} from '../auth/session'

// Must include the /api/v1 prefix — request paths start at /admin/...
// The old fallback of '/api' resolved against the dashboard's own host, so a build
// with this unset produced 404s that looked like backend faults.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Endpoints that must never trigger a token refresh: refreshing on their 401 would
// recurse, and a failed sign-in is not an expired session.
const NO_REFRESH = ['/admin/auth/refresh', '/admin/auth/oauth']

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function goToLogin() {
  clearSession()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}

// One refresh at a time. Several requests failing together must not each start their
// own refresh — the backend rotates the refresh token, so the later ones would present
// a token already consumed and log the user out mid-session.
let refreshInFlight = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  // A bare client on purpose: using apiClient here would re-enter these interceptors.
  const { data } = await axios.post(
    `${API_BASE}/admin/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
  )
  const payload = data?.data ?? data
  if (!payload?.accessToken) return null

  saveAuthResult({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    admin: payload.admin ?? getCurrentUser(),
  })
  return payload.accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (status !== 401 || !original) return Promise.reject(error)
    if (original._retriedAfterRefresh) return Promise.reject(error)
    if (NO_REFRESH.some((path) => (original.url ?? '').includes(path))) {
      goToLogin()
      return Promise.reject(error)
    }
    if (!getRefreshToken()) {
      goToLogin()
      return Promise.reject(error)
    }

    try {
      refreshInFlight = refreshInFlight ?? refreshAccessToken()
      const token = await refreshInFlight
      if (!token) {
        goToLogin()
        return Promise.reject(error)
      }
      original._retriedAfterRefresh = true
      original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
      return apiClient(original)
    } catch (refreshError) {
      goToLogin()
      return Promise.reject(refreshError)
    } finally {
      refreshInFlight = null
    }
  },
)

/**
 * Return the payload, not the transport envelope.
 *
 * The API answers `{ success: true, data: … }`. Callers want the `data`, and every
 * caller previously received the envelope while the fixtures they were written against
 * returned the payload — so real responses were consistently one level too deep. That
 * mismatch was invisible while any failure fell back to fixtures.
 *
 * A body without both keys is passed through untouched, so an endpoint that does not
 * use the envelope still works.
 */
function unwrap(body) {
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data
  }
  return body
}

export async function apiGet(path, params) {
  const { data } = await apiClient.get(path, { params })
  return unwrap(data)
}

export async function apiPost(path, body) {
  const { data } = await apiClient.post(path, body)
  return unwrap(data)
}

export async function apiPatch(path, body) {
  const { data } = await apiClient.patch(path, body)
  return unwrap(data)
}

export async function apiDelete(path) {
  const { data } = await apiClient.delete(path)
  return unwrap(data)
}
