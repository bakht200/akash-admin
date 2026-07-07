import axios from 'axios'
import { getAccessToken, clearSession } from '../auth/session'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export async function apiGet(path, params) {
  const { data } = await apiClient.get(path, { params })
  return data
}

export async function apiPost(path, body) {
  const { data } = await apiClient.post(path, body)
  return data
}

export async function apiPatch(path, body) {
  const { data } = await apiClient.patch(path, body)
  return data
}

export async function apiDelete(path) {
  const { data } = await apiClient.delete(path)
  return data
}
