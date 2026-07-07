import { apiGet, apiPost } from '../api/client'
import { withMockFallback } from '../api/mock'

export async function fetchNotificationLogs(params) {
  return withMockFallback(() => apiGet('/admin/notifications', params), () => ({ items: [], total: 0 }), params)
}

export async function retryNotification(id) {
  return withMockFallback(
    () => apiPost(`/admin/notifications/${id}/retry`),
    () => ({ ok: true, id }),
    id,
  )
}
