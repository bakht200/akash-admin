import { io } from 'socket.io-client'
import { getAccessToken } from '../auth/session'

/**
 * Resolve the Socket.io origin from the API base (strip `/api/v1`).
 * Override with VITE_SOCKET_URL when the socket host differs from the REST API.
 */
export function getAdminSocketOrigin() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return String(import.meta.env.VITE_SOCKET_URL).replace(/\/$/, '')
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  if (apiBase.startsWith('http')) {
    try {
      const url = new URL(apiBase)
      return url.origin
    } catch {
      return window.location.origin
    }
  }
  return window.location.origin
}

/**
 * Connect to the `/admin` Socket.io namespace with the admin bearer token.
 * Returns null when there is no access token.
 */
export function connectAdminSocket() {
  const token = getAccessToken()
  if (!token) return null

  const origin = getAdminSocketOrigin()
  return io(`${origin}/admin`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 2000,
  })
}
