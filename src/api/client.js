import axios from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearSession,
} from '../auth/session'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await axios.post(`${API_BASE}/admin/auth/refresh`, { refreshToken })
  const payload = data?.data ?? data
  if (!payload?.accessToken || !payload?.refreshToken) {
    throw new Error('Invalid refresh response')
  }
  setTokens(payload.accessToken, payload.refreshToken)
  return payload.accessToken
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = String(original?.url ?? '')

    const isAuthEndpoint =
      url.includes('/admin/auth/oauth') ||
      url.includes('/admin/auth/refresh') ||
      url.includes('/admin/auth/logout')

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const accessToken = await refreshPromise
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch {
        clearSession()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login')
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

/** Unwrap `{ success, data }` object responses. Passes through list envelopes. */
export function unwrap(body) {
  if (body == null) return body
  if (Object.prototype.hasOwnProperty.call(body, 'items')) {
    return {
      success: body.success ?? true,
      items: body.items ?? [],
      pagination: body.pagination ?? {
        page: 1,
        limit: body.limit ?? body.items?.length ?? 0,
        total: body.total ?? body.items?.length ?? 0,
        totalPages: body.totalPages ?? 1,
      },
      ...(body.meta != null ? { meta: body.meta } : {}),
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, 'data')) {
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

/** Download a binary/CSV response and trigger a browser save. */
export async function apiDownload(path, params, filename = 'export.csv') {
  const response = await apiClient.get(path, {
    params,
    responseType: 'blob',
    validateStatus: (s) => (s >= 200 && s < 300) || s === 413,
  })

  if (response.status === 413) {
    const err = new Error('Export exceeds the row limit. Narrow your filters and try again.')
    err.response = response
    throw err
  }

  const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return { blob, filename }
}
