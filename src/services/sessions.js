import { apiDownload, apiGet, apiPost } from '../api/client'

export async function fetchSessions(params) {
  return apiGet('/admin/sessions', params)
}

export async function fetchSession(id) {
  return apiGet(`/admin/sessions/${id}`)
}

export async function fetchSessionStats(params) {
  return apiGet('/admin/sessions/stats', params)
}

export async function exportSessionsCsv(params) {
  return apiDownload('/admin/sessions/export.csv', params, 'sessions.csv')
}

export async function refundSession(id, reason) {
  return apiPost(`/admin/sessions/${id}/refund`, reason ? { reason } : {})
}

/** @deprecated use fetchSessionStats */
export async function fetchSessionStatusMix(params) {
  return fetchSessionStats(params)
}
