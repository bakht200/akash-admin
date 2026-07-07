import { apiGet, apiPatch, apiPost } from '../api/client'
import { withMockFallback } from '../api/mock'

export async function fetchReviews(params) {
  return withMockFallback(() => apiGet('/admin/reviews', params), () => ({ items: [], total: 0 }), params)
}

export async function flagReview(id, reason) {
  return withMockFallback(
    () => apiPost(`/admin/reviews/${id}/flag`, { reason }),
    () => ({ ok: true, id, reason }),
    { id, reason },
  )
}

export async function hideReview(id, hidden) {
  return withMockFallback(
    () => apiPatch(`/admin/reviews/${id}`, { isVisible: !hidden }),
    () => ({ ok: true, id, hidden }),
    { id, hidden },
  )
}
