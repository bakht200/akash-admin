import { apiGet, apiPost } from '../api/client'
import { paginate, withMockFallback } from '../api/mock'
import { SESSION_LIST_ROWS, SESSION_TOTAL, getSessionDetail } from '../data/sessionData'

export async function fetchSessions(params) {
  return withMockFallback(
    () => apiGet('/admin/sessions', params),
    (p) => ({ ...paginate(SESSION_LIST_ROWS, p), total: SESSION_TOTAL }),
    params,
  )
}

export async function fetchSession(id) {
  return withMockFallback(
    () => apiGet(`/admin/sessions/${id}`),
    () => getSessionDetail(id),
    id,
  )
}

export async function refundSession(id, reason) {
  return withMockFallback(
    () => apiPost(`/admin/sessions/${id}/refund`, { reason }),
    () => ({ ok: true, id }),
    { id, reason },
  )
}

export async function fetchSessionStatusMix() {
  return withMockFallback(
    () => apiGet('/admin/sessions/status-mix'),
    () => [
      { label: 'completed', pct: 72 },
      { label: 'cancelled', pct: 14 },
      { label: 'no_show', pct: 4 },
      { label: 'other', pct: 10 },
    ],
    {},
  )
}
