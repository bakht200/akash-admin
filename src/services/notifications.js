import { apiDownload, apiGet, apiPost } from '../api/client'

export async function fetchNotificationLogs(params) {
  return apiGet('/admin/notifications', params)
}

export async function fetchNotificationKpis(params) {
  return apiGet('/admin/notifications/kpis', params)
}

export async function exportNotificationsCsv(params) {
  return apiDownload('/admin/notifications/export.csv', params, 'notifications.csv')
}

/** Retry a failed provider delivery. `type` is `push` or `email` (email returns 422 in v1). */
export async function retryNotification(type, id) {
  return apiPost(`/admin/notifications/${type}/${id}/retry`)
}

export async function fetchAdminActionNotifications(params = {}) {
  const response = await apiGet('/admin/notifications/action-items', params)
  return response?.data ?? response
}

export async function fetchAdminActionUnreadCount() {
  const response = await apiGet('/admin/notifications/action-items/unread-count')
  return response?.data?.unreadCount ?? response?.unreadCount ?? 0
}

export async function markAdminActionNotificationRead(id) {
  const response = await apiPost(`/admin/notifications/action-items/${id}/read`)
  return response?.data ?? response
}
