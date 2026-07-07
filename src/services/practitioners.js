import { apiGet, apiPatch, apiPost } from '../api/client'
import { paginate, withMockFallback } from '../api/mock'
import { practitionerListRows, getPractitionerProfile } from '../data/practitionerData'

export async function fetchPractitioners(params) {
  return withMockFallback(
    () => apiGet('/admin/practitioners', params),
    (p) => paginate(practitionerListRows, p),
    params,
  )
}

export async function fetchPractitioner(id) {
  return withMockFallback(
    () => apiGet(`/admin/practitioners/${id}`),
    () => getPractitionerProfile(id),
    id,
  )
}

export async function suspendPractitioner(id, reason) {
  return withMockFallback(
    () => apiPost(`/admin/practitioners/${id}/suspend`, { reason }),
    () => ({ ok: true, id, reason }),
    { id, reason },
  )
}

export async function reactivatePractitioner(id) {
  return withMockFallback(
    () => apiPost(`/admin/practitioners/${id}/reactivate`),
    () => ({ ok: true, id }),
    id,
  )
}

export async function updatePractitionerModeration(id, payload) {
  return withMockFallback(
    () => apiPatch(`/admin/practitioners/${id}/moderation`, payload),
    () => ({ ok: true, id, ...payload }),
    { id, payload },
  )
}
