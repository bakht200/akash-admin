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
